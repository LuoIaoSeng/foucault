import { Separator } from "@heroui/react";
import { api } from "@/app/api/course/[[...slug]]/route";
import { api as userApi } from "@/app/api/user/[[...slug]]/route";
import { cookies } from "next/headers";
import { unauthorized } from "next/navigation";
import AddCourseForm from "./AddCourseForm";
import CourseTable from "./CourseTable";

export default async function CoursesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  const [coursesRes, userRes] = await Promise.all([
    api.course.all.get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
    userApi.user.get({
      fetch: { headers: { cookie: `auth=${token}` } },
    }),
  ]);

  if (coursesRes.status !== 200 || userRes.status !== 200) {
    unauthorized();
  }

  const user = userRes.data!;
  const courses =
    user.role === "EDUCATOR"
      ? (coursesRes.data! as any[]).filter((c: any) => c.educatorId === user.id)
      : (coursesRes.data! as any[]);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
        {user.role === "ADMIN" && <AddCourseForm />}
      </div>
      <Separator />
      <CourseTable courses={courses} />
    </>
  );
}
