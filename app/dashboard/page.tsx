import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MyNavbar from "./navbar";
import { api } from "../api/user/[[...slug]]/route";

export default async function () {

  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;

  if (!token) {
    redirect('/login')
  }

  const user = await api.user.get({
    fetch: {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth=${token}`
      }
    }
  })

  return (
    <div className="w-full min-h-screen">
      <MyNavbar user={user.data}/>
    </div>
  )
}
