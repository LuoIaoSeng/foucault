import Sidebar from "@/app/components/Sidebar";
import { Separator } from "@heroui/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "../api/user/[[...slug]]/route";

export default async function () {

  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;

  if (!token) {
    redirect('/login')
  }

  const response = await api.user.get({
    fetch: {
      headers: {
        'Content-Type': 'application/json',
        'cookie': `auth=${token}`
      }
    }
  })
  
  console.log(response)

  return (
    <div className="w-full min-h-screen flex items-stretch">
      <Sidebar />
      <Separator orientation="vertical" />
      <main>

      </main>
    </div>
  )
}
