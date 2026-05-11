import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { withAuth, requireAdmin } from "@/lib/auth";
import { treaty } from "@elysiajs/eden";
import bcrypt, { genSalt } from "bcryptjs";
import Elysia, { status, t } from "elysia";
import fs from "node:fs/promises";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const updateProfileBody = t.Object({
  nickname: t.String(),
});

const createUserBody = t.Object({
  username: t.String(),
  password: t.String(),
  firstname: t.String(),
  lastname: t.String(),
  nickname: t.String(),
  role: t.Enum(Role),
  gender: t.String(),
  facultyId: t.Optional(t.Integer()),
  birthday: t.Optional(t.String()),
});

const updateUserBody = t.Object({
  username: t.String(),
  firstname: t.String(),
  lastname: t.String(),
  nickname: t.String(),
  birthday: t.String(),
  gender: t.String(),
  role: t.Enum(Role),
  facultyId: t.Optional(t.Integer()),
});

const avatorBody = t.Object({
  image: t.File({ format: "image/*" }),
});

// ---------------------------------------------------------------------------
// Avatar upload helper
// ---------------------------------------------------------------------------

async function saveAvator(image: { name: string; arrayBuffer(): Promise<ArrayBuffer> }, oldPath?: string | null): Promise<string> {
  const baseUrl = "storage/";
  const ext = await image.name.split(".").at(-1);
  const fileName = `${baseUrl}${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await image.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  await fs.writeFile("./public/" + fileName, buffer);

  if (oldPath) {
    try {
      await fs.rm("./public/" + oldPath);
    } catch {}
  }

  return fileName;
}

// ---------------------------------------------------------------------------
// App definition
// ---------------------------------------------------------------------------

export const app = withAuth(new Elysia({ prefix: "/api/user" }))

  // =========================================================================
  // AUTHENTICATED USER ENDPOINTS
  // =========================================================================

  // GET /api/user — Get current user profile (strips password)
  .get("/", async ({ user }) => {
    const { password, ...profile } = user;
    return profile;
  })

  // PUT /api/user — Update current user's nickname
  .put(
    "/",
    async ({ user, body }) => {
      await prisma.user.update({
        where: { id: user.id },
        data: { nickname: body.nickname },
      });
      return status("OK");
    },
    { body: updateProfileBody }
  )

  // PUT /api/user/upload-avator — Upload/change current user's avatar
  .put(
    "/upload-avator",
    async ({ user, body }) => {
      const avatorPath = await saveAvator(body.image, user.avatorPath);
      await prisma.user.update({
        where: { id: user.id },
        data: { avatorPath },
      });
      return status("OK");
    },
    { body: avatorBody }
  )

  // GET /api/user/faculties — List all faculties
  .get("/faculties", async () => {
    return prisma.faculty.findMany({ orderBy: { name: "asc" } });
  })

  // GET /api/user/users — List all users (basic info, no passwords)
  .get("/users", async () => {
    const users = await prisma.user.findMany();
    return users.map(({ password, ...u }) => u);
  })

  // =========================================================================
  // ADMIN ENDPOINTS (prefix: /admin)
  // =========================================================================

  .group("/admin", (app) =>
    app
      // Admin guard
      .onBeforeHandle(({ user }) => requireAdmin(user))

      // GET /api/user/admin/all — List all users with faculty info
      .get("/all", async () => {
        return prisma.user.findMany({ include: { faculty: true } });
      })

      // GET /api/user/admin/show/:id — Show a single user by ID
      .get("/show/:id", async ({ params: { id } }) => {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(id) },
        });
        if (!user) return status(404);
        return user;
      })

      // POST /api/user/admin/create — Create a new user
      .post(
        "/create",
        async ({ body }) => {
          return prisma.user.create({
            data: {
              username: body.username,
              password: await bcrypt.hash(body.password, await genSalt()),
              firstname: body.firstname,
              lastname: body.lastname,
              nickname: body.nickname,
              role: body.role,
              gender: body.gender,
              facultyId: body.facultyId ?? null,
              birthday: new Date(body.birthday || Date.now()),
              createAt: new Date(),
            },
          });
        },
        { body: createUserBody }
      )

      // PUT /api/user/admin/update/:id — Update a user
      .put(
        "/update/:id",
        async ({ params: { id }, body }) => {
          await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
              username: body.username,
              firstname: body.firstname,
              lastname: body.lastname,
              nickname: body.nickname,
              birthday: new Date(body.birthday),
              gender: body.gender,
              role: body.role,
              facultyId: body.facultyId ?? null,
            },
          });
          return status("OK");
        },
        { body: updateUserBody }
      )

      // DELETE /api/user/admin/delete/:id — Delete a user
      .delete("/delete/:id", async ({ params: { id } }) => {
        const userId = parseInt(id);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return status(404);

        if (user.avatorPath) {
          try {
            await fs.rm("./public/" + user.avatorPath);
          } catch {}
        }

        await prisma.user.delete({ where: { id: userId } });
        return status("OK");
      })

      // PUT /api/user/admin/upload-avator/:id — Upload avatar for any user
      .put(
        "/upload-avator/:id",
        async ({ body, params: { id } }) => {
          const userId = parseInt(id);
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (!user) return status(404);

          const avatorPath = await saveAvator(body.image, user.avatorPath);
          await prisma.user.update({
            where: { id: userId },
            data: { avatorPath },
          });
          return status("OK");
        },
        { body: avatorBody }
      )
  );

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
