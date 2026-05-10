'use client'

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function () {

  const router = useRouter()

  return (
    <div className="flex justify-between">
      <div>
        <h1 className="text-2xl font-bold">Inbox</h1>
      </div>
      <div>
        <Button onPress={() => { router.push('/inbox/sent') }}>Write</Button>
      </div>
    </div>
  )
}
