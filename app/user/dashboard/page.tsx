import { Separator } from "@heroui/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "../../api/user/[[...slug]]/route";
import EducatorSidebar from "../../components/EducatorSidebar";
import StudentSidebar from "../../components/StudentSidebar";
import EmployeeSidebar from "../../components/EmployeeSidebar";

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

  if(user?.role === 'ADMIN') {
    redirect('/admin/dashboard')
  }

  return (
    <div className="w-full min-h-screen flex items-stretch">
      {user?.role === 'STUDENT' && <StudentSidebar user={user} />}
      {user?.role === 'EDUCATOR' && <EducatorSidebar user={user} />}
      {user?.role === 'EMPLOYEE' && <EmployeeSidebar user={user} />}
      <Separator orientation="vertical" />
      <main>

      </main>
    </div>
  )
}
