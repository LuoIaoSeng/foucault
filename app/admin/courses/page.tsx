import { Separator } from "@heroui/react";
import { api } from "@/app/api/course/[[...slug]]/route";
import { cookies } from "next/headers";
import { unauthorized } from "next/navigation";
import AddCourseForm from "./AddCourseForm";
import CourseTable from "./CourseTable";

export default async function CoursesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  const res = await api.course.all.get({
    fetch: { headers: { cookie: `auth=${token}` } },
  });

  if (res.status !== 200) {
    unauthorized();
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
        <AddCourseForm />
      </div>
      <Separator />
      <CourseTable courses={res.data!} />
    </>
  );
}
