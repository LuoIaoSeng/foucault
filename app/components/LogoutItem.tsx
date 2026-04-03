'use client'

import { redirect } from "next/navigation"

export default function () {
  return (
    <div
      className={`w-full px-4 py-2 hover:bg-slate-100 inline-block cursor-pointer`}
      onClick={async () => {
        const response = await fetch('/api/auth/logout', {
          credentials: 'include',
          method: 'post'
        })
        if(response.ok) {
          redirect('/login')
        }
      }}
    >
      Logout
    </div>
  )
}