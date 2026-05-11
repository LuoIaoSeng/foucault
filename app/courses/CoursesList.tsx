"use client";

import { BookOpen, GraduationCap } from "@gravity-ui/icons";
import { Chip, Surface } from "@heroui/react";
import Link from "next/link";
import EnrollButton from "./[id]/EnrollButton";

type CourseSummary = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  semester: string;
  educator?: { firstname: string | null; lastname: string } | null;
  faculty?: { code: string } | null;
  enrollments?: Array<{ id: number }>;
};

export default function CoursesList({
  userRole,
  enrolledCourses,
  availableCourses,
}: {
  userRole: string;
  enrolledCourses: CourseSummary[];
  availableCourses: CourseSummary[];
}) {
  const enrolledIds = new Set(enrolledCourses.map((c) => c.id));

  if (enrolledCourses.length === 0 && availableCourses.length === 0) {
    return (
      <div className="text-center py-16 text-(--tt-color-text-gray)">
        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg">No courses available.</p>
        <p className="text-sm mt-2">
          {userRole === "EDUCATOR"
            ? "You are not assigned to any courses yet."
            : "Ask an administrator to enroll you in courses."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl flex flex-col gap-8">
      {/* Your Courses (enrolled or teaching) */}
      {enrolledCourses.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-(--tt-brand-color-500)" />
            {userRole === "EDUCATOR" ? "Courses You Teach" : "Your Courses"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {enrolledCourses.map((course) => (
              <CourseCard key={course.id} course={course} isEnrolled />
            ))}
          </div>
        </div>
      )}

      {/* Available Courses (for students / employees) */}
      {userRole !== "EDUCATOR" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-(--tt-color-text-gray)" />
            Available Courses
          </h2>
          {availableCourses.filter((c) => !enrolledIds.has(c.id)).length === 0 ? (
            <div className="text-center py-8 text-(--tt-color-text-gray)">
              <p>No additional courses available.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {availableCourses
                .filter((c) => !enrolledIds.has(c.id))
                .map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CourseCard({
  course,
  isEnrolled = false,
}: {
  course: CourseSummary;
  isEnrolled?: boolean;
}) {
  return (
    <Surface className="rounded-2xl border border-(--tt-card-border-color) p-5 flex flex-col gap-3 hover:shadow-(--tt-shadow-elevated-md) transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Chip size="sm" variant="primary">{course.code}</Chip>
            <span className="text-xs text-(--tt-color-text-gray)">{course.semester}</span>
          </div>
          <Link
            href={`/courses/${course.id}`}
            className="font-semibold hover:text-(--tt-brand-color-500) transition-colors"
          >
            {course.name}
          </Link>
          {course.description && (
            <p className="text-sm text-(--tt-color-text-gray) mt-1 line-clamp-2">
              {course.description}
            </p>
          )}
        </div>
        {!isEnrolled && (
          <EnrollButton courseId={course.id} isEnrolled={false} />
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-(--tt-color-text-gray)">
        {course.educator && (
          <span>
            {course.educator.firstname} {course.educator.lastname}
          </span>
        )}
        {course.faculty && (
          <span className="px-2 py-0.5 rounded-full bg-(--tt-brand-color-50) text-(--tt-brand-color-600)">
            {course.faculty.code}
          </span>
        )}
        {course.enrollments && (
          <span>{course.enrollments.length} student{course.enrollments.length !== 1 ? "s" : ""}</span>
        )}
      </div>
    </Surface>
  );
}
