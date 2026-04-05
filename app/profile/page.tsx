import { Separator } from "@heroui/react";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import AdminSidebar from "../admin/AdminSidebar";
import { api } from "../api/user/[[...slug]]/route";
import ProfileForm from "./ProfileForm";
import EducatorSidebar from "../components/EducatorSidebar";
import EmployeeSidebar from "../components/EmployeeSidebar";
import StudentSidebar from "../components/StudentSidebar";

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

  if (response.status !== 200) {
    unauthorized()
  }

  const user = response.data

  return (
    <div className="w-full min-h-screen flex items-stretch">
      {user?.role === 'ADMIN' && <AdminSidebar user={user} />}
      {user?.role === 'STUDENT' && <StudentSidebar user={user} />}
      {user?.role === 'EDUCATOR' && <EducatorSidebar user={user} />}
      {user?.role === 'EMPLOYEE' && <EmployeeSidebar user={user} />}
      <Separator orientation="vertical" />
      <main className="grow flex flex-col p-6 gap-6">
        <ProfileForm user={user} />
      </main>
    </div>
  )
}
