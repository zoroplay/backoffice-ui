"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Pencil } from "lucide-react";
import AddNoteModal from "@/components/modals/AddNoteModal";
import type { Registration } from "./data";

// Status color map aligned with Badge.tsx types
const statusColors: Record<
  string,
  { color: "success" | "error" | "light" | "warning"; label: string }
> = {
  Active: { color: "success", label: "Active" },
  Suspended: { color: "error", label: "Suspended" },
  Inactive: { color: "light", label: "Inactive" },
};

const NoteCell: React.FC<{ player: Registration }> = ({ player }) => {
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

export const columns: ColumnDef<Registration>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <span className="font-medium text-gray-800 dark:text-gray-100">
        {row.original.username}
      </span>
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
    accessorKey: "registered",
    header: "Registered",
    cell: ({ row }) =>
      new Date(row.original.registered).toLocaleDateString("en-GB"),
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login Date",
    cell: ({ row }) =>
      new Date(row.original.lastLogin).toLocaleDateString("en-GB"),
  },
  {
    accessorKey: "balance",
    header: "Balance (₦)",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-800 dark:text-gray-100">
        ₦{row.original.balance.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "Inactive";
      const { color, label } = statusColors[status] || statusColors["Inactive"];

      return (
        <Badge variant="light" color={color} size="sm">
          {label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Add Note",
    cell: ({ row }) => <NoteCell player={row.original} />,
  },
];
