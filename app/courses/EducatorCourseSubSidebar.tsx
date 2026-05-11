"use client";

import { GraduationCap } from "@gravity-ui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

type CourseItem = { id: number; code: string; name: string };

export default function EducatorCourseSubSidebar({
  courses,
}: {
  courses: CourseItem[];
}) {
  const pathname = usePathname();

  return (
    <div className="w-48 shrink-0 flex flex-col gap-1 p-4">
      <p className="text-xs font-semibold text-(--tt-color-text-gray) uppercase tracking-wider mb-2 px-2">
        My Courses
      </p>
      {courses.map((course) => {
        const isActive = pathname === `/courses/${course.id}`;
        return (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className={`button w-full text-left ${isActive ? "button--tertiary" : "button--ghost"}`}
          >
            <span className="w-full text-sm font-medium inline-flex items-center gap-2">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span className="truncate">{course.code}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
