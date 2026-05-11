import { Button, Surface } from "@heroui/react";
import { ArrowLeft } from "@gravity-ui/icons";
import { api } from "@/app/api/course/[[...slug]]/route";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/app/components/Breadcrumbs";

type Section = {
  id: string;
  title: string;
  content: string;
};

export default async function SectionDetailPage({
  params,
}: {
  params: Promise<{ id: string; sectionId: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  const { id, sectionId } = await params;

  const courseRes = await api.course({ id }).get({
    fetch: { headers: { cookie: `auth=${token}` } },
  });

  if (!courseRes.data) notFound();

  const course = courseRes.data as any;
  const content = course.content ?? {};
  const sections: Section[] = content.sections ?? [];
  const section = sections.find((s) => s.id === sectionId);

  if (!section) notFound();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Courses", href: "/courses" },
          { label: `${course.code} — ${course.name}`, href: `/courses/${id}` },
          { label: section.title || "Untitled" },
        ]}
      />
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/courses/${id}`}>
            <Button isIconOnly variant="ghost" size="sm">
              <ArrowLeft />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{section.title || "Untitled"}</h1>
          </div>
        </div>

        <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
          <div
            className="prose max-w-none text-(--tt-color-text-gray)"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        </Surface>
      </div>
    </>
  );
}
