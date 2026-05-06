'use client'

import { Eye } from "@gravity-ui/icons";
import { Button, Table } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function ({ mails }: {
  mails: Array<{
    id: number,
    sender: string,
    title: string,
    content: string,
    date: Date
  }>
}) {

  const router = useRouter()

  return (
    <Table variant="secondary">
      <Table.ScrollContainer>
        <Table.Content aria-label="Team members" className="min-w-150">
          <Table.Header>
            <Table.Column isRowHeader>Sender</Table.Column>
            <Table.Column>Title</Table.Column>
            <Table.Column>Date</Table.Column>
            <Table.Column>Actions</Table.Column>
          </Table.Header>
          <Table.Body>
            {mails.map((mail) => {
              return (
                <Table.Row key={mail.id} >
                  <Table.Cell>{mail.sender}</Table.Cell>
                  <Table.Cell>{mail.title}</Table.Cell>
                  <Table.Cell>{mail.date.toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <Button isIconOnly variant="tertiary" size="sm" onClick={() => { router.push(`/inbox/${mail.id}`) }}>
                      <Eye />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}