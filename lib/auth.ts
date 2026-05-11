import { prisma } from "@/lib/prisma";
import jwt from "@elysiajs/jwt";
import Elysia, { status } from "elysia";
import type { User } from "@prisma/client";

// ---------------------------------------------------------------------------
// Elysia auth setup — returns a new Elysia with JWT + user derivation attached.
// Use as:  const app = withAuth(new Elysia({ prefix: "/api/..." }))
// The inline function-call chain preserves TypeScript inference of `user`.
// ---------------------------------------------------------------------------

export function withAuth(app: Elysia) {
  return app
    .use(
      jwt({
        name: "jwt",
        secret: process.env.JWT_KEY!,
      })
    )
    .onBeforeHandle(async ({ jwt, cookie: { auth } }) => {
      const payload = await jwt.verify(auth.value as string);
      if (!payload || typeof payload !== "object" || !("id" in payload)) {
        return status("Unauthorized");
      }
    })
    .derive(async ({ jwt, cookie: { auth } }) => {
      const payload = (await jwt.verify(auth.value as string)) as {
        id: number;
      } | false;
      if (!payload || typeof payload !== "object" || !("id" in payload)) {
        return status("Unauthorized") as any;
      }
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
      });
      if (!user) return status("Bad Request") as any;
      return { user };
    });
}

// ---------------------------------------------------------------------------
// Role guards — return Elysia status responses when access is denied
// ---------------------------------------------------------------------------

export function requireAdmin(user: User) {
  if (user.role !== "ADMIN") return status("Unauthorized");
}

export function requireCourseOwner(user: User, courseEducatorId: number) {
  if (user.role !== "ADMIN" && courseEducatorId !== user.id)
    return status("Unauthorized");
}

// ---------------------------------------------------------------------------
// Plain Next.js route handler helpers (for non-Elysia API routes)
// ---------------------------------------------------------------------------

/**
 * Verify the auth cookie and return the current user, or null if unauthenticated.
 * Decodes (does not verify) the JWT payload — use only in non-Elysia route handlers.
 */
export async function getUserFromCookies(
  cookieStore: { get: (name: string) => { value: string } | undefined }
): Promise<User | null> {
  const token = cookieStore.get("auth")?.value;
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.id) return null;

    return prisma.user.findUnique({ where: { id: payload.id } });
  } catch {
    return null;
  }
}
