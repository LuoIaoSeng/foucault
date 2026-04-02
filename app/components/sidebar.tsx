import Link from "next/link";
import { Avatar, Label, Description } from "@heroui/react";
import { User } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import SidebarItem from "./sidebarItem";
import { api } from "../api/user/[[...slug]]/route";
import { cookies } from "next/headers";

const items = [
  { text: 'Dashboard', link: '/dashboard' },
  { text: 'Inbox', link: '/inbox' },
  { text: 'Academic', link: '/academic' },
  { text: 'Study plan', link: '/studyplan' },
  { text: 'Timetable', link: '/timetable' },
  { text: 'Add/Drop', link: '/adddrop' },
  { text: 'Debit', link: '/debit' },
  { text: 'Logout', link: '/logout' },
]

export default async function Sidebar({ className }: {
  className?: string
}) {

  const cookieStore = await cookies()

  const response = await api.user.get({
    fetch: {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth=${cookieStore.get('auth')?.value}`
      }
    }
  })

  const user = response.data

  return (
    <div className={`border-r fixed h-full w-1/6 ${className}`}>
      <Link
        className="w-full p-3 hover:bg-slate-100 inline-flex gap-4 items-center"
        href={'/profile'}>
        <Avatar>
          <Avatar.Image alt={`${user?.first_name ?? ''} ${user?.last_name}`} src={user?.avator_path ?? ''} />
          <Avatar.Fallback>{`${user?.first_name?.at(0) ?? ''}${user?.last_name?.at(0) ?? ''}`}</Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col">
          <Label>{user?.first_name} {user?.last_name}</Label>
          <Description>{user?.username}</Description>
        </div>
      </Link>
      {items.map((item) => {
        return (
          <SidebarItem key={item.link} item={item} />
        )
      })}
    </div>
  )
}