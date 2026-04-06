"use client";

import { Check } from "@gravity-ui/icons";
import { Button, FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { redirect } from "next/navigation";

export default function () {
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};

    // Convert FormData to plain object
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const response = await fetch('/api/auth/login', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })

    if (response.ok) {
      const data = await response.json()
      switch (data.role) {
        case 'ADMIN':
          redirect('/admin/dashboard')
        default:
          redirect('/dashboard')
      }
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <Form className="flex w-96 flex-col gap-4" onSubmit={onSubmit}>
        <TextField
          isRequired
          name="username"
          type="text"
        // validate={(value) => {
        //   if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        //     return "Please enter a valid email address";
        //   }

        //   return null;
        // }}
        >
          <Label>Username</Label>
          <Input placeholder="Enter your username" />
          <FieldError />
        </TextField>

        <TextField
          isRequired
          minLength={4}
          name="password"
          type="password"
        // validate={(value) => {
        //   if (value.length < 8) {
        //     return "Password must be at least 8 characters";
        //   }
        //   if (!/[A-Z]/.test(value)) {
        //     return "Password must contain at least one uppercase letter";
        //   }
        //   if (!/[0-9]/.test(value)) {
        //     return "Password must contain at least one number";
        //   }

        //   return null;
        // }}
        >
          <Label>Password</Label>
          <Input placeholder="Enter your password" />
          {/* <Description>Must be at least 8 characters with 1 uppercase and 1 number</Description> */}
          <FieldError />
        </TextField>

        <div className="flex gap-2">
          <Button type="submit">
            <Check />
            Login
          </Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </div>
      </Form>
    </div>
  );
}