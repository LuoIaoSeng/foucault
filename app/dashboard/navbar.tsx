'use client'

import { Button } from '@heroui/react';

export default function MyNavbar({ user }: {
  user: {
    id: number;
    name: string;
    username: string;
    password: string;
    gender: string | null;
    birthday: Date | null;
    createAt: Date;
    updateAt: Date;
  } | null
}) {

  return (
    <div>
      {user?.name}
    </div>
  )
}
