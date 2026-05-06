"use client";
import { Plus } from "@gravity-ui/icons";
import { TextField, Label, Input, RadioGroup, Radio, Button, Modal, Surface, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function () {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [gender, setGender] = useState('M');
  const [birthday, setBirthday] = useState('');

  return (
    <Modal>
      <Button variant="primary"><Plus /> Add User</Button>
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
            <Modal.Body className="p-6">
              <Surface variant="default">
                <form className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                  }}>
                  <div className="flex gap-4">
                    <TextField className="flex-1" value={firstname} onChange={setFirstname}>
                      <Label>First Name</Label>
                      <Input placeholder="First name" />
                    </TextField>
                    <TextField className="flex-1" value={lastname} onChange={setLastname}>
                      <Label>Last Name</Label>
                      <Input placeholder="Last name" />
                    </TextField>
                  </div>
                  <TextField className="w-full" value={nickname} onChange={setNickname}>
                    <Label>Nickname</Label>
                    <Input placeholder="Nickname" />
                  </TextField>
                  <TextField className="w-full" value={username} onChange={setUsername}>
                    <Label>Username</Label>
                    <Input placeholder="Username" />
                  </TextField>
                  <TextField className="w-full" type="password" value={password} onChange={setPassword}>
                    <Label>Password</Label>
                    <Input placeholder="Password" />
                  </TextField>
                  <RadioGroup value={role} onChange={setRole} orientation="horizontal">
                    <Label className="mb-2">Role</Label>
                    <Radio value="ADMIN">
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Radio.Content>
                        <Label>Admin</Label>
                      </Radio.Content>
                    </Radio>
                    <Radio value="EDUCATOR">
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Radio.Content>
                        <Label>Educator</Label>
                      </Radio.Content>
                    </Radio>
                    <Radio value="STUDENT">
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Radio.Content>
                        <Label>Student</Label>
                      </Radio.Content>
                    </Radio>
                    <Radio value="EMPLOYEE">
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Radio.Content>
                        <Label>Employee</Label>
                      </Radio.Content>
                    </Radio>
                  </RadioGroup>
                  <TextField className="w-full" type="date" value={birthday} onChange={setBirthday}>
                    <Label>Date of birth</Label>
                    <Input />
                  </TextField>
                  <RadioGroup value={gender} onChange={setGender} orientation="horizontal">
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
                </form>
              </Surface>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                Cancel
              </Button>
              <Button
                onPress={async () => {
                  const response = await fetch('/api/user/admin/create', {
                    method: 'post',
                    body: JSON.stringify({
                      username,
                      password,
                      nickname,
                      firstname: firstname,
                      lastname: lastname,
                      role,
                      gender,
                      birthday
                    }),
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                  });
                  if (response.ok) {
                    // router.refresh()
                    location.reload()
                    toast.success('Create user successfully')
                  } else {
                    toast.danger('Create user failed')
                  }
                }} slot="close" variant="primary">
                Create
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
