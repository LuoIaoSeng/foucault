"use client";

import { Button, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EnrollButton({
  courseId,
  isEnrolled,
}: {
  courseId: number;
  isEnrolled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleEnroll() {
    setLoading(true);
    const res = await fetch(`/api/course/enroll/${courseId}`, {
      method: "post",
      credentials: "include",
    });
    if (res.ok) {
      toast.success("Enrolled successfully");
      router.refresh();
    } else {
      toast.danger("Failed to enroll");
    }
    setLoading(false);
  }

  if (isEnrolled) {
    return (
      <Button variant="ghost" isDisabled>
        Enrolled
      </Button>
    );
  }

  return (
    <Button onPress={handleEnroll} isDisabled={loading}>
      {loading ? "Enrolling..." : "Enroll"}
    </Button>
  );
}
