import { Separator } from "@heroui/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "../api/user/[[...slug]]/route";
import GlobalSidebar from "../GlobalSidebar";

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

  const user = response.data

  return (
    <div className="w-full min-h-screen flex items-stretch">
      <GlobalSidebar user={user!} />
      <Separator orientation="vertical" />
      <main>

      </main>
    </div>
  )
}
 