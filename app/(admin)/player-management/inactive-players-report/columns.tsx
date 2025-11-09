"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Badge, { BadgeColor } from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Pencil } from "lucide-react";
import AddNoteModal from "@/components/modals/AddNoteModal";
import type { InactivePlayer } from "./data";

const statusColors: Record<
  string,
  { color: BadgeColor; label: string }
> = {
  Pending: { color: "warning", label: "Pending" },
  Completed: { color: "success", label: "Completed" },
  Failed: { color: "error", label: "Failed" },
};

const NoteActionCell: React.FC<{ player: InactivePlayer }> = ({ player }) => {
  const [open, setOpen] = useState(false);

  const handleSave = (note: string) => {
    console.log(`Note saved for ${player.username}:`, note);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 border-brand-500 text-brand-500 hover:bg-brand-50"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-4 w-4" />
        Add Note
      </Button>

      <AddNoteModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        playerName={player.username}
      />
    </>
  );
};

export const columns: ColumnDef<InactivePlayer>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.username}</span>
    ),
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login Date",
    cell: ({ row }) => new Date(row.original.lastLogin).toLocaleDateString(),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-800 dark:text-gray-100">
        ₦{row.original.balance.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "processStatus",
    header: "Process Status",
    cell: ({ row }) => {
      const { color, label } =
        statusColors[row.original.processStatus] || statusColors["Pending"];
      return (
        <Badge color={color} variant="light" size="sm">
          {label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Add Note",
    cell: ({ row }) => <NoteActionCell player={row.original} />,
  },
];
