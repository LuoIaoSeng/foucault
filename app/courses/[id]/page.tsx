import { Separator, Surface } from "@heroui/react";
import { api } from "@/app/api/course/[[...slug]]/route";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import EnrollButton from "./EnrollButton";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string | number }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  const { id } = await params;

  const [courseRes, enrolledRes] = await Promise.all([
    api.course({ id }).get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
    token
      ? api.course.enrolled.get({
          fetch: { headers: { cookie: `auth=${token}` } },
        })
      : Promise.resolve({ data: [] }),
  ]);

  if (!courseRes.data) {
    notFound();
  }

  const course = courseRes.data as any;
  const enrolledCourses = (enrolledRes.data ?? []) as Array<{ id: number }>;
  const isEnrolled = enrolledCourses.some((c) => c.id === course.id);
  const contentHtml = course.content?.description ?? course.content ?? "";

  return (
    <div className="min-h-screen bg-(--tt-bg-color)">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Course header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <span className="text-sm font-semibold text-(--tt-brand-color-500) uppercase tracking-wider">
              {course.semester}
            </span>
            <h1 className="text-3xl font-bold mt-1">{course.name}</h1>
            <p className="text-(--tt-color-text-gray) mt-1">
              {course.code} &middot;{" "}
              {course.educator?.firstname} {course.educator?.lastname}
            </p>
            {course.description && (
              <p className="mt-3 text-(--tt-color-text-gray)">
                {course.description}
              </p>
            )}
          </div>
          <EnrollButton
            courseId={course.id}
            isEnrolled={isEnrolled}
          />
        </div>

        <Separator className="mb-8" />

        {/* Course content */}
        {contentHtml ? (
          <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </Surface>
        ) : (
          <div className="text-center py-16 text-(--tt-color-text-gray)">
            <p className="text-lg">No content has been added to this course yet.</p>
            <p className="text-sm mt-2">
              The educator will add learning materials, resources, and
              activities here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
