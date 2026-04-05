import { api } from "@/app/api/user/[[...slug]]/route";
import Sidebar from "@/app/components/Sidebar";
import { Separator } from "@heroui/react";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";

export default async function () {

  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;

  if (!token) {
    redirect('/login')
  }

  const user = await api.user.get({ fetch: { headers: { 'cookie': `auth=${token}` } } })

  if (user.data?.role !== 'ADMIN') {
    unauthorized()
  }

  return (
    <>
    </>
  )
}
