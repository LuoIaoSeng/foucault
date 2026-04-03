'use client'

import { User } from "@/generated/prisma/client"
import { Avatar, Badge, Description, Label, toast } from "@heroui/react"
import { Camera } from '@gravity-ui/icons';
import { useRouter } from "next/navigation";

export default function ({ user }: {
  user: User | null
}) {

  const router = useRouter()

  async function inputFile() {

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.jpg,.png,.svg,.bmp,.webp'
    input.click()

    input.addEventListener('change', async (e) => {

      //@ts-ignore
      const files = e.target.files
      if (files.length > 0) {

        const formData = new FormData()
        formData.append('image', files[0])

        const response = await fetch('/api/user/upload-avator', {
          method: 'put',
          body: formData,
          credentials: 'include'
        })

        if(response.ok) {
          router.refresh()
          toast.success('Update avator sucessfully')
        }
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-6">
        <Badge.Anchor>
          <Avatar className="size-24 cursor-pointer hover:brightness-75" variant="default" onClick={inputFile}>
            <Avatar.Image alt={`${user?.first_name ?? ''} ${user?.last_name}`} src={user?.avator_path ?? ''} />
            <Avatar.Fallback className="text-4xl">{`${user?.first_name?.at(0) ?? ''}${user?.last_name?.at(0) ?? ''}`}</Avatar.Fallback>
          </Avatar>
          <Badge placement="bottom-right" size="lg">
            <Camera />
          </Badge>
        </Badge.Anchor>
        <div className="flex flex-col">
          <Label className="text-4xl">{user?.first_name} {user?.last_name}</Label>
          <Description className="text-2xl">{user?.username}</Description>
        </div>
      </div>

    </>
  )
}
