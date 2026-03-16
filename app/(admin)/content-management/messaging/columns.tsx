"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import Button from "@/components/ui/button/Button";

export interface Message {
  id: string;
  title: string;
  content: string;
  image?: string;
  status?: string;
  createdAt?: string;
}

export interface MessageRow extends Message {}

interface ActionColumnProps {
  onEdit: (row: MessageRow) => void;
  onDelete: (id: string) => void;
}

export const columns: ColumnDef<MessageRow>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => <span className="font-semibold text-gray-900 dark:text-gray-100">{row.original.title}</span>,
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="flex items-center justify-center h-10 w-10 mx-auto overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
        {row.original.image ? (
          <img src={row.original.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400 italic">None</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "content",
    header: "Content",
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-500 truncate max-w-[300px] mx-auto block">
        {getValue<string>()}
      </span>
    ),
  },
];

export const createActionColumn = ({ onEdit, onDelete }: ActionColumnProps): ColumnDef<MessageRow> => ({
  id: "action",
  header: "Action",
  cell: ({ row }) => (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(row.original)}
        className="p-2 h-auto"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(row.original.id)}
        className="p-2 h-auto text-error-600 hover:bg-error-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  ),
});
