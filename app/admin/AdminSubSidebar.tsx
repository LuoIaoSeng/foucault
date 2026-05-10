"use client";

import { House, Persons } from "@gravity-ui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { icon: <House />, label: "Dashboard", href: "/admin/dashboard" },
  { icon: <Persons />, label: "Users", href: "/admin/users" },
];

export default function AdminSubSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-44 shrink-0 flex flex-col gap-1 p-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`button w-full ${
            link.href === pathname ? "button--tertiary" : "button--ghost"
          }`}
        >
          <span className="w-full font-semibold inline-flex items-center gap-3">
            {link.icon}
            {link.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
