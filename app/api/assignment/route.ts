import { getUserFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

// ---------------------------------------------------------------------------
// POST /api/assignment — Submit an assignment file (students only)
// Accepts multipart/form-data: file, assignmentId, courseId
// Upserts so re-submission overwrites the previous file.
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const user = await getUserFromCookies(await cookies());
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const assignmentId = formData.get("assignmentId") as string | null;
  const courseId = formData.get("courseId") as string | null;

  if (!file || !assignmentId || !courseId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${timestamp}_${safeName}`;
  const filepath = path.join(process.cwd(), "public", "uploads", filename);

  await writeFile(filepath, buffer);

  const submission = await prisma.assignmentSubmission.upsert({
    where: { assignmentId_userId: { assignmentId, userId: user.id } },
    create: {
      assignmentId,
      courseId: parseInt(courseId),
      userId: user.id,
      fileUrl: `/uploads/${filename}`,
      fileName: file.name,
    },
    update: {
      fileUrl: `/uploads/${filename}`,
      fileName: file.name,
      submittedAt: new Date(),
    },
  });

  return NextResponse.json({ submission });
}

// ---------------------------------------------------------------------------
// GET /api/assignment?courseId=&assignmentId=
// Students see only their own submissions.
// Educators / Admins see all submissions for the course.
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const user = await getUserFromCookies(await cookies());
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  const assignmentId = searchParams.get("assignmentId");

  if (!courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  const isEducator = ["ADMIN", "EDUCATOR", "EMPLOYEE"].includes(user.role);

  const submissions = await prisma.assignmentSubmission.findMany({
    where: {
      courseId: parseInt(courseId),
      ...(assignmentId ? { assignmentId } : {}),
      ...(isEducator ? {} : { userId: user.id }),
    },
    include: {
      user: {
        select: { id: true, username: true, firstname: true, lastname: true },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ submissions });
}
