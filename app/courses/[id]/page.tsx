import { Separator, Surface } from "@heroui/react";
import { ArrowUpRightFromSquare, Calendar, FileText, Link } from "@gravity-ui/icons";
import { api } from "@/app/api/course/[[...slug]]/route";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import EnrollButton from "./EnrollButton";

type ResourceItem = {
  id: string;
  title: string;
  type: "links" | "assignment";
  links?: { label: string; url: string }[];
  description?: string;
  deadline?: string;
  submissionUrl?: string;
};

type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
};

type CourseContent = {
  description?: string;
  announcements?: Announcement[];
  resources?: ResourceItem[];
};

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
  const content = (course.content ?? {}) as CourseContent;
  const contentHtml = content.description ?? "";
  const announcements = content.announcements ?? [];
  const resources = content.resources ?? [];

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
              {course.faculty ? <> &middot; {course.faculty.code}</> : null}
            </p>
            {course.description && (
              <p className="mt-3 text-(--tt-color-text-gray)">
                {course.description}
              </p>
            )}
          </div>
          <EnrollButton courseId={course.id} isEnrolled={isEnrolled} />
        </div>

        <Separator className="mb-8" />

        {/* Rich content */}
        {contentHtml && (
          <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8 mb-8">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </Surface>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="flex flex-col gap-4 mb-8">
            <h2 className="text-xl font-bold">Announcements</h2>
            {announcements.map((a) => (
              <Surface key={a.id} className="rounded-2xl border border-(--tt-card-border-color) p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{a.title || "Untitled"}</h3>
                  <span className="text-xs text-(--tt-color-text-gray)">{a.date}</span>
                </div>
                {a.content && <p className="text-(--tt-color-text-gray)">{a.content}</p>}
              </Surface>
            ))}
          </div>
        )}

        {/* Resources & Assignments */}
        {resources.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Resources & Assignments</h2>
            {resources.map((r) => (
              <Surface key={r.id} className="rounded-2xl border border-(--tt-card-border-color) p-6">
                <div className="flex items-center gap-2 mb-3">
                  {r.type === "links" ? (
                    <Link className="w-5 h-5 text-(--tt-brand-color-500)" />
                  ) : (
                    <FileText className="w-5 h-5 text-(--tt-color-text-orange)" />
                  )}
                  <h3 className="font-semibold text-lg">{r.title || "Untitled"}</h3>
                </div>

                {r.type === "links" && r.links && (
                  <div className="flex flex-col gap-2 mt-3">
                    {r.links.map((link, j) => (
                      <a
                        key={j}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-xl bg-(--tt-brand-color-50) hover:bg-(--tt-brand-color-100) transition-colors"
                      >
                        <ArrowUpRightFromSquare className="w-4 h-4 text-(--tt-brand-color-500) shrink-0" />
                        <span className="font-medium">{link.label || link.url}</span>
                      </a>
                    ))}
                  </div>
                )}

                {r.type === "assignment" && (
                  <div className="mt-3 space-y-3">
                    {r.description && (
                      <p className="text-(--tt-color-text-gray)">{r.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {r.deadline && (
                        <span className="inline-flex items-center gap-1 text-(--tt-color-text-gray)">
                          <Calendar className="w-4 h-4" />
                          Due: {new Date(r.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {r.submissionUrl && (
                        <a
                          href={r.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-(--tt-brand-color-500) hover:underline font-medium"
                        >
                          <ArrowUpRightFromSquare className="w-4 h-4" />
                          Submit Assignment
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </Surface>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!contentHtml && announcements.length === 0 && resources.length === 0 && (
          <div className="text-center py-16 text-(--tt-color-text-gray)">
            <p className="text-lg">No content has been added to this course yet.</p>
            <p className="text-sm mt-2">
              The educator will add learning materials, resources, and activities here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
