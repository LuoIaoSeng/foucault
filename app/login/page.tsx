"use client";

import { GraduationCap } from "@gravity-ui/icons";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  toast,
} from "@heroui/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    try {
      const response = await fetch("/api/auth/login", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.role === "ADMIN") {
          redirect("/admin/dashboard");
        }
        redirect("/user/dashboard");
      } else {
        toast.danger("Incorrect username or password.");
      }
    } catch {
      toast.danger("Unable to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-1/2 bg-(--tt-brand-color-500) flex-col justify-center p-16">
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-3 text-white">
            <GraduationCap className="w-10 h-10" />
            <span className="text-3xl font-bold tracking-tight">Foucault</span>
          </div>
          <h2 className="mt-8 text-4xl font-bold leading-tight text-white/90">
            University Management,{" "}
            <span className="text-white">Simplified.</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            Sign in to access your dashboard, manage communications, and stay
            connected with your campus.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 bg-(--tt-bg-color)">
        <div className="w-full max-w-sm">
          {/* Mobile branding */}
          <div className="lg:hidden mb-10 text-center">
            <div className="inline-flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-(--tt-brand-color-500)" />
              <span className="text-2xl font-bold">Foucault</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="mt-1 text-(--tt-color-text-gray)">
              Sign in to your account
            </p>
          </div>

          <Form className="flex flex-col gap-5" onSubmit={onSubmit}>
            <TextField isRequired name="username" type="text">
              <Label>Username</Label>
              <Input placeholder="Enter your username" />
              <FieldError />
            </TextField>

            <TextField
              isRequired
              minLength={4}
              name="password"
              type="password"
            >
              <Label>Password</Label>
              <Input placeholder="Enter your password" />
              <FieldError />
            </TextField>

            <Button
              type="submit"
              size="lg"
              isDisabled={isLoading}
              fullWidth
              className="mt-2 bg-(--tt-brand-color-500) text-white hover:bg-(--tt-brand-color-600)"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </Form>

          <p className="mt-8 text-center text-sm text-(--tt-color-text-gray)">
            <Link href="/" className="text-(--tt-brand-color-500)">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
