import { Separator } from "@heroui/react";
import { api as courseApi } from "@/app/api/course/[[...slug]]/route";
import { api as userApi } from "@/app/api/user/[[...slug]]/route";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import CoursesList from "./CoursesList";

export default async function CoursesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token) {
    redirect("/login");
  }

  const [userRes, enrolledRes, allRes, teachingRes] = await Promise.all([
    userApi.user.get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
    courseApi.course.enrolled.get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
    courseApi.course.all.get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
    courseApi.course.teaching.get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }).catch(() => ({ data: [] })),
  ]);

  if (userRes.status !== 200) {
    unauthorized();
  }

  const user = userRes.data!;

  // Educators see their teaching courses as the primary list;
  // Students see their enrolled courses.
  const enrolledCourses =
    user.role === "EDUCATOR"
      ? (teachingRes.data ?? []) as any[]
      : (enrolledRes.data ?? []) as any[];

  const availableCourses =
    user.role === "EDUCATOR"
      ? []
      : (allRes.data as any[]) ?? [];

  return (
    <>
      <h1 className="text-2xl font-bold">Courses</h1>
      <Separator />
      <CoursesList
        userRole={user.role as string}
        enrolledCourses={enrolledCourses}
        availableCourses={availableCourses}
      />
    </>
  );
}
