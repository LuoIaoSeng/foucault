import { api } from "@/app/api/user/[[...slug]]/route";
import { cookies } from "next/headers";
import { unauthorized } from "next/navigation";
import UserForm from "./UserForm";

export default async function ({ params }: {
  params: Promise<{ id: string | number }>
}) {

  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;

  const { id } = await params

  const user = await api.user.admin.show({ id }).get({ fetch: { headers: { 'cookie': `auth=${token}` } } })

  if(!user.data) {
    unauthorized()
  }

  return (
    <>
      <UserForm user={user.data}/>
    </>
  )
}
