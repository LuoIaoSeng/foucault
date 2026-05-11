import { ArrowLeft, ArrowUpRightFromSquare } from "@gravity-ui/icons";
import { Button, Separator, Surface } from "@heroui/react";
import { api } from "@/app/api/course/[[...slug]]/route";
import { api as userApi } from "@/app/api/user/[[...slug]]/route";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, unauthorized } from "next/navigation";
import Breadcrumbs from "@/app/components/Breadcrumbs";

type Assignment = {
  id: string;
  title: string;
  description: string;
  deadline: string;
};

export default async function EducatorSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
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
  const course = courseRes.data as any;
  const user = userRes.data;

  if (user.role !== "ADMIN" && course.educatorId !== user.id) unauthorized();

  const content = course.content ?? {};
  const assignments: Assignment[] = content.assignments ?? [];

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { courseId: parseInt(id) },
    include: {
      user: { select: { id: true, username: true, firstname: true, lastname: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  function getSubmissionsForAssignment(assignmentId: string) {
    return submissions.filter((s) => s.assignmentId === assignmentId);
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Courses", href: "/courses" },
          { label: `${course.code} — ${course.name}`, href: `/courses/${id}` },
          { label: "Submissions" },
        ]}
      />
      <div className="flex items-center gap-3">
        <Link href={`/educator/courses/${id}`}>
          <Button isIconOnly variant="ghost" size="sm"><ArrowLeft /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Assignment Submissions</h1>
          <p className="text-sm text-(--tt-color-text-gray)">{course.code} — {course.name}</p>
        </div>
      </div>
      <Separator />

      {assignments.length === 0 ? (
        <div className="text-center py-16 text-(--tt-color-text-gray)">
          <p className="text-lg">No assignments have been created for this course.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 max-w-4xl">
          {assignments.map((assignment) => {
            const subs = getSubmissionsForAssignment(assignment.id);
            return (
              <Surface key={assignment.id} className="rounded-2xl border border-(--tt-card-border-color) p-6">
                <h2 className="text-lg font-semibold mb-1">{assignment.title || "Untitled"}</h2>
                {assignment.deadline && (
                  <p className="text-sm text-(--tt-color-text-gray) mb-4">
                    Due: {new Date(assignment.deadline).toLocaleDateString()}
                  </p>
                )}
                {subs.length === 0 ? (
                  <p className="text-sm text-(--tt-color-text-gray) py-4">No submissions yet.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {subs.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-(--tt-brand-color-50)">
                        <div>
                          <p className="font-medium text-sm">
                            {sub.user.firstname} {sub.user.lastname}
                          </p>
                          <p className="text-xs text-(--tt-color-text-gray)">
                            @{sub.user.username} &middot; {new Date(sub.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <a href={sub.fileUrl} download={sub.fileName} className="flex items-center gap-1 text-sm text-(--tt-brand-color-500) hover:underline font-medium">
                          <ArrowUpRightFromSquare className="w-4 h-4" />
                          {sub.fileName}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </Surface>
            );
          })}
        </div>
      )}
    </>
  );
}
