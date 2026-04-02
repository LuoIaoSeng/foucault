'use client'

import Link from "next/link";
import { Avatar, Label, Description } from "@heroui/react";
import { useEffect, useState } from "react";
import { User } from "@/generated/prisma/client";
import { redirect, usePathname } from "next/navigation";

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

export default function Sidebar({ className }: {
  className?: string
}) {

  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)

  async function fetchData() {
    const response = await fetch('/api/user', { credentials: 'include' })
    if (response.ok) {
      setUser(await response.json())
    } else {
      switch (response.status) {
        case 401:
          redirect('/login')
      }
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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
          <Link
            className={`w-full px-4 py-2 hover:bg-slate-100 inline-block ${pathname === item.link ? 'bg-slate-100' : ''}`}
            href={item.link}
            key={'LinkTo' + item.text}>
            {item.text}
          </Link>
        )
      })}
    </div>
  )
}