"use client";

import { Eye } from "@gravity-ui/icons";
import { Button, Table } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function SentMailTable({
  mails,
}: {
  mails: Array<{
    id: number;
    title: string;
    receivers: string[];
    date: Date;
  }>;
}) {
  const router = useRouter();

  return (
    <Table variant="secondary">
      <Table.ScrollContainer>
        <Table.Content aria-label="Sent mails" className="min-w-150">
          <Table.Header>
            <Table.Column isRowHeader>Title</Table.Column>
            <Table.Column>Receivers</Table.Column>
            <Table.Column>Date</Table.Column>
            <Table.Column>Actions</Table.Column>
          </Table.Header>
          <Table.Body>
            {mails.length === 0 ? (
              <Table.Row>
                <Table.Cell>{""}</Table.Cell>
                <Table.Cell>{""}</Table.Cell>
                <Table.Cell>No sent mails.</Table.Cell>
                <Table.Cell>{""}</Table.Cell>
              </Table.Row>
            ) : (
              mails.map((mail) => (
                <Table.Row key={mail.id}>
                  <Table.Cell>{mail.title}</Table.Cell>
                  <Table.Cell>{mail.receivers.join(", ")}</Table.Cell>
                  <Table.Cell>{new Date(mail.date).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <Button
                      isIconOnly
                      variant="tertiary"
                      size="sm"
                      onPress={() => router.push(`/inbox/${mail.id}`)}
                    >
                      <Eye />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
