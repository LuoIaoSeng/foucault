"use client";

import { Check } from "@gravity-ui/icons";
import {
  Button,
  ComboBox,
  Input,
  Label,
  ListBox,
  Separator,
  Surface,
  TextField,
  toast,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SimpleEditor } from "@/app/components/SimpleEditor";
import { useRef } from "react";

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
  };
}) {
  const router = useRouter();
  const editorRef = useRef<{ getContent: () => string }>(null);

  const [code, setCode] = useState(course.code);
  const [name, setName] = useState(course.name);
  const [description, setDescription] = useState(course.description ?? "");
  const [semester, setSemester] = useState(course.semester);
  const [educatorId, setEducatorId] = useState<number>(course.educatorId);
  const [educators, setEducators] = useState<
    Array<{
      id: number;
      username: string;
      firstname: string | null;
      lastname: string;
    }>
  >([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/users")
      .then((r) => r.json())
      .then((data: any[]) => {
        setEducators(
          data.filter((u: any) => u.role === "EDUCATOR" || u.role === "ADMIN"),
        );
      });
  }, []);

  async function handleSave() {
    if (!code || !name || !semester || educatorId == null) {
      toast.danger("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    const content = editorRef.current?.getContent();
    const contentJson = content
      ? { description: content }
      : course.content;

    const res = await fetch(`/api/course/${course.id}`, {
      method: "put",
      body: JSON.stringify({
        code,
        name,
        description,
        semester,
        educatorId,
        content: contentJson,
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

  const contentHtml =
    course.content?.description ?? course.content ?? "";

  return (
    <div className="max-w-4xl flex flex-col gap-8">
      {/* Course info */}
      <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
        <h3 className="text-lg font-semibold mb-6">Course Information</h3>
        <div className="flex flex-col gap-5">
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
          <TextField
            value={name}
            onChange={setName}
            isRequired
            className="max-w-lg"
          >
            <Label>Course Name</Label>
            <Input placeholder="Course name" />
          </TextField>
          <TextField
            value={description}
            onChange={setDescription}
            className="max-w-lg"
          >
            <Label>Description</Label>
            <Input placeholder="Brief course description" />
          </TextField>
          <ComboBox
            isRequired
            selectedKey={educatorId}
            onSelectionChange={(k) => setEducatorId(k as number)}
            className="max-w-xs"
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
          <div>
            <Button onPress={handleSave} isDisabled={isSaving}>
              <Check />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Surface>

      {/* Course content (Moodle-like rich editor) */}
      <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
        <h3 className="text-lg font-semibold mb-2">Course Content</h3>
        <p className="text-sm text-(--tt-color-text-gray) mb-6">
          Customize the course page content with rich text, images, and
          resources.
        </p>
        <div className="min-h-[400px] border border-(--tt-border-color) rounded-xl">
          <SimpleEditor ref={editorRef} />
        </div>
      </Surface>
    </div>
  );
}
