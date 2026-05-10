import { Separator } from "@heroui/react";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import { api } from "../api/user/[[...slug]]/route";
import GlobalSidebar from "../GlobalSidebar";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token) {
    redirect("/login");
  }

  const response = await api.user.get({
    fetch: {
      headers: {
        "Content-Type": "application/json",
        cookie: `auth=${token}`,
      },
    },
  });

  if (response.status !== 200) {
    unauthorized();
  }

  const user = response.data;

  return (
    <div className="w-full min-h-screen flex items-stretch">
      <GlobalSidebar user={user!} />
      <Separator orientation="vertical" />
      <main className="flex flex-col gap-6 grow p-6 max-h-screen overflow-y-scroll">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Separator />
        <ProfileForm user={user} />
      </main>
    </div>
  );
}
