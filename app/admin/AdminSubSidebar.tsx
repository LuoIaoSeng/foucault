"use client";

import { Books, Persons } from "@gravity-ui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AddUserForm from "./users/AddUserForm";

const linkClasses = (active: boolean) =>
  `button w-full ${active ? "button--tertiary" : "button--ghost"}`;

export default function AdminSubSidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname();
  const isAdmin = userRole === "ADMIN";

  return (
    <div className="w-44 shrink-0 flex flex-col gap-1 p-4">
      <Link href="/admin/courses" className={linkClasses(pathname === "/admin/courses")}>
        <span className="w-full font-semibold inline-flex items-center gap-3">
          <Books />
          All Courses
        </span>
      </Link>
      {isAdmin && (
        <>
          <Link href="/admin/users" className={linkClasses(pathname === "/admin/users")}>
            <span className="w-full font-semibold inline-flex items-center gap-3">
              <Persons />
              All Users
            </span>
          </Link>
          <AddUserForm triggerVariant="ghost" triggerClassName="w-full font-semibold" />
        </>
      )}
    </div>
  );
}
