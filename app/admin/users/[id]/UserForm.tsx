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
  Surface,
  TextField,
  toast,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function UserForm({ user }: { user: User | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [firstname, setFirstname] = useState(user?.firstname ?? "");
  const [lastname, setLastname] = useState(user?.lastname ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [role, setRole] = useState<string>(user?.role ?? "STUDENT");
  const [gender, setGender] = useState<string>(user?.gender ?? "M");
  const [birthday, setBirthday] = useState(
    user?.birthday ? parseDate(getDateString(user.birthday)) : null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append("image", files[0]);

    const res = await fetch(`/api/user/admin/upload-avator/${user?.id}`, {
      method: "put",
      body: formData,
      credentials: "include",
    });
    if (res.ok) {
      router.refresh();
      toast.success("Avatar updated");
    } else {
      toast.danger("Failed to upload avatar");
    }
  }

  async function handleSave() {
    setIsSaving(true);
    const res = await fetch(`/api/user/admin/update/${user?.id}`, {
      method: "put",
      body: JSON.stringify({
        nickname,
        firstname,
        lastname,
        username,
        birthday: birthday?.toString() ?? "",
        role,
        gender,
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      toast.success("User updated");
      router.refresh();
    } else {
      toast.danger("Failed to update user");
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
    const res = await fetch(`/api/auth/reset-password/${user?.id}`, {
      method: "post",
      body: JSON.stringify({ password, confirmPassword }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      toast.success("Password reset");
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
            <Avatar className="size-24 cursor-pointer hover:brightness-75 transition-all">
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
          </div>
        </div>
      </Surface>

      {/* User info */}
      <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
        <h3 className="text-lg font-semibold mb-6">User Information</h3>
        <div className="flex flex-col gap-5">
          <div className="flex gap-4">
            <TextField
              className="flex-1"
              value={firstname}
              onChange={setFirstname}
              isRequired
            >
              <Label>First Name</Label>
              <Input placeholder="First name" />
            </TextField>
            <TextField
              className="flex-1"
              value={lastname}
              onChange={setLastname}
              isRequired
            >
              <Label>Last Name</Label>
              <Input placeholder="Last name" />
            </TextField>
          </div>
          <TextField value={nickname} onChange={setNickname} className="max-w-md">
            <Label>Nickname</Label>
            <Input placeholder="Nickname" />
          </TextField>
          <TextField
            value={username}
            onChange={setUsername}
            isRequired
            className="max-w-md"
          >
            <Label>Username</Label>
            <Input placeholder="Username" />
          </TextField>
          <RadioGroup value={role} onChange={setRole} orientation="horizontal">
            <Label>Role</Label>
            <Radio value="STUDENT">Student</Radio>
            <Radio value="EDUCATOR">Educator</Radio>
            <Radio value="EMPLOYEE">Employee</Radio>
            <Radio value="ADMIN">Admin</Radio>
          </RadioGroup>
          <DateField
            className="max-w-md"
            value={birthday as any}
            onChange={setBirthday as any}
          >
            <Label>Date of Birth</Label>
            <DateField.Group>
              <DateField.Input>
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
            </DateField.Group>
          </DateField>
          <RadioGroup
            value={gender}
            onChange={setGender}
            orientation="horizontal"
          >
            <Label>Gender</Label>
            <Radio value="M">Male</Radio>
            <Radio value="F">Female</Radio>
          </RadioGroup>
          <div>
            <Button onPress={handleSave} isDisabled={isSaving}>
              <Check />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Surface>

      {/* Password reset */}
      <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
        <h3 className="text-lg font-semibold mb-6">Reset Password</h3>
        <div className="flex flex-col gap-5">
          <TextField
            className="max-w-md"
            type="password"
            name="new-password"
            value={password}
            onChange={setPassword}
          >
            <Label>New Password</Label>
            <Input placeholder="Enter new password" />
            <FieldError />
          </TextField>
          <TextField
            className="max-w-md"
            type="password"
            name="confirm-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          >
            <Label>Confirm Password</Label>
            <Input placeholder="Re-enter new password" />
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
