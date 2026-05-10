'use client'

import { PaperPlane, PencilToSquare, Tray } from "@gravity-ui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const folders = [
  { icon: <Tray />, label: "Inbox", href: "/inbox" },
  { icon: <PaperPlane />, label: "Sent", href: "/inbox/sent" },
  { icon: <PencilToSquare />, label: "Compose", href: "/inbox/compose" },
];

export default function InboxSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-44 shrink-0 flex flex-col gap-1 p-4">
      {folders.map((folder) => (
        <Link
          key={folder.href}
          href={folder.href}
          className={`button w-full ${
            folder.href === pathname ? "button--tertiary" : "button--ghost"
          }`}
        >
          <span className="w-full font-semibold inline-flex items-center gap-3">
            {folder.icon}
            {folder.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
