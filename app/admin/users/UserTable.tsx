"use client";

import { User } from "@/generated/prisma/client";
import { PencilToSquare, TrashBin } from "@gravity-ui/icons";
import {
  AlertDialog,
  Avatar,
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

const roleColorMap: Record<string, "accent" | "default" | "warning"> = {
  ADMIN: "accent",
  EDUCATOR: "warning",
  EMPLOYEE: "warning",
  STUDENT: "default",
};

export default function UserTable({ users: initialUsers }: { users: Array<User> }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.nickname?.toLowerCase().includes(q) ||
        u.firstname?.toLowerCase().includes(q) ||
        u.lastname?.toLowerCase().includes(q),
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filtered.slice(start, start + ROWS_PER_PAGE);
  }, [filtered, page]);

  const start = filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, filtered.length);

  async function handleDelete(id: number) {
    setDeleting(id);
    const res = await fetch(`/api/user/admin/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted");
    } else {
      toast.danger("Failed to delete user");
    }
    setDeleting(null);
  }

  return (
    <>
      <SearchField value={search} onChange={setSearch} className="max-w-xs">
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Search users..." />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <Table variant="secondary">
        <Table.ResizableContainer className="overflow-x-hidden">
          <Table.Content aria-label="Users table" className="min-w-150">
            <Table.Header>
              <Table.Column isRowHeader>ID</Table.Column>
              <Table.Column>User</Table.Column>
              <Table.Column>Nickname</Table.Column>
              <Table.Column>First Name</Table.Column>
              <Table.Column>Last Name</Table.Column>
              <Table.Column>Role</Table.Column>
              <Table.Column>Faculty</Table.Column>
              <Table.Column>Actions</Table.Column>
            </Table.Header>
            <Table.Body>
              {paginated.length === 0 ? (
                <Table.Row>
                  <Table.Cell>{" "}</Table.Cell>
                  <Table.Cell>{" "}</Table.Cell>
                  <Table.Cell>{" "}</Table.Cell>
                  <Table.Cell>{" "}</Table.Cell>
                  <Table.Cell>No users found.</Table.Cell>
                  <Table.Cell>{" "}</Table.Cell>
                  <Table.Cell>{" "}</Table.Cell>
                  <Table.Cell>{" "}</Table.Cell>
                </Table.Row>
              ) : (
                paginated.map((user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell>{user.id}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          <Avatar.Image
                            alt={`${user.firstname ?? ""} ${user.lastname}`}
                            src={user.avatorPath ? "/" + user.avatorPath : ""}
                          />
                          <Avatar.Fallback>
                            {user.firstname?.at(0) ?? ""}
                            {user.lastname?.at(0) ?? ""}
                          </Avatar.Fallback>
                        </Avatar>
                        <span>{user.username}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>{user.nickname}</Table.Cell>
                    <Table.Cell>{user.firstname}</Table.Cell>
                    <Table.Cell>{user.lastname}</Table.Cell>
                    <Table.Cell>
                      <Chip color={roleColorMap[user.role]} size="sm" variant="primary">
                        {user.role}
                      </Chip>
                    </Table.Cell>
                    <Table.Cell>{(user as any).faculty?.code ?? "—"}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="tertiary"
                          onPress={() => router.push(`/admin/users/${user.id}`)}
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
                                    Delete user permanently?
                                  </AlertDialog.Heading>
                                </AlertDialog.Header>
                                <AlertDialog.Body>
                                  <p>
                                    This will permanently delete{" "}
                                    <strong>{user.username}</strong> and all
                                    associated data. This action cannot be
                                    undone.
                                  </p>
                                </AlertDialog.Body>
                                <AlertDialog.Footer>
                                  <Button slot="close" variant="tertiary">
                                    Cancel
                                  </Button>
                                  <Button
                                    slot="close"
                                    variant="danger"
                                    isDisabled={deleting === user.id}
                                    onPress={() => handleDelete(user.id)}
                                  >
                                    {deleting === user.id ? "Deleting..." : "Delete"}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Pagination.Item key={p}>
                    <Pagination.Link
                      isActive={p === page}
                      onPress={() => setPage(p)}
                    >
                      {p}
                    </Pagination.Link>
                  </Pagination.Item>
                ))}
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
