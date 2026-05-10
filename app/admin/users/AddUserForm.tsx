"use client";

import { Plus } from "@gravity-ui/icons";
import {
  Button,
  Input,
  Label,
  Modal,
  Radio,
  RadioGroup,
  TextField,
  toast,
} from "@heroui/react";
import { User } from "@/generated/prisma/client";
import { useState } from "react";

export default function AddUserForm({
  onSuccess,
}: {
  onSuccess?: (user: User) => void;
}) {
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
      reset();
      setOpen(false);
    } else {
      toast.danger("Failed to create user");
    }
    setLoading(false);
  }

  return (
    <Modal isOpen={open} onOpenChange={setOpen}>
      <Button variant="primary" onPress={() => setOpen(true)}>
        <Plus /> Add User
      </Button>
      <Modal.Backdrop>
        <Modal.Container placement="auto">
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
                <Plus className="size-5" />
              </Modal.Icon>
              <Modal.Heading>Add New User</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-6 flex flex-col gap-4">
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
                <Input placeholder="Nickname" />
              </TextField>
              <TextField value={username} onChange={setUsername} isRequired>
                <Label>Username</Label>
                <Input placeholder="Username" />
              </TextField>
              <TextField
                type="password"
                value={password}
                onChange={setPassword}
                isRequired
              >
                <Label>Password</Label>
                <Input placeholder="Password" />
              </TextField>
              <RadioGroup value={role} onChange={setRole} orientation="horizontal">
                <Label>Role</Label>
                <Radio value="STUDENT">Student</Radio>
                <Radio value="EDUCATOR">Educator</Radio>
                <Radio value="EMPLOYEE">Employee</Radio>
                <Radio value="ADMIN">Admin</Radio>
              </RadioGroup>
              <RadioGroup
                value={gender}
                onChange={setGender}
                orientation="horizontal"
              >
                <Label>Gender</Label>
                <Radio value="M">Male</Radio>
                <Radio value="F">Female</Radio>
              </RadioGroup>
              <TextField value={birthday} onChange={setBirthday} type="date">
                <Label>Date of Birth</Label>
                <Input />
              </TextField>
            </Modal.Body>
            <Modal.Footer>
              <Button
                slot="close"
                variant="secondary"
                onPress={reset}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                isDisabled={loading}
                onPress={handleCreate}
              >
                {loading ? "Creating..." : "Create"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
