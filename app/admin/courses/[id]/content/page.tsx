import { Separator } from "@heroui/react";
import { api } from "@/app/api/course/[[...slug]]/route";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ContentEditor } from "./ContentEditor";

export default async function CourseContentPage({
  params,
}: {
  params: Promise<{ id: string | number }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  const { id } = await params;

  const res = await api.course({ id }).get({
    fetch: { headers: { cookie: `auth=${token}` } },
  });

  if (!res.data) notFound();

  const course = {
    id: (res.data as any).id,
    code: (res.data as any).code,
    name: (res.data as any).name,
    educatorId: (res.data as any).educatorId,
    semester: (res.data as any).semester,
    description: (res.data as any).description,
    facultyId: (res.data as any).facultyId,
    content: (res.data as any).content,
  };

  return (
    <>
      <ContentEditor course={course} />
    </>
  );
}
