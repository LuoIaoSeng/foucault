import { api } from "@/app/api/user/[[...slug]]/route";
import Sidebar from "@/app/components/Sidebar";
import { Separator, Table } from "@heroui/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UserTable from "./UserTable";

export default async function () {

  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;

  if (!token) {
    redirect('/login')
  }

  const users = await api.user.all.get({ fetch: { headers: { 'cookie': `auth=${token}` } } })

  return (
    <div className="w-full min-h-screen flex items-stretch">
      <Sidebar />
      <Separator orientation="vertical" />
      <main className="grow flex flex-col p-6 gap-6">
        <UserTable users={users.data?.users!} />
      </main>
    </div>
  )
}
