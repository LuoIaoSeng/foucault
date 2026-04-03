import Sidebar from "@/app/components/Sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function () {

  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;

  if (!token) {
    redirect('/login')
  }

  return (
    <div className="w-full min-h-screen flex items-stretch">
      <Sidebar />
      <main>

      </main>
    </div>
  )
}
