import { Button, Separator, Table } from "@heroui/react";
import Pagenavbar from "./PageNavbar";
import { api } from "../api/inbox/[[...slug]]/route";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import Mailtable from "../api/inbox/[[...slug]]/MailTable";

export default async function () {

  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;

  //@ts-ignore
  const mails = (await api.inbox.get({
    fetch: {
      headers: {
        'Content-Type': 'application/json',
        'cookie': `auth=${token}`
      }
    }
  })).data as Array<{
    id: number,
    sender: string,
    title: string,
    content: string,
    date: Date
  }>

  return (
    <>
      <Pagenavbar />
      <Separator />
      <div>
        <Mailtable mails={mails} />
      </div>
    </>
  )
}
