"use client";

import { User } from "@/generated/prisma/client";
import { PencilToSquare, TrashBin, Plus } from '@gravity-ui/icons';
import { AlertDialog, Avatar, Button, Chip, Description, Input, Label, Modal, Pagination, SearchField, Surface, Table } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import AddUserForm from "./AddUserForm";

const columns = [
  { id: "id", name: "Id" },
  { id: "nickname", name: "Nickname" },
  { id: "username", name: "Username" },
  { id: "first_name", name: "Firstname" },
  { id: "last_name", name: "Lastname" },
  { id: "role", name: "Role" },
  { id: "action", name: "Actions" },
];

const ROWS_PER_PAGE = 9;

const statusColorMap: Record<string, "accent" | "default" | "warning"> = {
  ADMIN: "accent",
  STUDENT: "default",
  EDUCATOR: "warning",
  EMPLOYEE: "warning"
};

export default function ({ users }: {
  users: Array<User>
}) {
  const [username, setUsername] = useState('')

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(users.length / ROWS_PER_PAGE);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;

    return users
      .filter((u) => {
        return u.username.includes(username)
      })
      .slice(start, start + ROWS_PER_PAGE);
  }, [page, username]);

  const start = (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, users.length);

  const router = useRouter()

  return (
    <>
      <div className="flex justify-between">
        <SearchField name="search" value={username} onChange={setUsername}>
          {/* <Label>Search Users</Label> */}
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input className="w-70" placeholder="Enter username" />
            <SearchField.ClearButton />
          </SearchField.Group>
          {/* <Description>Enter username to search for users</Description> */}
        </SearchField>
        <AddUserForm />
      </div>
      <Table>
        <Table.ResizableContainer>
          <Table.Content aria-label="Table with pagination" className="w-full">
            <Table.Header columns={columns}>
              {(column) => (
                <Table.Column isRowHeader={column.id === "id"}>
                  {column.name}
                  <Table.ColumnResizer />
                </Table.Column>
              )}
            </Table.Header>
            <Table.Body items={paginatedItems}>
              {(user) => (
                <Table.Row>
                  <Table.Cell>{user.id}</Table.Cell>
                  <Table.Cell>{user.nickname}</Table.Cell>
                  <Table.Cell className={`flex items-center gap-2`}>
                    <Avatar>
                      <Avatar.Image alt={`${user?.firstname ?? ''} ${user?.lastname}`} src={'/' + (user?.avatorPath ?? '')} />
                      <Avatar.Fallback>{`${user?.firstname?.at(0) ?? ''}${user?.lastname?.at(0) ?? ''}`}</Avatar.Fallback>
                    </Avatar>
                    <div>
                      {user.username}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{user.firstname}</Table.Cell>
                  <Table.Cell>{user.lastname}</Table.Cell>
                  <Table.Cell>
                    <Chip
                      color={statusColorMap[user.role]} size="sm" variant="primary">
                      {user.role}
                    </Chip>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex items-center gap-1">
                      <Button isIconOnly size="sm" variant="tertiary" onClick={() => router.push(`/admin/users/${user.id}`)}>
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
                                <AlertDialog.Heading>Delete this user permanently?</AlertDialog.Heading>
                              </AlertDialog.Header>
                              <AlertDialog.Body>
                                <p>
                                  This will permanently delete User <strong>#{user.id}</strong> and all of its
                                  data. This action cannot be undone.
                                </p>
                              </AlertDialog.Body>
                              <AlertDialog.Footer>
                                <Button slot="close" variant="tertiary">
                                  Cancel
                                </Button>
                                <Button slot="close" variant="danger" onPress={() => { alert('') }}>
                                  Delete User
                                </Button>
                              </AlertDialog.Footer>
                            </AlertDialog.Dialog>
                          </AlertDialog.Container>
                        </AlertDialog.Backdrop>
                      </AlertDialog>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ResizableContainer>
        <Table.Footer>
          <Pagination size="sm">
            <Pagination.Summary>
              {start} to {end} of {users.length} results
            </Pagination.Summary>
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={page === 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <Pagination.PreviousIcon />
                  Prev
                </Pagination.Previous>
              </Pagination.Item>
              {pages.map((p) => (
                <Pagination.Item key={p}>
                  <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
                    {p}
                  </Pagination.Link>
                </Pagination.Item>
              ))}
              <Pagination.Item>
                <Pagination.Next
                  isDisabled={page === totalPages}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </Table.Footer>
      </Table>
    </>
  );
}
