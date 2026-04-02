'use client'

import { Avatar, Label, Description } from "@heroui/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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

export default function Sidebar({className}: {className?: string}) {

  const pathname = usePathname()

  return (
    <div className={`border-r fixed h-full ${className}`}>
      <Link
        className="w-full p-3 hover:bg-slate-100 inline-flex gap-4 items-center"
        href={'/profile'}>
        <Avatar>
          <Avatar.Image alt="John Doe" src="https://img.heroui.chat/image/avatar?w=400&h=400&u=3" />
          <Avatar.Fallback>JD</Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col">
          <Label>Bob</Label>
          <Description>bob@heroui.com</Description>
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