import { prisma } from "@/lib/prisma";
import { treaty } from "@elysiajs/eden";
import jwt from "@elysiajs/jwt";
import { JsonObject } from "@prisma/client/runtime/client";
import Elysia, { status, t } from "elysia";

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

export const app = new Elysia({ prefix: "/api/course" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_KEY!,
    }),
  )
  .onBeforeHandle(async ({ jwt, cookie: { auth } }) => {
    const verify = await jwt.verify(auth.value as string);
    if (!verify) {
      return status("Unauthorized");
    }
  })
  .derive(async ({ jwt, cookie: { auth } }) => {
    const verify = (await jwt.verify(auth.value as string)) as { id: number };
    const user = await prisma.user.findUnique({ where: { id: verify.id } });
    if (!user) {
      return status("Bad Request");
    }
    return { user };
  })
  .resolve(({ user }) => {
    return { user };
  })

  // List all courses (admin)
  .get("/all", async () => {
    return prisma.course.findMany({
      include: { educator: true, tas: true, faculty: true, enrollments: true },
      orderBy: { createAt: "desc" },
    });
  })

  // Get courses taught by current educator
  .get("/teaching", async ({ user }) => {
    return prisma.course.findMany({
      where: { educatorId: user.id },
      include: { faculty: true, enrollments: true },
      orderBy: { semester: "desc" },
    });
  })

  // Get courses the current user is enrolled in
  .get("/enrolled", async ({ user }) => {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: { include: { educator: true } },
      },
      orderBy: { enrolledAt: "desc" },
    });
    return enrollments.map((e) => e.course);
  })

  // Get single course by id
  .get("/:id", async ({ params: { id } }) => {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: { educator: true, tas: true, faculty: true, enrollments: true },
    });
    if (!course) return status(404);
    return course;
  })

  // Create course (admin)
  .post(
    "/",
    async ({ body }) => {
      const course = await prisma.course.create({
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
      return course;
    },
    { body: courseBody },
  )

  // Update course (admin + educator who owns the course)
  .put(
    "/:id",
    async ({ user, params: { id }, body }) => {
      const course = await prisma.course.findUnique({
        where: { id: parseInt(id) },
      });
      if (!course) return status(404);

      // Allow admin or the course's educator to update
      if (user.role !== "ADMIN" && course.educatorId !== user.id) {
        return status("Unauthorized");
      }

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
    { body: courseBody },
  )

  // Delete course (admin only)
  .delete("/:id", async ({ user, params: { id } }) => {
    if (user.role !== "ADMIN") {
      return status("Unauthorized");
    }
    const courseId = parseInt(id);
    await prisma.enrollment.deleteMany({ where: { courseId } });
    await prisma.course.delete({ where: { id: courseId } });
    return status("OK");
  })

  // Enroll current user in a course
  .post("/enroll/:id", async ({ user, params: { id } }) => {
    const courseId = parseInt(id);
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });
    if (existing) return status("OK");

    await prisma.enrollment.create({
      data: { userId: user.id, courseId },
    });
    return status("OK");
  })

  // Update course content (educator can customize content sections)
  .put(
    "/content/:id",
    async ({ user, params: { id }, body }) => {
      const course = await prisma.course.findUnique({
        where: { id: parseInt(id) },
      });
      if (!course) return status(404);
      if (course.educatorId !== user.id && user.role !== "ADMIN") {
        return status("Unauthorized");
      }

      await prisma.course.update({
        where: { id: parseInt(id) },
        data: { content: body.content as JsonObject },
      });
      return status("OK");
    },
    {
      body: t.Object({
        content: t.Any(),
      }),
    },
  );

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const PATCH = app.fetch;
export const DELETE = app.fetch;

export const api =
  typeof process !== "undefined"
    ? treaty(app).api
    : treaty<typeof app>("localhost:3000").api;
