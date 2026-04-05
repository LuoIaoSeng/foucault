import { Avatar, Description, Label } from "@heroui/react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "../api/user/[[...slug]]/route";
import SidebarItem from "./SidebarItem";
import LogoutItem from "./LogoutItem";

const items: {
  admin: Array<{text: string, link: string}>,
  educator: Array<{text: string, link: string}>,
  student: Array<{text: string, link: string}>,
  employee: Array<{text: string, link: string}>,
  default: Array<{text: string, link: string}>,
} = {
  admin: [
    { text: 'Dashboard', link: '/admin/dashboard' },
    { text: 'Inbox', link: '/inbox' },
    { text: 'Users', link: '/admin/users' },
  ],
  student: [
    { text: 'Dashboard', link: '/dashboard' },
    { text: 'Inbox', link: '/inbox' },
    { text: 'Academic', link: '/academic' },
    { text: 'Study plan', link: '/studyplan' },
    { text: 'Timetable', link: '/timetable' },
    { text: 'Add/Drop', link: '/adddrop' },
    { text: 'Debit', link: '/debit' },
  ],
  employee: [
    { text: 'Dashboard', link: '/dashboard' },
    { text: 'Inbox', link: '/inbox' },
    { text: 'Academic', link: '/academic' },
    { text: 'Study plan', link: '/studyplan' },
    { text: 'Timetable', link: '/timetable' },
    { text: 'Add/Drop', link: '/adddrop' },
    { text: 'Debit', link: '/debit' },
  ],
  educator: [
    { text: 'Dashboard', link: '/dashboard' },
    { text: 'Inbox', link: '/inbox' },
    { text: 'Academic', link: '/academic' },
    { text: 'Study plan', link: '/studyplan' },
    { text: 'Timetable', link: '/timetable' },
    { text: 'Add/Drop', link: '/adddrop' },
    { text: 'Debit', link: '/debit' },
  ],
  default: []
}

export default async function Sidebar({ className }: {
  className?: string
}) {

  const cookieStore = await cookies()
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
    <div className={`w-1/6 p-4 ${className ?? ''}`}>
      <Link
        className="w-full p-3 hover:bg-slate-100 inline-flex gap-4 items-center"
        href={'/profile'}>
        <Avatar>
          <Avatar.Image alt={`${user?.first_name ?? ''} ${user?.last_name}`} src={'/' + (user?.avator_path ?? '')} />
          <Avatar.Fallback>{`${user?.first_name?.at(0) ?? ''}${user?.last_name?.at(0) ?? ''}`}</Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col">
          <Label>{user?.first_name} {user?.last_name}</Label>
          <Description>{user?.username}</Description>
        </div>
      </Link>
      {/* @ts-ignore */}
      {items[user?.role.toLowerCase() ?? 'default'].map((item) => {
        return (
          <SidebarItem key={item.link} item={item} />
        )
      })}
      <LogoutItem />
    </div>
  )
}