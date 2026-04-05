import { api } from "@/app/api/user/[[...slug]]/route";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import UserTable from "./UserTable";
import UserToolbar from "./UserToolbar";

export default async function () {

  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;

  if (!token) {
    redirect('/login')
  }

  const users = await api.user.all.get({ fetch: { headers: { 'cookie': `auth=${token}` } } })

  if (users.status !== 200) {
    unauthorized()
  }

  return (
    <>
      <UserToolbar />
      <UserTable users={users.data!} />
    </>
  )
}
