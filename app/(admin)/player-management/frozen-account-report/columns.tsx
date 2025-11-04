"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Badge, { BadgeColor } from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Pencil } from "lucide-react";
import AddNoteModal from "@/components/modals/AddNoteModal";
import type { FrozenAccount, ProcessStatus, PlayerStatus } from "./data";

const playerStatusColors: Record<PlayerStatus, { color: BadgeColor; label: string }> = {
  Frozen: { color: "error", label: "Frozen" },
  "Partially Frozen": { color: "warning", label: "Partially Frozen" },
  Released: { color: "success", label: "Released" },
};

const processStatusColors: Record<ProcessStatus, { color: BadgeColor; label: string }> = {
  Pending: { color: "warning", label: "Pending" },
  "In Progress": { color: "info", label: "In Progress" },
  Completed: { color: "success", label: "Completed" },
};

export const columns: ColumnDef<FrozenAccount>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900 dark:text-white">
        {row.original.username}
      </span>
    ),
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
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
    accessorKey: "playerStatus",
    header: "Player Current Status",
    cell: ({ row }) => {
      const { color, label } =
        playerStatusColors[row.original.playerStatus] || playerStatusColors.Frozen;

      return (
        <Badge color={color} variant="light" size="sm">
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "freezeDate",
    header: "Freeze Date",
    cell: ({ row }) =>
      new Date(row.original.freezeDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
  {
    accessorKey: "freezeType",
    header: "Freeze Type",
  },
  {
    accessorKey: "reason",
    header: "Reason",
  },
  {
    accessorKey: "processStatus",
    header: "Process Status",
    cell: ({ row }) => {
      const { color, label } =
        processStatusColors[row.original.processStatus] || processStatusColors.Pending;

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
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);

      const handleSave = (note: string) => {
        console.log(`Note saved for ${row.original.username}:`, note);
      };

      return (
        <>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-brand-500 border-brand-500 hover:bg-brand-50"
            onClick={() => setOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Add Note
          </Button>

          <AddNoteModal
            isOpen={open}
            onClose={() => setOpen(false)}
            onSave={handleSave}
            playerName={row.original.username}
          />
        </>
      );
    },
  },
];

