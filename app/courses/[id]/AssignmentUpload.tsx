"use client";

import { useState } from "react";
import { Button, toast } from "@heroui/react";
import { Check } from "@gravity-ui/icons";

export function AssignmentUpload({
  courseId,
  assignmentId,
  existingSubmission,
}: {
  courseId: number;
  assignmentId: string;
  existingSubmission?: { id: number; fileName: string; fileUrl: string; submittedAt: string } | null;
}) {
  const [uploading, setUploading] = useState(false);
  const [submission, setSubmission] = useState(existingSubmission);

  async function handleUpload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("assignmentId", assignmentId);
    formData.append("courseId", String(courseId));

    const res = await fetch("/api/assignment", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      setSubmission(data.submission);
      toast.success("Assignment submitted successfully");
    } else {
      toast.danger("Failed to submit assignment");
    }
    setUploading(false);
  }

  if (submission) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-(--tt-color-green-50) text-(--tt-color-green-700) text-sm">
        <Check className="w-4 h-4" />
        <span>Submitted: {submission.fileName}</span>
        <span className="text-(--tt-color-text-gray)">
          ({new Date(submission.submittedAt).toLocaleDateString()})
        </span>
        <button
          className="ml-2 text-(--tt-brand-color-500) hover:underline text-xs"
          onClick={() => setSubmission(undefined)}
        >
          Re-submit
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="file"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        className="text-sm text-(--tt-color-text-gray) file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-(--tt-brand-color-50) file:text-(--tt-brand-color-600) hover:file:bg-(--tt-brand-color-100)"
      />
      {uploading && <span className="text-sm text-(--tt-color-text-gray)">Uploading...</span>}
    </div>
  );
}
