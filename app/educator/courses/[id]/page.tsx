import { ArrowLeft, FileCheck, PencilToSquare } from "@gravity-ui/icons";
import { Button, Separator, Surface } from "@heroui/react";
import { api } from "@/app/api/course/[[...slug]]/route";
import { api as userApi } from "@/app/api/user/[[...slug]]/route";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import Breadcrumbs from "@/app/components/Breadcrumbs";

export default async function EducatorCourseInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;
  if (!token) redirect("/login");

  const { id } = await params;

  const [courseRes, userRes] = await Promise.all([
    api.course({ id }).get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
    userApi.user.get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
  ]);

  if (!courseRes.data || !userRes.data) unauthorized();
  const course = courseRes.data as any;
  const user = userRes.data;

  if (user.role !== "ADMIN" && course.educatorId !== user.id) unauthorized();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Courses", href: "/courses" },
          { label: `${course.code} — ${course.name}`, href: `/courses/${id}` },
          { label: "Course Info" },
        ]}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/courses/${id}`}>
            <Button isIconOnly variant="ghost" size="sm"><ArrowLeft /></Button>
          </Link>
          <h1 className="text-2xl font-bold">Course Info</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/educator/courses/${id}/content`}>
            <Button><PencilToSquare />Edit Sections</Button>
          </Link>
          <Link href={`/educator/courses/${id}/submissions`}>
            <Button variant="ghost"><FileCheck />Submissions</Button>
          </Link>
        </div>
      </div>
      <Separator />

      <div className="max-w-3xl">
        <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
          <h3 className="text-lg font-semibold mb-6">Course Details</h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Course Code" value={course.code} />
              <Field label="Semester" value={course.semester} />
            </div>
            <Field label="Course Name" value={course.name} />
            <Field label="Description" value={course.description ?? "—"} />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Educator"
                value={`${course.educator?.firstname ?? ""} ${course.educator?.lastname ?? ""}`.trim() || "—"}
              />
              <Field label="Faculty" value={course.faculty ? `${course.faculty.code} — ${course.faculty.name}` : "—"} />
            </div>
            <Field
              label="Teaching Assistants"
              value={course.tas?.length > 0 ? course.tas.map((t: any) => `${t.firstname} ${t.lastname}`).join(", ") : "—"}
            />
            <Field
              label="Enrollment"
              value={`${course.enrollments?.length ?? 0} student(s)`}
            />
          </div>
        </Surface>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-(--tt-color-text-gray) uppercase tracking-wider">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
