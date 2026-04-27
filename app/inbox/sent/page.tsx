'use client'

import { SimpleEditor } from "@/app/components/SimpleEditor";
import { PlanetEarth, Plus, Rocket, ShoppingBag, SquareArticle } from '@gravity-ui/icons';
import { Button, Description, FieldError, Input, Label, Separator, TagGroup, TextField, Tag, Avatar, Key, useListData } from "@heroui/react";
import { PersonPlus } from '@gravity-ui/icons';
import { User } from "@/generated/prisma/client";

export default function () {

  const recieverList = useListData<User>({
    getKey: (item) => item.id
  })

  function onRemove(keys: Set<Key>) {
    recieverList.remove(...keys)
  }

  return (
    <>
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sent Mail</h1>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col items-center grow gap-4">
        <div className="w-full">
          <TagGroup
            onRemove={onRemove}
          >
            <Label>Recievers</Label>
            <TagGroup.List>
              <Tag>
                <Avatar className="size-4" size="sm">
                  {/* <Avatar.Image src={user.avatar} /> */}
                  <Avatar.Fallback>R</Avatar.Fallback>
                </Avatar>
                name
              </Tag>
            </TagGroup.List>
          </TagGroup>
          <TextField
            isRequired
            name="title"
            type="text"
          >
            <Label>Title</Label>
            <Input placeholder="Title" />
            <FieldError />
          </TextField>

        </div>
        <div className="w-2/3 border-gray-200 border grow">
          <SimpleEditor />
        </div>
      </div>
    </>
  )
}
