import { api } from "@/app/api/inbox/[[...slug]]/route";
import { Surface } from "@heroui/react";
import { cookies } from "next/headers";

export default async function ({ params }: { params: Promise<{ id: string | number }> }) {


  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;

  const { id } = await params

  const mail = (await api.inbox({ id }).get({ fetch: { headers: { 'cookie': `auth=${token}` } } })).data

  return (
    <>
      <Surface
          className="flex min-w-[320px] flex-col gap-3 rounded-3xl border p-6"
          variant="transparent"
        >
        <div>
          From: {mail?.sender}
        </div>
        <div>
          Date: {mail?.date.toLocaleDateString()}
        </div>
      </Surface>
      <Surface
          className="flex min-w-[320px] flex-col gap-3 rounded-3xl border p-6"
          variant="transparent"
        >
        <div dangerouslySetInnerHTML={{ __html: mail?.content.content ?? '' }} />
      </Surface>
    </>
  )
}