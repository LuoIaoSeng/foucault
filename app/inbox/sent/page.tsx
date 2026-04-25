'use client'

import { SimpleEditor } from "@/app/components/SimpleEditor";
import { PlanetEarth, Plus, Rocket, ShoppingBag, SquareArticle } from '@gravity-ui/icons';
import { Button, Description, FieldError, Input, Label, Separator, TagGroup, TextField, Tag } from "@heroui/react";
import { PersonPlus } from '@gravity-ui/icons';

export default function () {

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
          <TagGroup selectionMode="single">
            <Label>Recievers</Label>
            <TagGroup.List>
              <Tag>
                <SquareArticle />
                News
              </Tag>
              <Tag>
                <PlanetEarth />
                Travel
              </Tag>
              <Tag>
                <Rocket />
                Gaming
              </Tag>
              <Tag>
                <ShoppingBag />
                Shopping
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
