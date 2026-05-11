import { ChevronRight } from "@gravity-ui/icons";
import Link from "next/link";

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-(--tt-color-text-gray) mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3 h-3" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-(--tt-brand-color-500) transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-(--tt-color-text)">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
