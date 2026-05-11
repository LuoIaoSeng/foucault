"use client";

import { PencilToSquare, TrashBin } from "@gravity-ui/icons";
import {
  AlertDialog,
  Button,
  Chip,
  Pagination,
  SearchField,
  Table,
  toast,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const ROWS_PER_PAGE = 10;

export default function CourseTable({
  courses: initialCourses,
}: {
  courses: Array<{
    id: number;
    code: string;
    name: string;
    description: string | null;
    semester: string;
    educatorId: number;
    educator: { firstname: string | null; lastname: string; username: string };
    enrollments: Array<{ id: number }>;
  }>;
}) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);

  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!search) return courses;
    const q = search.toLowerCase();
    return courses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.semester.toLowerCase().includes(q),
    );
  }, [courses, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filtered.slice(start, start + ROWS_PER_PAGE);
  }, [filtered, page]);

  const start = filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, filtered.length);

  async function handleDelete(id: number) {
    setDeleting(id);
    const res = await fetch(`/api/course/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success("Course deleted");
    } else {
      toast.danger("Failed to delete course");
    }
    setDeleting(null);
  }

  return (
    <>
      <SearchField value={search} onChange={setSearch} className="max-w-xs">
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Search courses..." />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <Table variant="secondary">
        <Table.ResizableContainer className="overflow-x-hidden">
          <Table.Content aria-label="Courses table" className="min-w-150">
            <Table.Header>
              <Table.Column isRowHeader>Code</Table.Column>
              <Table.Column>Name</Table.Column>
              <Table.Column>Semester</Table.Column>
              <Table.Column>Educator</Table.Column>
              <Table.Column>Students</Table.Column>
              <Table.Column>Actions</Table.Column>
            </Table.Header>
            <Table.Body>
              {paginated.length === 0 ? (
                <Table.Row>
                  <Table.Cell>{" "}</Table.Cell>
                  <Table.Cell>{" "}</Table.Cell>
                  <Table.Cell>No courses found.</Table.Cell>
                  <Table.Cell>{" "}</Table.Cell>
                  <Table.Cell>{" "}</Table.Cell>
                  <Table.Cell>{" "}</Table.Cell>
                </Table.Row>
              ) : (
                paginated.map((course) => (
                  <Table.Row key={course.id}>
                    <Table.Cell>
                      <Chip size="sm" variant="primary">
                        {course.code}
                      </Chip>
                    </Table.Cell>
                    <Table.Cell>{course.name}</Table.Cell>
                    <Table.Cell>{course.semester}</Table.Cell>
                    <Table.Cell>
                      {course.educator?.firstname} {course.educator?.lastname}
                    </Table.Cell>
                    <Table.Cell>{course.enrollments?.length ?? 0}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="tertiary"
                          onPress={() =>
                            router.push(`/admin/courses/${course.id}`)
                          }
                        >
                          <PencilToSquare />
                        </Button>
                        <AlertDialog>
                          <Button isIconOnly size="sm" variant="danger">
                            <TrashBin />
                          </Button>
                          <AlertDialog.Backdrop>
                            <AlertDialog.Container>
                              <AlertDialog.Dialog className="sm:max-w-100">
                                <AlertDialog.CloseTrigger />
                                <AlertDialog.Header>
                                  <AlertDialog.Icon status="danger" />
                                  <AlertDialog.Heading>
                                    Delete this course?
                                  </AlertDialog.Heading>
                                </AlertDialog.Header>
                                <AlertDialog.Body>
                                  <p>
                                    This will permanently delete{" "}
                                    <strong>{course.name}</strong> and all
                                    enrollments. This action cannot be undone.
                                  </p>
                                </AlertDialog.Body>
                                <AlertDialog.Footer>
                                  <Button slot="close" variant="tertiary">
                                    Cancel
                                  </Button>
                                  <Button
                                    slot="close"
                                    variant="danger"
                                    isDisabled={deleting === course.id}
                                    onPress={() => handleDelete(course.id)}
                                  >
                                    {deleting === course.id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </Button>
                                </AlertDialog.Footer>
                              </AlertDialog.Dialog>
                            </AlertDialog.Container>
                          </AlertDialog.Backdrop>
                        </AlertDialog>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Content>
        </Table.ResizableContainer>
        <Table.Footer>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-(--tt-color-text-gray)">
              {filtered.length === 0
                ? "No results"
                : `${start}–${end} of ${filtered.length}`}
            </span>
            <Pagination size="sm">
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous
                    isDisabled={page === 1}
                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <Pagination.PreviousIcon />
                  </Pagination.Previous>
                </Pagination.Item>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Pagination.Item key={p}>
                      <Pagination.Link
                        isActive={p === page}
                        onPress={() => setPage(p)}
                      >
                        {p}
                      </Pagination.Link>
                    </Pagination.Item>
                  ),
                )}
                <Pagination.Item>
                  <Pagination.Next
                    isDisabled={page === totalPages}
                    onPress={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          </div>
        </Table.Footer>
      </Table>
    </>
  );
}
