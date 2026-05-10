"use client";

import { User } from "@/generated/prisma/client";
import { getDateString } from "@/lib/datehelper";
import { Camera, Check, Key } from "@gravity-ui/icons";
import {
  Avatar,
  Badge,
  Button,
  DateField,
  FieldError,
  Input,
  Label,
  Radio,
  RadioGroup,
  Separator,
  Surface,
  TextField,
  toast,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function ProfileForm({ user }: { user: User | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append("image", files[0]);

    const response = await fetch("/api/user/upload-avator", {
      method: "put",
      body: formData,
      credentials: "include",
    });

    if (response.ok) {
      router.refresh();
      toast.success("Avatar updated successfully");
    } else {
      toast.danger("Failed to upload avatar");
    }
  }

  async function handleUpdateInfo() {
    setIsSaving(true);
    const response = await fetch("/api/user/", {
      method: "put",
      body: JSON.stringify({ nickname }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (response.ok) {
      toast.success("Profile updated");
    } else {
      toast.danger("Failed to update profile");
    }
    setIsSaving(false);
  }

  async function handleResetPassword() {
    if (confirmPassword !== password) {
      toast.danger("Passwords do not match");
      return;
    }
    if (password.length < 4) {
      toast.danger("Password must be at least 4 characters");
      return;
    }

    setIsResetting(true);
    const response = await fetch("/api/auth/reset-password", {
      method: "post",
      body: JSON.stringify({ password, confirmPassword }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (response.ok) {
      toast.success("Password reset successfully");
      setPassword("");
      setConfirmPassword("");
    } else {
      toast.danger("Failed to reset password");
    }
    setIsResetting(false);
  }

  return (
    <div className="max-w-3xl flex flex-col gap-8">
      {/* Avatar + identity */}
      <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
        <div className="flex items-center gap-6">
          <Badge.Anchor>
            <Avatar
              className="size-24 cursor-pointer hover:brightness-75 transition-all"
              variant="default"
            >
              <Avatar.Image
                alt={`${user?.firstname ?? ""} ${user?.lastname}`}
                src={user?.avatorPath ? "/" + user.avatorPath : ""}
              />
              <Avatar.Fallback className="text-4xl">
                {user?.firstname?.at(0) ?? ""}
                {user?.lastname?.at(0) ?? ""}
              </Avatar.Fallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.png,.svg,.bmp,.webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Badge placement="bottom-right" size="lg">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center w-full h-full"
              >
                <Camera />
              </button>
            </Badge>
          </Badge.Anchor>
          <div>
            <h2 className="text-2xl font-bold">
              {user?.firstname} {user?.lastname}
            </h2>
            <p className="text-(--tt-color-text-gray) mt-1">
              @{user?.username}
            </p>
            <p className="text-sm text-(--tt-color-text-gray) mt-0.5 capitalize">
              {user?.role.toLowerCase()}
            </p>
          </div>
        </div>
      </Surface>

      {/* Personal info */}
      <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
        <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
        <div className="flex flex-col gap-5">
          <TextField name="nickname" type="text" className="max-w-md">
            <Label>Nickname</Label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter a nickname"
            />
          </TextField>

          <DateField
            className="max-w-md"
            name="birthday"
            value={parseDate(getDateString(user?.birthday!))}
            isDisabled
          >
            <Label>Date of Birth</Label>
            <DateField.Group>
              <DateField.Input>
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
            </DateField.Group>
          </DateField>

          <RadioGroup
            name="gender"
            isDisabled
            value={user?.gender}
            orientation="horizontal"
          >
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

          <div>
            <Button onPress={handleUpdateInfo} isDisabled={isSaving}>
              <Check />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Surface>

      {/* Password */}
      <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
        <h3 className="text-lg font-semibold mb-6">Change Password</h3>
        <div className="flex flex-col gap-5">
          <TextField
            className="max-w-md"
            type="password"
            name="new-password"
          >
            <Label>New Password</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <FieldError />
          </TextField>

          <TextField
            className="max-w-md"
            type="password"
            name="confirm-password"
          >
            <Label>Confirm Password</Label>
            <Input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
            />
            <FieldError />
          </TextField>

          <div>
            <Button
              variant="danger"
              onPress={handleResetPassword}
              isDisabled={isResetting}
            >
              <Key />
              {isResetting ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </div>
      </Surface>
    </div>
  );
}
