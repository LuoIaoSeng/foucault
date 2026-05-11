import { Separator } from "@heroui/react";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import { ReactNode } from "react";
import { api } from "../api/user/[[...slug]]/route";
import AdminSidebar from "./AdminSidebar";
import AdminSubSidebar from "./AdminSubSidebar";

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

  if (user.data?.role !== "ADMIN") {
    unauthorized();
  }

  return (
    <div className="w-full min-h-screen flex items-stretch">
      <AdminSidebar user={user.data} />
      <Separator orientation="vertical" />
      <main className="flex grow max-h-screen overflow-hidden">
        <AdminSubSidebar userRole={user.data?.role} />
        <Separator orientation="vertical" />
        <div className="flex flex-col gap-6 grow p-6 max-h-screen overflow-y-scroll">
          {children}
        </div>
      </main>
    </div>
  )
}