import { Separator } from "@heroui/react";
import { api } from "@/app/api/inbox/[[...slug]]/route";
import { cookies } from "next/headers";
import SentMailTable from "./SentMailTable";

export default async function () {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  const mails = (
    await api.inbox.sent.get({
      fetch: {
        headers: {
          "Content-Type": "application/json",
          cookie: `auth=${token}`,
        },
      },
    })
  ).data as Array<{
    id: number;
    title: string;
    receivers: string[];
    date: Date;
  }>;

  return (
    <>
      <h1 className="text-2xl font-bold">Sent</h1>
      <Separator />
      <SentMailTable mails={mails} />
    </>
  );
}
