import { Separator } from "@heroui/react";
import { api as courseApi } from "@/app/api/course/[[...slug]]/route";
import { api as userApi } from "@/app/api/user/[[...slug]]/route";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import GlobalSidebar from "../GlobalSidebar";
import EducatorCourseSubSidebar from "../courses/EducatorCourseSubSidebar";

export default async function EducatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token) {
    redirect("/login");
  }

  const [userRes, teachingRes] = await Promise.all([
    userApi.user.get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
    courseApi.course.teaching.get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }).catch(() => ({ data: [] })),
  ]);

  if (userRes.status !== 200 || !userRes.data) {
    unauthorized();
  }

  const user = userRes.data as any;
  if (!["ADMIN", "EDUCATOR"].includes(user.role ?? "")) {
    unauthorized();
  }

  const teachingCourses: Array<{ id: number; code: string; name: string }> =
    (teachingRes.data ?? []) as any[];

  return (
    <div className="w-full min-h-screen flex items-stretch">
      <GlobalSidebar user={user} />
      <Separator orientation="vertical" />
      {user?.role === "EDUCATOR" && teachingCourses.length > 0 && (
        <>
          <EducatorCourseSubSidebar courses={teachingCourses} />
          <Separator orientation="vertical" />
        </>
      )}
      <main className="flex flex-col gap-6 grow p-6 max-h-screen overflow-y-scroll">
        {children}
      </main>
    </div>
  );
}
