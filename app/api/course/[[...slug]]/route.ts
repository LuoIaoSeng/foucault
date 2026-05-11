import { prisma } from "@/lib/prisma";
import { withAuth, requireAdmin, requireCourseOwner } from "@/lib/auth";
import { treaty } from "@elysiajs/eden";
import { JsonObject } from "@prisma/client/runtime/client";
import Elysia, { status, t } from "elysia";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const courseBody = t.Object({
  code: t.String(),
  name: t.String(),
  description: t.Optional(t.String()),
  content: t.Optional(t.Any()),
  semester: t.String(),
  educatorId: t.Integer(),
  facultyId: t.Optional(t.Integer()),
  taIds: t.Optional(t.Array(t.Integer())),
});

const contentBody = t.Object({
  content: t.Any(),
});

// ---------------------------------------------------------------------------
// App definition
// ---------------------------------------------------------------------------

export const app = withAuth(new Elysia({ prefix: "/api/course" }))

  // =========================================================================
  // COLLECTION ENDPOINTS
  // =========================================================================

  // GET /api/course/all — List all courses (admin overview)
  .get("/all", async () => {
    return prisma.course.findMany({
      include: { educator: true, tas: true, faculty: true, enrollments: true },
      orderBy: { createAt: "desc" },
    });
  })

  // GET /api/course/teaching — Courses taught by the authenticated educator
  .get("/teaching", async ({ user }) => {
    return prisma.course.findMany({
      where: { educatorId: user.id },
      include: { faculty: true, enrollments: true },
      orderBy: { semester: "desc" },
    });
  })

  // GET /api/course/enrolled — Courses the authenticated user is enrolled in
  .get("/enrolled", async ({ user }) => {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: { course: { include: { educator: true } } },
      orderBy: { enrolledAt: "desc" },
    });
    return enrollments.map((e) => e.course);
  })

  // POST /api/course — Create a new course (admin only)
  .post(
    "/",
    async ({ user, body }) => {
      const denied = requireAdmin(user);
      if (denied) return denied;

      return prisma.course.create({
        data: {
          code: body.code,
          name: body.name,
          description: body.description,
          content: body.content as JsonObject,
          semester: body.semester,
          educatorId: body.educatorId,
          facultyId: body.facultyId ?? null,
          tas: body.taIds
            ? { connect: body.taIds.map((id) => ({ id })) }
            : undefined,
        },
        include: { educator: true, tas: true, faculty: true, enrollments: true },
      });
    },
    { body: courseBody }
  )

  // =========================================================================
  // SINGLE RESOURCE ENDPOINTS
  // =========================================================================

  // GET /api/course/:id — Get a single course by ID
  .get("/:id", async ({ params: { id } }) => {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: { educator: true, tas: true, faculty: true, enrollments: true },
    });
    if (!course) return status(404);
    return course;
  })

  // PUT /api/course/:id — Update a course (admin or owning educator)
  .put(
    "/:id",
    async ({ user, params: { id }, body }) => {
      const course = await prisma.course.findUnique({
        where: { id: parseInt(id) },
      });
      if (!course) return status(404);

      const denied = requireCourseOwner(user, course.educatorId);
      if (denied) return denied;

      const updateData: any = {
        code: body.code,
        name: body.name,
        description: body.description,
        content: body.content as JsonObject,
        semester: body.semester,
        educatorId: body.educatorId,
        facultyId: body.facultyId ?? null,
      };

      if (body.taIds !== undefined) {
        updateData.tas = {
          set: [],
          connect: body.taIds.map((id) => ({ id })),
        };
      }

      return prisma.course.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: { educator: true, tas: true, faculty: true, enrollments: true },
      });
    },
    { body: courseBody }
  )

  // PATCH /api/course/:id/content — Update only the content field (admin or educator)
  .patch(
    "/:id/content",
    async ({ user, params: { id }, body }) => {
      const course = await prisma.course.findUnique({
        where: { id: parseInt(id) },
      });
      if (!course) return status(404);

      const denied = requireCourseOwner(user, course.educatorId);
      if (denied) return denied;

      return prisma.course.update({
        where: { id: parseInt(id) },
        data: { content: body.content as JsonObject },
      });
    },
    { body: contentBody }
  )

  // DELETE /api/course/:id — Delete a course (admin only)
  .delete("/:id", async ({ user, params: { id } }) => {
    const denied = requireAdmin(user);
    if (denied) return denied;

    const courseId = parseInt(id);
    await prisma.enrollment.deleteMany({ where: { courseId } });
    await prisma.course.delete({ where: { id: courseId } });
    return status("OK");
  })

  // =========================================================================
  // SUB-RESOURCE ENDPOINTS
  // =========================================================================

  // POST /api/course/:id/enroll — Enroll the authenticated user in a course
  .post("/:id/enroll", async ({ user, params: { id } }) => {
    const courseId = parseInt(id);
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });
    if (existing) return status("OK");

    await prisma.enrollment.create({
      data: { userId: user.id, courseId },
    });
    return status("OK");
  });

// ---------------------------------------------------------------------------
// Next.js App Router exports
// ---------------------------------------------------------------------------

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const PATCH = app.fetch;
export const DELETE = app.fetch;

export const api =
  typeof process !== "undefined"
    ? treaty(app).api
    : treaty<typeof app>("localhost:3000").api;
