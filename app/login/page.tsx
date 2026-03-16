'use client'

import { Button, Card, CardBody, CardHeader, Form, Input } from "@heroui/react";
import { redirect } from "next/navigation";
import { FormEvent } from "react";

export default function () {

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = Object.fromEntries(new FormData(e.currentTarget)) as {
      username: string,
      password: string
    }

    const response = await fetch('/api/auth/login', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData),
      credentials: 'include'
    })
    
    if(response.ok) {
      redirect('/dashboard')
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <Card className="w-1/3">
        <CardHeader>
          Login
        </CardHeader>
        <CardBody>
          <Form onSubmit={submit}>
            <Input
              label="Username"
              labelPlacement="outside"
              name="username"
              placeholder="Enter your username"
              isRequired
            />
            <Input
              label="Password"
              labelPlacement="outside"
              name="password"
              type="password"
              placeholder="Enter your password"
              isRequired
            />
            <Button className="w-full" color="primary" type="submit">
              Login
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  )
}