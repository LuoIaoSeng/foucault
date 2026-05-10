import { PencilToSquare } from "@gravity-ui/icons";
import { Button, Separator } from "@heroui/react";
import { api } from "../api/inbox/[[...slug]]/route";
import { cookies } from "next/headers";
import Link from "next/link";
import Mailtable from "./MailTable";

export default async function () {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  const mails = (
    await api.inbox.get({
      fetch: {
        headers: {
          "Content-Type": "application/json",
          cookie: `auth=${token}`,
        },
      },
    })
  ).data as Array<{
    id: number;
    sender: string;
    title: string;
    content: string;
    date: Date;
  }>;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <Link href="/inbox/compose">
          <Button>
            <PencilToSquare />
            Compose
          </Button>
        </Link>
      </div>
      <Separator />
      <Mailtable mails={mails} />
    </>
  );
}
