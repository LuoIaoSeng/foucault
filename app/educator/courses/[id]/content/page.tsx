import { ArrowLeft, CircleInfo, FileCheck } from "@gravity-ui/icons";
import { Button } from "@heroui/react";
import { api } from "@/app/api/course/[[...slug]]/route";
import { api as userApi } from "@/app/api/user/[[...slug]]/route";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import { ContentEditor } from "@/app/components/ContentEditor";
import Breadcrumbs from "@/app/components/Breadcrumbs";

export default async function EducatorContentPage({
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
  const courseData = courseRes.data as any;
  const user = userRes.data;

  if (user.role !== "ADMIN" && courseData.educatorId !== user.id) unauthorized();

  const course = {
    id: courseData.id,
    code: courseData.code,
    name: courseData.name,
    educatorId: courseData.educatorId,
    semester: courseData.semester,
    description: courseData.description,
    facultyId: courseData.facultyId,
    content: courseData.content,
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Courses", href: "/courses" },
          { label: `${course.code} — ${course.name}`, href: `/courses/${id}` },
          { label: "Edit Sections" },
        ]}
      />
      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-4">
        <Link href={`/courses/${id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft /> Back to Course</Button>
        </Link>
        <Link href={`/educator/courses/${id}`}>
          <Button variant="ghost" size="sm"><CircleInfo /> Course Info</Button>
        </Link>
        <Link href={`/educator/courses/${id}/submissions`}>
          <Button variant="ghost" size="sm"><FileCheck /> Submissions</Button>
        </Link>
      </div>
      <ContentEditor course={course} backUrl={`/educator/courses/${id}/content`} hideBack />
    </>
  );
}
