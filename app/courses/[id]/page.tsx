import { Button, Separator, Surface } from "@heroui/react";
import { ArrowUpRightFromSquare, Calendar, FileCheck, FileText, PencilToSquare } from "@gravity-ui/icons";
import { api } from "@/app/api/course/[[...slug]]/route";
import { api as userApi } from "@/app/api/user/[[...slug]]/route";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import EnrollButton from "./EnrollButton";
import { AssignmentUpload } from "./AssignmentUpload";
import Breadcrumbs from "@/app/components/Breadcrumbs";

type Section = {
  id: string;
  title: string;
  content: string;
};

type Resource = {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  deadline: string;
};

type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
};

type CourseContent = {
  sections?: Section[];
  announcements?: Announcement[];
  resources?: Resource[];
  assignments?: Assignment[];
};

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string | number }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  const { id } = await params;

  const [courseRes, enrolledRes, userRes] = await Promise.all([
    api.course({ id }).get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
    token
      ? api.course.enrolled.get({
          fetch: { headers: { cookie: `auth=${token}` } },
        })
      : Promise.resolve({ data: [] }),
    token
      ? userApi.user.get({
          fetch: { headers: { cookie: `auth=${token}` } },
        })
      : Promise.resolve({ data: undefined }),
  ]);

  if (!courseRes.data) {
    notFound();
  }

  const course = courseRes.data as any;
  const currentUser = userRes.data as any;
  const enrolledCourses = (enrolledRes.data ?? []) as Array<{ id: number }>;

  // User can view content if enrolled, or if they are the educator/admin of this course
  const isEnrolled =
    enrolledCourses.some((c) => c.id === course.id) ||
    (currentUser && (currentUser.role === "ADMIN" || course.educatorId === currentUser.id));

  // Only actual enrolled students (not educators) can submit assignments
  const isStudent = enrolledCourses.some((c) => c.id === course.id);
  const content = (course.content ?? {}) as CourseContent;
  const sections = content.sections ?? [];
  const announcements = content.announcements ?? [];
  const resources = content.resources ?? [];
  const assignments = content.assignments ?? [];

  // Fetch existing submissions for students who are enrolled
  let submissions: any[] = [];
  if (isStudent && token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      submissions = await prisma.assignmentSubmission.findMany({
        where: { courseId: Number(id), userId: payload.id },
        orderBy: { submittedAt: "desc" },
      });
    } catch {}
  }

  function getSubmission(assignmentId: string) {
    return submissions.find((s) => s.assignmentId === assignmentId) ?? null;
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: currentUser?.role === "ADMIN" ? "/admin/dashboard" : "/courses" },
          { label: "Courses", href: "/courses" },
          { label: `${course.code} — ${course.name}` },
        ]}
      />
      {/* Course header */}
      <div className="max-w-4xl">
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
          {currentUser && (currentUser.role === "ADMIN" || course.educatorId === currentUser.id) ? (
            <div className="flex flex-col items-end gap-2">
              {currentUser.role === "ADMIN" ? (
                <>
                  <Link href={`/admin/courses/${course.id}`}>
                    <Button variant="ghost"><PencilToSquare />Manage Course</Button>
                  </Link>
                  <Link href={`/admin/courses/${course.id}/submissions`}>
                    <Button variant="ghost"><FileCheck />Submissions</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href={`/educator/courses/${course.id}/content`}>
                    <Button variant="ghost"><PencilToSquare />Manage Course</Button>
                  </Link>
                  <Link href={`/educator/courses/${course.id}/submissions`}>
                    <Button variant="ghost"><FileCheck />Submissions</Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <EnrollButton courseId={course.id} isEnrolled={isEnrolled} />
          )}
        </div>

        <Separator className="mb-8" />

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

        {/* Sections */}
        {sections.length > 0 && (
          <div className="flex flex-col gap-4 mb-8">
            <h2 className="text-xl font-bold">Sections</h2>
            {sections.map((s) => (
              <Link key={s.id} href={`/courses/${id}/sections/${s.id}`}>
                <Surface className="rounded-2xl border border-(--tt-card-border-color) p-6 hover:bg-(--tt-brand-color-50) transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{s.title || "Untitled"}</h3>
                    <span className="text-(--tt-color-text-gray) text-lg">&rarr;</span>
                  </div>
                </Surface>
              </Link>
            ))}
          </div>
        )}

        {/* Resources */}
        {resources.length > 0 && (
          <div className="flex flex-col gap-4 mb-8">
            <h2 className="text-xl font-bold">Resources</h2>
            {resources.map((r) => (
              <Surface key={r.id} className="rounded-2xl border border-(--tt-card-border-color) p-6">
                <h3 className="font-semibold text-lg mb-3">{r.title || "Untitled"}</h3>
                {r.fileUrl ? (
                  <a
                    href={r.fileUrl}
                    download={r.fileName}
                    className="inline-flex items-center gap-2 p-3 rounded-xl bg-(--tt-brand-color-50) hover:bg-(--tt-brand-color-100) transition-colors"
                  >
                    <ArrowUpRightFromSquare className="w-4 h-4 text-(--tt-brand-color-500) shrink-0" />
                    <span className="font-medium">{r.fileName || "Download"}</span>
                  </a>
                ) : (
                  <p className="text-sm text-(--tt-color-text-gray)">No file available.</p>
                )}
              </Surface>
            ))}
          </div>
        )}

        {/* Assignments */}
        {assignments.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Assignments</h2>
            {assignments.map((a) => (
              <Surface key={a.id} className="rounded-2xl border border-(--tt-card-border-color) p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-(--tt-color-text-orange)" />
                  <h3 className="font-semibold text-lg">{a.title || "Untitled"}</h3>
                </div>
                <div className="mt-3 space-y-3">
                  {a.description && (
                    <p className="text-(--tt-color-text-gray)">{a.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {a.deadline && (
                      <span className="inline-flex items-center gap-1 text-(--tt-color-text-gray)">
                        <Calendar className="w-4 h-4" />
                        Due: {new Date(a.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {isStudent && (
                    <AssignmentUpload
                      courseId={course.id}
                      assignmentId={a.id}
                      existingSubmission={getSubmission(a.id)}
                    />
                  )}
                </div>
              </Surface>
            ))}
          </div>
        )}

        {/* Empty state */}
        {announcements.length === 0 && sections.length === 0 && resources.length === 0 && assignments.length === 0 && (
          <div className="text-center py-16 text-(--tt-color-text-gray)">
            <p className="text-lg">No content has been added to this course yet.</p>
            <p className="text-sm mt-2">
              The educator will add learning materials, resources, and activities here.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
