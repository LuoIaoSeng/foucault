import { ArrowLeft, ArrowUturnCcwLeft } from "@gravity-ui/icons";
import { Button, Separator, Surface } from "@heroui/react";
import { api } from "@/app/api/inbox/[[...slug]]/route";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function MailDetailPage({
  params,
}: {
  params: Promise<{ id: string | number }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  const { id } = await params;

  const mail = (
    await api.inbox({ id }).get({
      fetch: { headers: { cookie: `auth=${token}` } },
    })
  ).data;

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/inbox">
            <Button isIconOnly variant="ghost" size="sm">
              <ArrowLeft />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {mail?.content?.title ?? "No subject"}
          </h1>
        </div>
        <Link href="/inbox/compose">
          <Button variant="ghost">
            <ArrowUturnCcwLeft />
            Reply
          </Button>
        </Link>
      </div>
      <Separator />

      <Surface
        className="flex min-w-[320px] flex-col gap-2 rounded-2xl border p-6"
        variant="transparent"
      >
        <div className="flex items-center gap-4 text-sm">
          <span className="font-semibold">{mail?.sender}</span>
          <span className="text-(--tt-color-text-gray)">
            {mail?.date ? new Date(mail.date).toLocaleString() : ""}
          </span>
        </div>
      </Surface>

      <Surface
        className="flex min-w-[320px] flex-col gap-3 rounded-2xl border p-6 grow"
        variant="transparent"
      >
        <div dangerouslySetInnerHTML={{ __html: mail?.content?.content ?? "" }} />
      </Surface>
    </>
  );
}