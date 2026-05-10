"use client";

import { Plus } from "@gravity-ui/icons";
import {
  Button,
  Input,
  Label,
  Modal,
  Radio,
  RadioGroup,
  Separator,
  TextField,
  toast,
} from "@heroui/react";
import { User } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddUserForm({
  onSuccess,
  triggerVariant = "primary",
  triggerClassName,
}: {
  onSuccess?: (user: User) => void;
  triggerVariant?: "primary" | "ghost";
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [role, setRole] = useState<string>("STUDENT");
  const [gender, setGender] = useState<string>("M");
  const [birthday, setBirthday] = useState("");

  function reset() {
    setUsername("");
    setPassword("");
    setNickname("");
    setFirstname("");
    setLastname("");
    setRole("STUDENT");
    setGender("M");
    setBirthday("");
  }

  async function handleCreate() {
    if (!username || !password || !firstname || !lastname) {
      toast.danger("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/user/admin/create", {
      method: "post",
      body: JSON.stringify({
        username,
        password,
        nickname,
        firstname,
        lastname,
        role,
        gender,
        birthday,
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.ok) {
      const newUser = await response.json();
      toast.success("User created");
      onSuccess?.(newUser);
      router.refresh();
      reset();
      setOpen(false);
    } else {
      toast.danger("Failed to create user");
    }
    setLoading(false);
  }

  return (
    <Modal isOpen={open} onOpenChange={setOpen}>
      <Button
        variant={triggerVariant}
        className={triggerClassName}
        onPress={() => setOpen(true)}
      >
        <span className="w-full font-semibold inline-flex items-center gap-3">
          <Plus />
          Add User
        </span>
      </Button>
      <Modal.Backdrop>
        <Modal.Container placement="auto">
          <Modal.Dialog className="sm:max-w-xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
                <Plus className="size-5" />
              </Modal.Icon>
              <Modal.Heading>Add New User</Modal.Heading>
            </Modal.Header>

            <Modal.Body className="p-8">
              {/* Account section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-(--tt-color-text-gray) uppercase tracking-wider mb-4">
                  Account
                </h4>
                <div className="flex gap-4">
                  <TextField
                    className="flex-1"
                    value={username}
                    onChange={setUsername}
                    isRequired
                  >
                    <Label>Username</Label>
                    <Input placeholder="Username" />
                  </TextField>
                  <TextField
                    className="flex-1"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    isRequired
                  >
                    <Label>Password</Label>
                    <Input placeholder="Password" />
                  </TextField>
                </div>
              </div>

              <Separator />

              {/* Personal section */}
              <div className="my-6">
                <h4 className="text-sm font-semibold text-(--tt-color-text-gray) uppercase tracking-wider mb-4">
                  Personal
                </h4>
                <div className="flex flex-col gap-4">
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
                  <TextField value={nickname} onChange={setNickname}>
                    <Label>Nickname</Label>
                    <Input placeholder="Nickname (optional)" />
                  </TextField>
                </div>
              </div>

              <Separator />

              {/* Role & gender section */}
              <div className="mt-6 flex flex-col gap-6">
                <div className="flex gap-8">
                  <RadioGroup
                    className="flex-1"
                    value={gender}
                    onChange={setGender}
                    orientation="horizontal"
                  >
                    <Label>Gender</Label>
                    <Radio value="M">
                      <Radio.Control><Radio.Indicator /></Radio.Control>
                      <Radio.Content><Label>Male</Label></Radio.Content>
                    </Radio>
                    <Radio value="F">
                      <Radio.Control><Radio.Indicator /></Radio.Control>
                      <Radio.Content><Label>Female</Label></Radio.Content>
                    </Radio>
                  </RadioGroup>

                  <TextField
                    className="flex-1"
                    value={birthday}
                    onChange={setBirthday}
                    type="date"
                  >
                    <Label>Date of Birth</Label>
                    <Input />
                  </TextField>
                </div>

                <RadioGroup
                  value={role}
                  onChange={setRole}
                  orientation="horizontal"
                >
                  <Label>Role</Label>
                  <Radio value="STUDENT">
                    <Radio.Control><Radio.Indicator /></Radio.Control>
                    <Radio.Content><Label>Student</Label></Radio.Content>
                  </Radio>
                  <Radio value="EDUCATOR">
                    <Radio.Control><Radio.Indicator /></Radio.Control>
                    <Radio.Content><Label>Educator</Label></Radio.Content>
                  </Radio>
                  <Radio value="EMPLOYEE">
                    <Radio.Control><Radio.Indicator /></Radio.Control>
                    <Radio.Content><Label>Employee</Label></Radio.Content>
                  </Radio>
                  <Radio value="ADMIN">
                    <Radio.Control><Radio.Indicator /></Radio.Control>
                    <Radio.Content><Label>Admin</Label></Radio.Content>
                  </Radio>
                </RadioGroup>
              </div>
            </Modal.Body>

            <Modal.Footer className="px-8 pb-6">
              <Button slot="close" variant="secondary" onPress={reset}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isDisabled={loading}
                onPress={handleCreate}
              >
                {loading ? "Creating..." : "Create User"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
