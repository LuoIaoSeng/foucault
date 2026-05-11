"use client";

import { Plus } from "@gravity-ui/icons";
import {
  Avatar,
  AvatarFallback,
  Button,
  ComboBox,
  Input,
  Label,
  ListBox,
  Modal,
  Tag,
  TagGroup,
  TextField,
  toast,
  useListData,
} from "@heroui/react";
import type { Key } from "@react-types/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserOption = {
  id: number;
  username: string;
  firstname: string | null;
  lastname: string;
};

export default function AddCourseForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [semester, setSemester] = useState("");
  const [educatorId, setEducatorId] = useState<number | null>(null);
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [faculties, setFaculties] = useState<
    Array<{ id: number; code: string; name: string }>
  >([]);

  const selectedTAs = useListData<UserOption>({
    getKey: (item) => item.id,
  });

  useEffect(() => {
    if (open) {
      fetch("/api/user/users")
        .then((r) => r.json())
        .then((data: any[]) => setUsers(data));
      fetch("/api/user/faculties")
        .then((r) => r.json())
        .then((data) => setFaculties(data));
    }
  }, [open]);

  const educators = users.filter(
    (u: any) => u.role === "EDUCATOR" || u.role === "ADMIN",
  );

  function reset() {
    setCode("");
    setName("");
    setDescription("");
    setSemester("");
    setEducatorId(null);
    setFacultyId(null);
    selectedTAs.remove(...selectedTAs.items.map((t) => t.id));
  }

  async function handleCreate() {
    if (!code || !name || !semester || educatorId == null) {
      toast.danger("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/course/", {
      method: "post",
      body: JSON.stringify({
        code,
        name,
        description,
        semester,
        educatorId,
        facultyId,
        taIds: selectedTAs.items.map((t) => t.id),
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (res.ok) {
      toast.success("Course created");
      router.refresh();
      reset();
      setOpen(false);
    } else {
      toast.danger("Failed to create course");
    }
    setLoading(false);
  }

  return (
    <Modal isOpen={open} onOpenChange={setOpen}>
      <Button variant="primary" onPress={() => setOpen(true)}>
        <Plus /> Add Course
      </Button>
      <Modal.Backdrop>
        <Modal.Container placement="auto">
          <Modal.Dialog className="sm:max-w-xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
                <Plus className="size-5" />
              </Modal.Icon>
              <Modal.Heading>Add New Course</Modal.Heading>
            </Modal.Header>

            <Modal.Body className="p-8 flex flex-col gap-5">
              <div className="flex gap-4">
                <TextField
                  className="flex-1"
                  value={code}
                  onChange={setCode}
                  isRequired
                >
                  <Label>Course Code</Label>
                  <Input placeholder="e.g. CS101" />
                </TextField>
                <TextField
                  className="flex-1"
                  value={semester}
                  onChange={setSemester}
                  isRequired
                >
                  <Label>Semester</Label>
                  <Input placeholder="e.g. 2025-Fall" />
                </TextField>
              </div>
              <TextField value={name} onChange={setName} isRequired>
                <Label>Course Name</Label>
                <Input placeholder="e.g. Introduction to Computer Science" />
              </TextField>
              <TextField value={description} onChange={setDescription}>
                <Label>Description</Label>
                <Input placeholder="Brief course description (optional)" />
              </TextField>
              <ComboBox
                isRequired
                selectedKey={educatorId}
                onSelectionChange={(k) => setEducatorId(k as number)}
              >
                <Label>Educator</Label>
                <ComboBox.InputGroup>
                  <Input placeholder="Select educator..." />
                  <ComboBox.Trigger />
                </ComboBox.InputGroup>
                <ComboBox.Popover>
                  <ListBox>
                    {educators.map((e) => (
                      <ListBox.Item key={e.id} id={e.id} textValue={e.username}>
                        <div className="flex flex-col">
                          <span>
                            {e.firstname} {e.lastname}
                          </span>
                          <span className="text-xs text-(--tt-color-text-gray)">
                            @{e.username}
                          </span>
                        </div>
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </ComboBox.Popover>
              </ComboBox>

              <ComboBox
                selectedKey={facultyId}
                onSelectionChange={(k) => setFacultyId(k as number)}
              >
                <Label>Faculty (optional)</Label>
                <ComboBox.InputGroup>
                  <Input placeholder="Select faculty..." />
                  <ComboBox.Trigger />
                </ComboBox.InputGroup>
                <ComboBox.Popover>
                  <ListBox>
                    {faculties.map((f) => (
                      <ListBox.Item key={f.id} id={f.id} textValue={f.name}>
                        <div className="flex flex-col">
                          <span>{f.name}</span>
                          <span className="text-xs text-(--tt-color-text-gray)">
                            {f.code}
                          </span>
                        </div>
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </ComboBox.Popover>
              </ComboBox>

              {/* TA selector */}
              <div className="flex flex-col gap-2">
                <ComboBox
                  onSelectionChange={(k) => {
                    if (k == null) return;
                    const user = users.find((u) => u.id === k);
                    if (user && !selectedTAs.getItem(user.id)) {
                      selectedTAs.append(user);
                    }
                  }}
                >
                  <Label>Teaching Assistants (optional)</Label>
                  <ComboBox.InputGroup>
                    <Input placeholder="Search users to add as TA..." />
                    <ComboBox.Trigger />
                  </ComboBox.InputGroup>
                  <ComboBox.Popover>
                    <ListBox>
                      {users
                        .filter((u) => !selectedTAs.getItem(u.id) && u.id !== educatorId)
                        .map((u) => (
                          <ListBox.Item key={u.id} id={u.id} textValue={u.username}>
                            <Avatar size="sm">
                              <AvatarFallback>
                                {u.firstname?.at(0) ?? ""}
                                {u.lastname?.at(0) ?? ""}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span>
                                {u.firstname} {u.lastname}
                              </span>
                              <span className="text-xs text-(--tt-color-text-gray)">
                                @{u.username}
                              </span>
                            </div>
                          </ListBox.Item>
                        ))}
                    </ListBox>
                  </ComboBox.Popover>
                </ComboBox>
                <TagGroup
                  onRemove={(keys: Set<Key>) => {
                    for (const key of keys) {
                      selectedTAs.remove(key);
                    }
                  }}
                >
                  <TagGroup.List
                    items={selectedTAs.items}
                    renderEmptyState={() => (
                      <span className="text-xs text-(--tt-color-text-gray)">
                        No TAs selected
                      </span>
                    )}
                  >
                    {(user) => (
                      <Tag key={user.id} id={user.id} textValue={user.username}>
                        {user.firstname} {user.lastname}
                      </Tag>
                    )}
                  </TagGroup.List>
                </TagGroup>
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
                {loading ? "Creating..." : "Create Course"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
