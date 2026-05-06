'use client'

import { SimpleEditor } from "@/app/components/SimpleEditor";
import { PlanetEarth, Plus, Rocket, ShoppingBag, SquareArticle } from '@gravity-ui/icons';
import { Button, Description, FieldError, Input, Label, Separator, TagGroup, TextField, Tag, Avatar, Key, useListData, ComboBox, ListBox, AvatarImage, AvatarFallback, toast } from "@heroui/react";
import { PersonPlus } from '@gravity-ui/icons';
import { User } from "@/generated/prisma/client";
import { useEffect, useRef, useState } from "react";

export default function () {

  const [users, setUsers] = useState<Array<User>>([])
  const [title, setTitle] = useState('')
  const [isDisable, setIsDisable] = useState(false)

  async function fetchUsers() {
    const response = await fetch('/api/user/users')

    if (response.ok) {

      setUsers(await response.json())
    }
  }

  useEffect(() => {

    fetchUsers()
  }, [])

  const selectedUsers = useListData<User>({
    getKey: (item) => item.id,
  })

  function onRemove(keys: Set<Key>) {
    selectedUsers.remove(...keys)
  }

  const editorRef = useRef<{
    getContent: () => string
  }>(null)

  async function sentMail() {

    if (selectedUsers.items.length === 0) {
      toast.danger('Receivers cannot be empty')
      return
    }

    if (!title) {
      toast.danger('Title cannot be empty')
      return
    }

    setIsDisable(true)
    const content = editorRef.current?.getContent()

    const response = await fetch('/api/inbox/send', {
      method: 'POST',
      body: JSON.stringify({
        title: title,
        receivers: selectedUsers.items.map((u) => u.id),
        content: content
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    if (response.ok) {
      toast.success('Send success')
    } else {
      console.error(response)
    }
  }

  return (
    <>
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sent Mail</h1>
        </div>
        <Button onPress={sentMail} isDisabled={isDisable}>Send</Button>
      </div>
      <Separator />
      <div className="flex flex-col items-center grow gap-4">
        <div className="w-full flex flex-col gap-4">
          <div className="flex gap-4">
            <ComboBox className="w-[256px]"
              onChange={(k) => {
                selectedUsers.append(...users.filter((u) => u.id === k))
              }}>
              <Label>User</Label>
              <ComboBox.InputGroup>
                <Input placeholder="Search users..." />
                <ComboBox.Trigger />
              </ComboBox.InputGroup>
              <ComboBox.Popover>
                <ListBox>
                  {users.filter((u) => { return selectedUsers.getItem(u.id) === undefined }).map((user) => (
                    <ListBox.Item key={user.id} id={user.id} textValue={user.username}>
                      <Avatar size="sm">
                        <AvatarImage src={'/' + (user.avatorPath ?? '')} />
                        <AvatarFallback>{user.firstname + ' ' + user.lastname}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <Label>{user.username}</Label>
                        <Description>{user.nickname}</Description>
                      </div>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </ComboBox.Popover>
            </ComboBox>
            <TagGroup
              onRemove={onRemove}
            >
              <Label isRequired>Receivers</Label>
              <TagGroup.List
                items={selectedUsers.items}
                renderEmptyState={() => <p className="p-1">No receivers</p>}
              >
                {(user) => (
                  <Tag key={user.id} id={user.id} textValue={user.username}>
                    <Avatar className="size-4" size="sm">
                      <Avatar.Image src={'/' + (user.avatorPath ?? '')} />
                      <Avatar.Fallback>{user.firstname + ' ' + user.lastname}</Avatar.Fallback>
                    </Avatar>
                    {user.username}
                  </Tag>
                )}
              </TagGroup.List>
            </TagGroup>
          </div>
          <TextField
            isRequired
            name="title"
            type="text"
          >
            <Label>Title</Label>
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <FieldError />
          </TextField>

        </div>
        <div className="w-2/3 border-gray-200 border grow">
          <SimpleEditor ref={editorRef} />
        </div>
      </div>
    </>
  )
}
