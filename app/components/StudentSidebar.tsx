'use client'

import { User } from "@/generated/prisma/client"
import { ArrowRightFromSquare, BookOpen, House, PersonPencil, Tray } from "@gravity-ui/icons"
import { Avatar, Button, Description, Label, Separator } from "@heroui/react"
import Link from "next/link"
import { redirect, usePathname } from "next/navigation"

const items = [
  {
    text: (
      <span className="inline-flex items-center gap-4">
        <PersonPencil />
        Profile
      </span>
    ),
    link: '/profile'
  },
  {
    text: (
      <span className="inline-flex items-center gap-4">
        <House />
        Dashboard
      </span>
    ),
    link: '/user/dashboard'
  },
  {
    text: (
      <span className="inline-flex items-center gap-4">
        <BookOpen />
        Courses
      </span>
    ),
    link: '/courses'
  },
  {
    text: (
      <span className="inline-flex items-center gap-4">
        <Tray />
        Inbox
      </span>
    ),
    link: '/inbox'
  },
  // {
  //   text: (
  //     <span className="inline-flex items-center gap-4">
  //       <Persons />
  //       Users
  //     </span>
  //   ),
  //   link: '/admin/users'
  // },
]

export default function ({ user }: {
  user: User
}) {

  const pathname = usePathname()

  return (
    <div className={`w-1/6 p-6 flex flex-col gap-8`}>
      <div className="flex items-center gap-4">
        <Avatar>
          <Avatar.Image alt={`${user?.firstname ?? ''} ${user?.lastname}`} src={'/' + (user?.avatorPath ?? '')} />
          <Avatar.Fallback>{`${user?.firstname?.at(0) ?? ''}${user?.lastname?.at(0) ?? ''}`}</Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col">
          <Label>{user?.firstname} {user?.lastname}</Label>
          <Description>{user?.username}</Description>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          return (
            <Link
              href={item.link}
              key={item.link}
              className={`button w-full ${item.link === pathname ? 'button--tertiary' : 'button--ghost'}`}
            >
              <span className="w-full font-semibold">
                {item.text}
              </span>
            </Link>
          )
        })} 
      </div>
      <Separator />
      <div>
        <Button
          variant="ghost"
          fullWidth
          onClick={async () => {
            const response = await fetch('/api/auth/logout', {
              credentials: 'include',
              method: 'post'
            })
            if (response.ok) {
              redirect('/login')
            }
          }}
        >
          <span className="w-full text-left font-semibold">
            <span className="inline-flex items-center gap-4">
              <ArrowRightFromSquare />
              Logout
            </span>
          </span>
        </Button>
      </div>
    </div>
  )
}