import { ArrowLeft, FileCheck, PencilToSquare } from "@gravity-ui/icons";
import { Button, Separator } from "@heroui/react";
import { api } from "@/app/api/course/[[...slug]]/route";
import { api as userApi } from "@/app/api/user/[[...slug]]/route";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect, unauthorized } from "next/navigation";
import CourseForm from "@/app/components/CourseForm";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string | number }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token) {
    redirect("/login");
  }

  const { id } = await params;

  const [courseRes, userRes] = await Promise.all([
    api.course({ id }).get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
    userApi.user.get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
  ]);

  if (!courseRes.data || !userRes.data) {
    unauthorized();
  }

  const course = courseRes.data as any;
  const user = userRes.data;

  // Only admin or the course's educator can edit
  if (user.role !== "ADMIN" && course.educatorId !== user.id) {
    unauthorized();
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/courses">
            <Button isIconOnly variant="ghost" size="sm">
              <ArrowLeft />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Course Settings</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/courses/${id}/content`}>
            <Button>
              <PencilToSquare />
              Edit Sections
            </Button>
          </Link>
          <Link href={`/admin/courses/${id}/submissions`}>
            <Button variant="ghost">
              <FileCheck />
              Submissions
            </Button>
          </Link>
        </div>
      </div>
      <Separator />
      <CourseForm course={course as any} />
    </>
  );
}
