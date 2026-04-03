import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "../api/user/[[...slug]]/route";
import Sidebar from "../components/Sidebar";
import ProfileForm from "./ProfileForm";

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
        'Cookie': `auth=${token}`
      }
    }
  })

  const user = response.data

  return (
    <div className="w-full min-h-screen flex items-stretch">
      <Sidebar />
      <main className="grow flex flex-col p-6 gap-6">
        <ProfileForm user={user} />
      </main>
    </div>
  )
}
