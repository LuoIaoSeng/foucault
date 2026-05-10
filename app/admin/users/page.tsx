import { Separator } from "@heroui/react";
import { api } from "@/app/api/user/[[...slug]]/route";
import { cookies } from "next/headers";
import { unauthorized } from "next/navigation";
import AddUserForm from "./AddUserForm";
import UserTable from "./UserTable";

export default async function UsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  const res = await api.user.admin.all.get({
    fetch: { headers: { cookie: `auth=${token}` } },
  });

  if (res.status !== 200) {
    unauthorized();
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <AddUserForm />
      </div>
      <Separator />
      <UserTable users={res.data!} />
    </>
  );
}
