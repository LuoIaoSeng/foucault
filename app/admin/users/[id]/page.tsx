import { ArrowLeft } from "@gravity-ui/icons";
import { Button, Separator } from "@heroui/react";
import { api } from "@/app/api/user/[[...slug]]/route";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect, unauthorized } from "next/navigation";
import UserForm from "./UserForm";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string | number }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token) {
    redirect("/login");
  }

  const { id } = await params;

  const res = await api.user.admin.show({ id }).get({
    fetch: { headers: { cookie: `auth=${token}` } },
  });

  if (!res.data) {
    unauthorized();
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Link href="/admin/users">
          <Button isIconOnly variant="ghost" size="sm">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit User</h1>
      </div>
      <Separator />
      <UserForm user={res.data} />
    </>
  );
}
