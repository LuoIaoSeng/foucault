import { api } from "@/app/api/user/[[...slug]]/route";
import Sidebar from "@/app/components/Sidebar";
import { Separator } from "@heroui/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ({ params }: {
  params: Promise<{ id: string }>
}) {

  await params

  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;

  if (!token) {
    redirect('/login')
  }

  // const users = await api.user.all.get({ fetch: { headers: { 'cookie': `auth=${token}` } } })

  return (
    <div className="w-full min-h-screen flex items-stretch">
      <Sidebar />
      <Separator orientation="vertical" />
      <main className="grow flex flex-col p-6 gap-6">

      </main>
    </div>
  )
}
