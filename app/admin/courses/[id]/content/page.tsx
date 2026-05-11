import { Separator } from "@heroui/react";
import { api } from "@/app/api/course/[[...slug]]/route";
import { api as userApi } from "@/app/api/user/[[...slug]]/route";
import { cookies } from "next/headers";
import { notFound, unauthorized } from "next/navigation";
import { ContentEditor } from "@/app/components/ContentEditor";

export default async function CourseContentPage({
  params,
}: {
  params: Promise<{ id: string | number }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  const { id } = await params;

  const [courseRes, userRes] = await Promise.all([
    api.course({ id }).get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
    userApi.user.get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
  ]);

  if (!courseRes.data || !userRes.data) notFound();

  const courseData = courseRes.data as any;
  const user = userRes.data;

  // Only admin or the course's educator can edit content
  if (user.role !== "ADMIN" && courseData.educatorId !== user.id) {
    unauthorized();
  }

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
      <ContentEditor course={course} />
    </>
  );
}
