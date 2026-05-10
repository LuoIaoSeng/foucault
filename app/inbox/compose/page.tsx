"use client";

import { SimpleEditor } from "@/app/components/SimpleEditor";
import { ArrowLeft, PaperPlane } from "@gravity-ui/icons";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  ComboBox,
  Description,
  FieldError,
  Input,
  Label,
  ListBox,
  Separator,
  Tag,
  TagGroup,
  TextField,
  toast,
  useListData,
} from "@heroui/react";
import { User } from "@/generated/prisma/client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Key } from "@react-types/shared";

export default function ComposePage() {
  const [users, setUsers] = useState<Array<User>>([]);
  const [title, setTitle] = useState("");
  const [isDisable, setIsDisable] = useState(false);

  const selectedUsers = useListData<User>({
    getKey: (item) => item.id,
  });

  const editorRef = useRef<{ getContent: () => string }>(null);

  useEffect(() => {
    fetch("/api/user/users")
      .then((r) => r.ok && r.json())
      .then((data) => data && setUsers(data));
  }, []);

  function onRemove(keys: Set<Key>) {
    for (const key of keys) {
      selectedUsers.remove(key);
    }
  }

  async function sendMail() {
    if (selectedUsers.items.length === 0) {
      toast.danger("Receivers cannot be empty");
      return;
    }
    if (!title) {
      toast.danger("Title cannot be empty");
      return;
    }

    setIsDisable(true);
    const content = editorRef.current?.getContent();

    const response = await fetch("/api/inbox/send", {
      method: "POST",
      body: JSON.stringify({
        title,
        receivers: selectedUsers.items.map((u) => u.id),
        content,
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.ok) {
      toast.success("Mail sent successfully");
      setTitle("");
      selectedUsers.remove(...selectedUsers.items.map((u) => u.id));
    } else {
      toast.danger("Failed to send mail");
    }
    setIsDisable(false);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/inbox">
            <Button isIconOnly variant="ghost" size="sm">
              <ArrowLeft />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Compose</h1>
        </div>
        <Button onPress={sendMail} isDisabled={isDisable}>
          <PaperPlane />
          Send
        </Button>
      </div>
      <Separator />

      <div className="flex flex-col gap-4 grow">
        <div className="flex gap-4 items-start">
          <ComboBox
            className="w-[280px]"
            onChange={(k) => {
              if (k != null) {
                const user = users.find((u) => u.id === k);
                if (user) selectedUsers.append(user);
              }
            }}
          >
            <Label>Add recipients</Label>
            <ComboBox.InputGroup>
              <Input placeholder="Search users..." />
              <ComboBox.Trigger />
            </ComboBox.InputGroup>
            <ComboBox.Popover>
              <ListBox>
                {users
                  .filter((u) => !selectedUsers.getItem(u.id))
                  .map((user) => (
                    <ListBox.Item
                      key={user.id}
                      id={user.id}
                      textValue={user.username}
                    >
                      <Avatar size="sm">
                        <AvatarImage src={"/" + (user.avatorPath ?? "")} />
                        <AvatarFallback>
                          {user.firstname} {user.lastname}
                        </AvatarFallback>
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

          <TagGroup onRemove={onRemove} className="grow">
            <Label>Recipients</Label>
            <TagGroup.List
              items={selectedUsers.items}
              renderEmptyState={() => (
                <span className="text-sm text-(--tt-color-text-gray)">
                  No recipients selected
                </span>
              )}
            >
              {(user) => (
                <Tag key={user.id} id={user.id} textValue={user.username}>
                  <Avatar className="size-4" size="sm">
                    <Avatar.Image src={"/" + (user.avatorPath ?? "")} />
                    <AvatarFallback>
                      {user.firstname} {user.lastname}
                    </AvatarFallback>
                  </Avatar>
                  {user.username}
                </Tag>
              )}
            </TagGroup.List>
          </TagGroup>
        </div>

        <TextField isRequired name="title" type="text">
          <Label>Title</Label>
          <Input
            placeholder="Mail subject"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <FieldError />
        </TextField>

        <div className="grow border border-(--tt-border-color) rounded-xl min-h-[400px]">
          <SimpleEditor ref={editorRef} />
        </div>
      </div>
    </>
  );
}
