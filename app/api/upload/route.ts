import { getUserFromCookies } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

// ---------------------------------------------------------------------------
// POST /api/upload — Upload a file (authenticated users only)
// Returns { url, fileName } for the saved file.
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const user = await getUserFromCookies(await cookies());
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${timestamp}_${safeName}`;
  const filepath = path.join(process.cwd(), "public", "uploads", filename);

  await writeFile(filepath, buffer);

  return NextResponse.json({
    url: `/uploads/${filename}`,
    fileName: file.name,
  });
}
