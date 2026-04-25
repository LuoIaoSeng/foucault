import { User } from "@/generated/prisma/client"
import AdminSidebar from "./admin/AdminSidebar"
import EducatorSidebar from "./components/EducatorSidebar"
import EmployeeSidebar from "./components/EmployeeSidebar"
import StudentSidebar from "./components/StudentSidebar"

export default function ({ user }: { user: User }) {
  return (
    <>
      {user?.role === 'STUDENT' && <StudentSidebar user={user} />}
      {user?.role === 'EDUCATOR' && <EducatorSidebar user={user} />}
      {user?.role === 'EMPLOYEE' && <EmployeeSidebar user={user} />}
      {user?.role === 'ADMIN' && <AdminSidebar user={user} />}
    </>
  )
}