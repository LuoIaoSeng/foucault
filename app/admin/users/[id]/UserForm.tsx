'use client'

import { User } from "@/generated/prisma/client";
import { getDateString } from "@/lib/datehelper";
import { Camera } from '@gravity-ui/icons';
import { Avatar, Badge, Button, DateField, DateValue, Description, FieldError, Input, Label, Radio, RadioGroup, TextField, toast } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function ({ user }: {
  user: User | null
}) {

  const router = useRouter()

  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [firstname, setFirstname] = useState(user?.firstname ?? '')
  const [lastname, setLastname] = useState(user?.lastname ?? '')
  const [birthday, setBirthday] = useState<DateValue | null>(parseDate(getDateString(user?.birthday!)))
  const [gender, setGender] = useState(user?.gender ?? '')
  const [username, setUsername] = useState(user?.username ?? '')
  const [role, setRole] = useState(user?.role ?? '')

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

        const response = await fetch(`/api/user/upload-avator/${user?.id}`, {
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
            <Avatar.Image alt={`${user?.firstname ?? ''} ${user?.lastname}`} src={'/' + (user?.avatorPath ?? '')} />
            <Avatar.Fallback className="text-4xl">{`${user?.firstname?.at(0) ?? ''}${user?.lastname?.at(0) ?? ''}`}</Avatar.Fallback>
          </Avatar>
          <Badge placement="bottom-right" size="lg">
            <Camera />
          </Badge>
        </Badge.Anchor>
        <div className="flex flex-col">
          <Label className="text-4xl">{user?.firstname} {user?.lastname}</Label>
          <Description className="text-2xl">{user?.username}</Description>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <TextField className="flex-1" value={firstname} onChange={setFirstname}>
            <Label>First Name</Label>
            <Input placeholder="First name" />
          </TextField>
          <TextField className="flex-1" value={lastname} onChange={setLastname}>
            <Label>Last Name</Label>
            <Input placeholder="Last name" />
          </TextField>
        </div>
        <TextField className="w-full" value={nickname} onChange={setNickname}>
          <Label>Nickname</Label>
          <Input placeholder="Nickname" />
        </TextField>
        <TextField className="w-full" value={username} onChange={setUsername}>
          <Label>Username</Label>
          <Input placeholder="Username" />
        </TextField>
        <RadioGroup value={role} onChange={setRole} orientation="horizontal">
          <Label className="mb-2">Role</Label>
          <Radio value="ADMIN">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label>Admin</Label>
            </Radio.Content>
          </Radio>
          <Radio value="EDUCATOR">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label>Educator</Label>
            </Radio.Content>
          </Radio>
          <Radio value="STUDENT">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label>Student</Label>
            </Radio.Content>
          </Radio>
          <Radio value="EMPLOYEE">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label>Employee</Label>
            </Radio.Content>
          </Radio>
        </RadioGroup>
        <DateField className="w-full" name="date" value={birthday} onChange={setBirthday}>
          <Label>Date of birth</Label>
          <DateField.Group>
            <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          </DateField.Group>
        </DateField>
        <RadioGroup name="gender" value={gender} onChange={setGender} orientation="horizontal">
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
            const response = await fetch(`/api/user/admin/update/${user?.id}`, {
              method: 'put',
              body: JSON.stringify({
                nickname,
                firstname: firstname,
                lastname: lastname,
                username,
                birthday: birthday?.toString(),
                role,
                gender
              }),
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            })
            if (response.ok) {
              toast.success('Update information successfully')
              router.refresh()
            }
          }}
        >
          Update
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <TextField className="w-lg" type="password" name="password">
          <Label>New Password</Label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
          <FieldError />
        </TextField>
        <TextField className="w-lg" type="password" name="password">
          <Label>Confirm Password</Label>
          <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
          <FieldError />
        </TextField>
        <Button
          variant="danger"
          onPress={async () => {
            if (confirmPassword !== password) {
              toast.danger('Confirm password is not equal to the new password')
              return
            }
            if (confirmPassword === '') {
              toast.danger('Password cannot be empty')
              return
            }
            const response = await fetch(`/api/auth/reset-password/${user?.id}`, {
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
