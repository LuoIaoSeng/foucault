import { Separator } from "@heroui/react";
import { redirect } from "elysia";
import { cookies } from "next/headers";
import { unauthorized } from "next/navigation";
import { ReactNode } from "react";
import { api } from "../api/user/[[...slug]]/route";
import AdminSidebar from "./AdminSidebar";

export default async function ({ children }: { children: ReactNode }) {

  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;

  if (!token) {
    redirect('/login')
  }

  const user = await api.user.get({ fetch: { headers: { 'cookie': `auth=${token}` } } })

  if (user.status !== 200) {
    unauthorized()
  }

  if (user.data?.role !== 'ADMIN') {
    unauthorized()
  }

  return (
    <div className="w-full min-h-screen flex items-stretch">
      <AdminSidebar user={user.data} />
      <Separator orientation="vertical" />
      <main className="flex flex-col gap-6 grow p-6 max-h-screen overflow-y-scroll">
        {children}
      </main>
    </div>
  )
}