"use client";

import { Persons } from "@gravity-ui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AddUserForm from "./users/AddUserForm";

export default function AdminSubSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-44 shrink-0 flex flex-col gap-1 p-4">
      <Link
        href="/admin/users"
        className={`button w-full ${
          pathname === "/admin/users" ? "button--tertiary" : "button--ghost"
        }`}
      >
        <span className="w-full font-semibold inline-flex items-center gap-3">
          <Persons />
          All Users
        </span>
      </Link>
      <AddUserForm triggerVariant="ghost" triggerClassName="w-full font-semibold" />
    </div>
  );
}
