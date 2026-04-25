import { api } from "@/app/api/user/[[...slug]]/route";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import UserTable from "./UserTable";
import { Separator } from "@heroui/react";

export default async function () {

  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;

  if (!token) {
    redirect('/login')
  }

  const users = await api.user.admin.all.get({ fetch: { headers: { 'cookie': `auth=${token}` } } })

  if (users.status !== 200) {
    unauthorized()
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Users</h1>
      <Separator />
      <UserTable users={users.data!} />
    </>
  )
}
