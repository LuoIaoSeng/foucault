'use client'

import { User } from "@/generated/prisma/client";
import { Camera } from '@gravity-ui/icons';
import { Avatar, Badge, Button, DateField, Description, ErrorMessage, FieldError, Input, Label, Radio, RadioGroup, TextField, toast } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function ({ user }: {
  user: User | null
}) {

  const router = useRouter()

  const [nickname, setNickname] = useState(user?.nickname ?? '')

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

        if (response.ok) {
          router.refresh()
          toast.success('Update avator sucessfully')
        }
      }
    })
  }

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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
      <div className="flex flex-col gap-4">
        <TextField className="w-full max-w-64" name="nickname" type="text">
          <Label>Nickname</Label>
          <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Nickname" />
        </TextField>
        <DateField className="w-[256px]" name="date" value={parseDate(user?.birthday.toISOString().split('T')[0]!)} isDisabled>
          <Label>Date of birth</Label>
          <DateField.Group>
            <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          </DateField.Group>
        </DateField>
        <RadioGroup name="gender" isDisabled value={user?.gender} orientation="horizontal">
          <Label>Gender</Label>
          <Radio value="M">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label>Male</Label>
            </Radio.Content>
          </Radio>
          <Radio value="F">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label>Female</Label>
            </Radio.Content>
          </Radio>
        </RadioGroup>
        <Button
          onPress={async () => {
            const response = await fetch('/api/user/', {
              method: 'put',
              body: JSON.stringify({
                nickname
              }),
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            })
            if (response.ok) {
              toast.success('Update information successfully')
            }
          }}
        >
          Update
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <TextField className="w-full max-w-64" type="password" name="password">
          <Label>New Password</Label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
          <FieldError />
        </TextField>
        <TextField className="w-full max-w-64" type="password" name="password">
          <Label>Confirm Password</Label>
          <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
          <FieldError />
        </TextField>
        <Button
          variant="tertiary"
          onPress={async () => {
            if (confirmPassword !== password) {
              toast.danger('Confirm password is not equal to the new password')
              return
            }
            if (confirmPassword === '') {
              toast.danger('Password cannot be empty')
              return
            }
            const response = await fetch('/api/auth/reset-password', {
              method: 'post',
              body: JSON.stringify({
                password,
                confirmPassword
              }),
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            })
            if (response.ok) {
              toast.success('Reset password successfully')
            }
          }}
        >
          Reset password
        </Button>
      </div>
    </>
  )
}
