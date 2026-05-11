import { Separator } from "@heroui/react";
import { api as courseApi } from "@/app/api/course/[[...slug]]/route";
import { api as userApi } from "@/app/api/user/[[...slug]]/route";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import GlobalSidebar from "../GlobalSidebar";
import CoursesList from "./CoursesList";

export default async function CoursesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token) {
    redirect("/login");
  }

  const [userRes, enrolledRes, allRes] = await Promise.all([
    userApi.user.get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
    courseApi.course.enrolled.get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
    courseApi.course.all.get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
  ]);

  if (userRes.status !== 200) {
    unauthorized();
  }

  const user = userRes.data!;
  const enrolledCourses = (enrolledRes.data ?? []) as any[];
  const availableCourses =
    user.role === "EDUCATOR"
      ? (allRes.data as any[])?.filter((c: any) => c.educatorId === user.id) ?? []
      : (allRes.data as any[]) ?? [];

  return (
    <div className="w-full min-h-screen flex items-stretch">
      <GlobalSidebar user={user} />
      <Separator orientation="vertical" />
      <main className="flex flex-col gap-6 grow p-6 max-h-screen overflow-y-scroll">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Separator />
        <CoursesList
          userRole={user.role as string}
          enrolledCourses={enrolledCourses}
          availableCourses={availableCourses}
        />
      </main>
    </div>
  );
}
