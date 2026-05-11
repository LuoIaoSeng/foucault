"use client";

import { Check, Plus, TrashBin } from "@gravity-ui/icons";
import {
  Avatar,
  AvatarFallback,
  Button,
  ComboBox,
  Input,
  Label,
  ListBox,
  Radio,
  RadioGroup,
  Surface,
  Tag,
  TagGroup,
  TextField,
  toast,
  useListData,
} from "@heroui/react";
import type { Key } from "@react-types/shared";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SimpleEditor } from "@/app/components/SimpleEditor";

type UserOption = {
  id: number;
  username: string;
  firstname: string | null;
  lastname: string;
};

type LinkItem = { label: string; url: string };

type ResourceItem = {
  id: string;
  title: string;
  type: "links" | "assignment";
  links?: LinkItem[];
  description?: string;
  deadline?: string;
  submissionUrl?: string;
};

function newResource(type: "links" | "assignment"): ResourceItem {
  const id = crypto.randomUUID();
  if (type === "links") return { id, title: "", type: "links", links: [] };
  return { id, title: "", type: "assignment", description: "", deadline: "", submissionUrl: "" };
}

export default function CourseForm({
  course,
}: {
  course: {
    id: number;
    code: string;
    name: string;
    description: string | null;
    content: any;
    semester: string;
    educatorId: number;
    facultyId?: number | null;
    tas?: Array<{ id: number; firstname: string | null; lastname: string; username: string }>;
  };
}) {
  const router = useRouter();
  const editorRef = useRef<{ getContent: () => string }>(null);

  const [code, setCode] = useState(course.code);
  const [name, setName] = useState(course.name);
  const [description, setDescription] = useState(course.description ?? "");
  const [semester, setSemester] = useState(course.semester);
  const [educatorId, setEducatorId] = useState<number>(course.educatorId);
  const [facultyId, setFacultyId] = useState<number | null>(course.facultyId ?? null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [faculties, setFaculties] = useState<
    Array<{ id: number; code: string; name: string }>
  >([]);
  const [isSaving, setIsSaving] = useState(false);

  const initialResources: ResourceItem[] =
    (course.content as any)?.resources ?? [];
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);

  const selectedTAs = useListData<UserOption>({
    initialItems: (course.tas ?? []).map((t) => ({
      id: t.id,
      username: t.username,
      firstname: t.firstname,
      lastname: t.lastname,
    })),
    getKey: (item) => item.id,
  });

  useEffect(() => {
    fetch("/api/user/users")
      .then((r) => r.json())
      .then((data: any[]) => setUsers(data));
    fetch("/api/user/faculties")
      .then((r) => r.json())
      .then((data) => setFaculties(data));
  }, []);

  const educators = users.filter(
    (u: any) => u.role === "EDUCATOR" || u.role === "ADMIN",
  );

  function addResource(type: "links" | "assignment") {
    setResources((prev) => [...prev, newResource(type)]);
  }

  function updateResource(index: number, r: ResourceItem) {
    setResources((prev) => prev.map((item, i) => (i === index ? r : item)));
  }

  function removeResource(index: number) {
    setResources((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!code || !name || !semester || educatorId == null) {
      toast.danger("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    const richContent = editorRef.current?.getContent();

    const res = await fetch(`/api/course/${course.id}`, {
      method: "put",
      body: JSON.stringify({
        code,
        name,
        description,
        semester,
        educatorId,
        facultyId,
        content: {
          description: richContent ?? (course.content as any)?.description ?? "",
          resources,
        },
        taIds: selectedTAs.items.map((t) => t.id),
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (res.ok) {
      toast.success("Course updated");
      router.refresh();
    } else {
      toast.danger("Failed to update course");
    }
    setIsSaving(false);
  }

  return (
    <div className="max-w-4xl flex flex-col gap-8">
      {/* Course info */}
      <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
        <h3 className="text-lg font-semibold mb-6">Course Information</h3>
        <div className="flex flex-col gap-5">
          <div className="flex gap-4">
            <TextField className="flex-1" value={code} onChange={setCode} isRequired>
              <Label>Course Code</Label>
              <Input placeholder="e.g. CS101" />
            </TextField>
            <TextField className="flex-1" value={semester} onChange={setSemester} isRequired>
              <Label>Semester</Label>
              <Input placeholder="e.g. 2025-Fall" />
            </TextField>
          </div>
          <TextField value={name} onChange={setName} isRequired className="max-w-lg">
            <Label>Course Name</Label>
            <Input placeholder="Course name" />
          </TextField>
          <TextField value={description} onChange={setDescription} className="max-w-lg">
            <Label>Description</Label>
            <Input placeholder="Brief course description" />
          </TextField>
          <ComboBox isRequired selectedKey={educatorId} onSelectionChange={(k) => setEducatorId(k as number)} className="max-w-xs">
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
                      <span>{e.firstname} {e.lastname}</span>
                      <span className="text-xs text-(--tt-color-text-gray)">@{e.username}</span>
                    </div>
                  </ListBox.Item>
                ))}
              </ListBox>
            </ComboBox.Popover>
          </ComboBox>
          <ComboBox selectedKey={facultyId} onSelectionChange={(k) => setFacultyId(k as number | null)} className="max-w-xs">
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
                      <span className="text-xs text-(--tt-color-text-gray)">{f.code}</span>
                    </div>
                  </ListBox.Item>
                ))}
              </ListBox>
            </ComboBox.Popover>
          </ComboBox>

          {/* TA management */}
          <div className="flex flex-col gap-2">
            <ComboBox
              onSelectionChange={(k) => {
                if (k == null) return;
                const user = users.find((u) => u.id === k);
                if (user && !selectedTAs.getItem(user.id)) selectedTAs.append(user);
              }}
            >
              <Label>Teaching Assistants (optional)</Label>
              <ComboBox.InputGroup>
                <Input placeholder="Search users to add as TA..." />
                <ComboBox.Trigger />
              </ComboBox.InputGroup>
              <ComboBox.Popover>
                <ListBox>
                  {users.filter((u) => !selectedTAs.getItem(u.id) && u.id !== educatorId).map((u) => (
                    <ListBox.Item key={u.id} id={u.id} textValue={u.username}>
                      <Avatar size="sm"><AvatarFallback>{u.firstname?.at(0) ?? ""}{u.lastname?.at(0) ?? ""}</AvatarFallback></Avatar>
                      <div className="flex flex-col">
                        <span>{u.firstname} {u.lastname}</span>
                        <span className="text-xs text-(--tt-color-text-gray)">@{u.username}</span>
                      </div>
                    </ListBox.Item>
                  ))}
                </ListBox>
              </ComboBox.Popover>
            </ComboBox>
            <TagGroup onRemove={(keys: Set<Key>) => { for (const key of keys) selectedTAs.remove(key); }}>
              <TagGroup.List
                items={selectedTAs.items}
                renderEmptyState={() => <span className="text-xs text-(--tt-color-text-gray)">No TAs assigned</span>}
              >
                {(user) => (
                  <Tag key={user.id} id={user.id} textValue={user.username}>
                    {user.firstname} {user.lastname}
                  </Tag>
                )}
              </TagGroup.List>
            </TagGroup>
          </div>

          <div>
            <Button onPress={handleSave} isDisabled={isSaving}>
              <Check />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Surface>

      {/* Rich content editor */}
      <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
        <h3 className="text-lg font-semibold mb-2">Course Content</h3>
        <p className="text-sm text-(--tt-color-text-gray) mb-6">
          Rich course description, syllabus, lecture notes and any HTML content.
        </p>
        <div className="min-h-[400px] border border-(--tt-border-color) rounded-xl">
          <SimpleEditor ref={editorRef} />
        </div>
      </Surface>

      {/* Resources & Assignments */}
      <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Resources & Assignments</h3>
            <p className="text-sm text-(--tt-color-text-gray) mt-1">
              Lecture links, file shares, assignment submission URLs.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onPress={() => addResource("links")}>
              <Plus /> Links
            </Button>
            <Button variant="ghost" size="sm" onPress={() => addResource("assignment")}>
              <Plus /> Assignment
            </Button>
          </div>
        </div>

        {resources.length === 0 ? (
          <div className="text-center py-12 text-(--tt-color-text-gray)">
            <p>No resources yet. Add lecture links or assignments.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {resources.map((r, i) => (
              <div key={r.id} className="border border-(--tt-border-color) rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <TextField className="flex-1" value={r.title} onChange={(v) => updateResource(i, { ...r, title: v })}>
                    <Input placeholder="Resource title (e.g. Lecture 1 Slides)" />
                  </TextField>
                  <Button isIconOnly variant="ghost" size="sm" onPress={() => removeResource(i)}>
                    <TrashBin />
                  </Button>
                </div>

                <RadioGroup value={r.type} onChange={(v) => updateResource(i, { ...newResource(v as "links" | "assignment"), id: r.id, title: r.title })} orientation="horizontal">
                  <Radio value="links">Links</Radio>
                  <Radio value="assignment">Assignment</Radio>
                </RadioGroup>

                {r.type === "links" && (
                  <LinkListEditor
                    links={r.links ?? []}
                    onChange={(links) => updateResource(i, { ...r, links })}
                  />
                )}

                {r.type === "assignment" && (
                  <div className="flex flex-col gap-3">
                    <TextField value={r.description ?? ""} onChange={(v) => updateResource(i, { ...r, description: v })}>
                      <Label>Description</Label>
                      <Input placeholder="e.g. Submit your homework here" />
                    </TextField>
                    <div className="flex gap-4">
                      <TextField className="flex-1" value={r.deadline ?? ""} onChange={(v) => updateResource(i, { ...r, deadline: v })} type="date">
                        <Label>Deadline (optional)</Label>
                        <Input />
                      </TextField>
                      <TextField className="flex-[2]" value={r.submissionUrl ?? ""} onChange={(v) => updateResource(i, { ...r, submissionUrl: v })}>
                        <Label>Submission URL</Label>
                        <Input placeholder="https://forms.gle/... or /uploads/..." />
                      </TextField>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Surface>
    </div>
  );
}

function LinkListEditor({
  links,
  onChange,
}: {
  links: LinkItem[];
  onChange: (items: LinkItem[]) => void;
}) {
  function add() { onChange([...links, { label: "", url: "" }]); }
  function update(index: number, field: keyof LinkItem, value: string) {
    const next = [...links];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  }
  function remove(index: number) { onChange(links.filter((_, i) => i !== index)); }

  return (
    <div className="flex flex-col gap-2 pl-4 border-l-2 border-(--tt-brand-color-100)">
      <Label>Links / Resources</Label>
      {links.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input className="flex-1" placeholder="Label (e.g. Lecture Slides)" value={item.label} onChange={(e) => update(i, "label", e.target.value)} />
          <Input className="flex-[2]" placeholder="URL (https://...)" value={item.url} onChange={(e) => update(i, "url", e.target.value)} />
          <Button isIconOnly variant="ghost" size="sm" onPress={() => remove(i)}><TrashBin /></Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onPress={add}><Plus /> Add Link</Button>
    </div>
  );
}
