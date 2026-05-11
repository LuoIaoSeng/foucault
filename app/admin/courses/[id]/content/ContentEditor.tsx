"use client";

import { ArrowLeft, Check, Eye, Plus, TrashBin } from "@gravity-ui/icons";
import {
  Button,
  Input,
  Label,
  Separator,
  Surface,
  TextField,
  toast,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SimpleEditor } from "@/app/components/SimpleEditor";

type Section = {
  id: string;
  title: string;
  content: string;
};

type Resource = {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  deadline: string;
};

type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
};

type CourseContent = {
  sections: Section[];
  announcements: Announcement[];
  resources: Resource[];
  assignments: Assignment[];
};

function newSection(): Section {
  return { id: crypto.randomUUID(), title: "", content: "" };
}

function newResource(): Resource {
  return { id: crypto.randomUUID(), title: "", fileUrl: "", fileName: "" };
}

function newAssignment(): Assignment {
  return { id: crypto.randomUUID(), title: "", description: "", deadline: "" };
}

function newAnnouncement(): Announcement {
  return { id: crypto.randomUUID(), title: "", content: "", date: new Date().toISOString().slice(0, 10) };
}

export function ContentEditor({ course }: {
  course: {
    id: number; code: string; name: string;
    educatorId: number; semester: string;
    description: string | null; facultyId?: number | null;
    content: any;
  };
}) {
  const router = useRouter();
  const content = (course.content ?? {}) as CourseContent;

  const [sections, setSections] = useState<Section[]>(content.sections ?? []);
  const [resources, setResources] = useState<Resource[]>(content.resources ?? []);
  const [assignments, setAssignments] = useState<Assignment[]>(content.assignments ?? []);
  const [announcements, setAnnouncements] = useState<Announcement[]>(content.announcements ?? []);
  const [preview, setPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);

  const sectionEditorRefs = useRef<Map<string, any>>(new Map());

  function addSection() { setSections((p) => [...p, newSection()]); }
  function updateSectionTitle(index: number, title: string) {
    setSections((p) => p.map((item, i) => i === index ? { ...item, title } : item));
  }
  function removeSection(index: number) { setSections((p) => p.filter((_, i) => i !== index)); }

  function addResource() { setResources((p) => [...p, newResource()]); }
  function updateResource(index: number, r: Resource) { setResources((p) => p.map((item, i) => i === index ? r : item)); }
  function removeResource(index: number) { setResources((p) => p.filter((_, i) => i !== index)); }

  function addAssignment() { setAssignments((p) => [...p, newAssignment()]); }
  function updateAssignment(index: number, a: Assignment) { setAssignments((p) => p.map((item, i) => i === index ? a : item)); }
  function removeAssignment(index: number) { setAssignments((p) => p.filter((_, i) => i !== index)); }

  function addAnnouncement() { setAnnouncements((p) => [...p, newAnnouncement()]); }
  function updateAnnouncement(index: number, a: Announcement) { setAnnouncements((p) => p.map((item, i) => i === index ? a : item)); }
  function removeAnnouncement(index: number) { setAnnouncements((p) => p.filter((_, i) => i !== index)); }

  async function handleFileUpload(index: number, file: File) {
    setUploadingFile(file.name);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      updateResource(index, { ...resources[index], fileUrl: data.url, fileName: data.fileName });
    } else {
      toast.danger("File upload failed");
    }
    setUploadingFile(null);
  }

  async function handleSave() {
    setIsSaving(true);

    const sectionsWithContent = sections.map((s) => {
      const editorRef = sectionEditorRefs.current.get(s.id);
      return { ...s, content: editorRef?.getContent ? editorRef.getContent() : s.content };
    });

    const res = await fetch(`/api/course/${course.id}`, {
      method: "put",
      body: JSON.stringify({
        code: course.code, name: course.name,
        description: course.description, semester: course.semester,
        educatorId: course.educatorId, facultyId: course.facultyId ?? null,
        content: { sections: sectionsWithContent, announcements, resources, assignments },
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (res.ok) { toast.success("Content saved"); router.refresh(); }
    else { toast.danger("Failed to save content"); }
    setIsSaving(false);
  }

  return (
    <div className="max-w-6xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/admin/courses/${course.id}`}>
            <Button isIconOnly variant="ghost" size="sm"><ArrowLeft /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Sections</h1>
            <p className="text-sm text-(--tt-color-text-gray)">{course.code} — {course.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant={preview ? "primary" : "ghost"} onPress={() => setPreview(!preview)}>
            <Eye /> {preview ? "Editing" : "Preview"}
          </Button>
          <Button onPress={handleSave} isDisabled={isSaving}>
            <Check /> {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      <Separator />

      {preview ? (
        <div className="max-w-4xl">
          <CoursePreview
            announcements={announcements}
            sections={sections}
            resources={resources}
            assignments={assignments}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-8 max-w-4xl">
          {/* Sections */}
          <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Sections</h3>
                <p className="text-sm text-(--tt-color-text-gray) mt-1">
                  Course lecture sections — each section has a title and rich-text lecture content.
                </p>
              </div>
              <Button variant="ghost" size="sm" onPress={addSection}><Plus /> Add Section</Button>
            </div>
            {sections.length === 0 ? (
              <div className="text-center py-8 text-(--tt-color-text-gray)">
                <p>No sections yet. Add lecture sections for your course.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {sections.map((s, i) => (
                  <div key={s.id} className="border border-(--tt-border-color) rounded-xl p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <TextField className="flex-1" value={s.title} onChange={(v) => updateSectionTitle(i, v)}>
                        <Input placeholder="Section title (e.g. Week 1: Introduction)" />
                      </TextField>
                      <Button isIconOnly variant="ghost" size="sm" onPress={() => removeSection(i)}><TrashBin /></Button>
                    </div>
                    <div className="min-h-50 border border-(--tt-border-color) rounded-lg overflow-hidden">
                      <SimpleEditor
                        ref={(el: any) => {
                          if (el) sectionEditorRefs.current.set(s.id, el);
                          else sectionEditorRefs.current.delete(s.id);
                        }}
                        initialContent={s.content}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Surface>

          {/* Announcements */}
          <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Announcements</h3>
                <p className="text-sm text-(--tt-color-text-gray) mt-1">Post announcements visible to all enrolled students.</p>
              </div>
              <Button variant="ghost" size="sm" onPress={addAnnouncement}><Plus /> Add</Button>
            </div>
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-(--tt-color-text-gray)"><p>No announcements yet.</p></div>
            ) : (
              <div className="flex flex-col gap-4">
                {announcements.map((a, i) => (
                  <div key={a.id} className="border border-(--tt-border-color) rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <TextField className="flex-1" value={a.title} onChange={(v) => updateAnnouncement(i, { ...a, title: v })}>
                        <Input placeholder="Announcement title" />
                      </TextField>
                      <TextField className="w-40" type="date" value={a.date} onChange={(v) => updateAnnouncement(i, { ...a, date: v })}>
                        <Input />
                      </TextField>
                      <Button isIconOnly variant="ghost" size="sm" onPress={() => removeAnnouncement(i)}><TrashBin /></Button>
                    </div>
                    <TextField value={a.content} onChange={(v) => updateAnnouncement(i, { ...a, content: v })}>
                      <Input placeholder="Announcement content..." />
                    </TextField>
                  </div>
                ))}
              </div>
            )}
          </Surface>

          {/* Resources */}
          <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Resources</h3>
                <p className="text-sm text-(--tt-color-text-gray) mt-1">Upload files (PDF, slides, documents) for students to download.</p>
              </div>
              <Button variant="ghost" size="sm" onPress={addResource}><Plus /> Add Resource</Button>
            </div>
            {resources.length === 0 ? (
              <div className="text-center py-8 text-(--tt-color-text-gray)"><p>No resources yet.</p></div>
            ) : (
              <div className="flex flex-col gap-4">
                {resources.map((r, i) => (
                  <div key={r.id} className="border border-(--tt-border-color) rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <TextField className="flex-1" value={r.title} onChange={(v) => updateResource(i, { ...r, title: v })}>
                        <Input placeholder="Resource title" />
                      </TextField>
                      <Button isIconOnly variant="ghost" size="sm" onPress={() => removeResource(i)}><TrashBin /></Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(i, file);
                        }}
                        className="text-sm text-(--tt-color-text-gray) file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-(--tt-brand-color-50) file:text-(--tt-brand-color-600) hover:file:bg-(--tt-brand-color-100)"
                      />
                      {uploadingFile && r.fileName === uploadingFile && (
                        <span className="text-sm text-(--tt-color-text-gray)">Uploading...</span>
                      )}
                      {r.fileName && !uploadingFile && (
                        <span className="text-sm text-(--tt-brand-color-600) font-medium truncate max-w-50">{r.fileName}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Surface>

          {/* Assignments */}
          <Surface className="rounded-2xl border border-(--tt-card-border-color) p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Assignments</h3>
                <p className="text-sm text-(--tt-color-text-gray) mt-1">Create assignments with descriptions, deadlines, and submission links.</p>
              </div>
              <Button variant="ghost" size="sm" onPress={addAssignment}><Plus /> Add Assignment</Button>
            </div>
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-(--tt-color-text-gray)"><p>No assignments yet.</p></div>
            ) : (
              <div className="flex flex-col gap-6">
                {assignments.map((a, i) => (
                  <div key={a.id} className="border border-(--tt-border-color) rounded-xl p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <TextField className="flex-1" value={a.title} onChange={(v) => updateAssignment(i, { ...a, title: v })}>
                        <Input placeholder="Assignment title" />
                      </TextField>
                      <Button isIconOnly variant="ghost" size="sm" onPress={() => removeAssignment(i)}><TrashBin /></Button>
                    </div>
                    <div className="flex flex-col gap-3">
                      <TextField value={a.description} onChange={(v) => updateAssignment(i, { ...a, description: v })}>
                        <Label>Description</Label>
                        <Input placeholder="e.g. Submit your homework here" />
                      </TextField>
                      <TextField className="w-48" type="date" value={a.deadline} onChange={(v) => updateAssignment(i, { ...a, deadline: v })}>
                        <Label>Deadline</Label><Input />
                      </TextField>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Surface>
        </div>
      )}
    </div>
  );
}

function CoursePreview({
  announcements, sections, resources, assignments,
}: {
  announcements: Announcement[]; sections: Section[]; resources: Resource[]; assignments: Assignment[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-(--tt-brand-color-50) text-(--tt-brand-color-600) text-sm font-medium">
        <Eye className="w-4 h-4" /> Student preview — switch back to Editing to make changes.
      </div>

      {announcements.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Announcements</h2>
          {announcements.map((a) => (
            <Surface key={a.id} className="rounded-2xl border border-(--tt-card-border-color) p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{a.title || "Untitled"}</h3>
                <span className="text-xs text-(--tt-color-text-gray)">{a.date}</span>
              </div>
              {a.content && <p className="text-(--tt-color-text-gray)">{a.content}</p>}
            </Surface>
          ))}
        </div>
      )}

      {sections.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Sections</h2>
          {sections.map((s) => (
            <Surface key={s.id} className="rounded-2xl border border-(--tt-card-border-color) p-6">
              <h3 className="font-semibold text-lg mb-3">{s.title || "Untitled"}</h3>
              <div className="prose max-w-none text-(--tt-color-text-gray)" dangerouslySetInnerHTML={{ __html: s.content }} />
            </Surface>
          ))}
        </div>
      )}

      {resources.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Resources</h2>
          {resources.map((r) => (
            <Surface key={r.id} className="rounded-2xl border border-(--tt-card-border-color) p-6">
              <h3 className="font-semibold text-lg mb-3">{r.title || "Untitled"}</h3>
              {r.fileUrl ? (
                <a href={r.fileUrl} download={r.fileName} className="inline-flex items-center gap-2 p-3 rounded-xl bg-(--tt-brand-color-50) hover:bg-(--tt-brand-color-100) transition-colors text-(--tt-brand-color-700)">
                  <span>{r.fileName || "Download"}</span>
                </a>
              ) : (
                <p className="text-sm text-(--tt-color-text-gray)">No file uploaded.</p>
              )}
            </Surface>
          ))}
        </div>
      )}

      {assignments.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Assignments</h2>
          {assignments.map((a) => (
            <Surface key={a.id} className="rounded-2xl border border-(--tt-card-border-color) p-6">
              <h3 className="font-semibold text-lg mb-3">{a.title || "Untitled"}</h3>
              <div className="space-y-2">
                {a.description && <p className="text-(--tt-color-text-gray)">{a.description}</p>}
                <div className="flex flex-wrap gap-4 text-sm">
                  {a.deadline && <span className="text-(--tt-color-text-gray)">Due: {new Date(a.deadline).toLocaleDateString()}</span>}
                </div>
              </div>
            </Surface>
          ))}
        </div>
      )}

      {announcements.length === 0 && sections.length === 0 && resources.length === 0 && assignments.length === 0 && (
        <div className="text-center py-16 text-(--tt-color-text-gray)"><p className="text-lg">No content yet.</p></div>
      )}
    </div>
  );
}
