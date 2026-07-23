import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import type { ContentPageTarget } from "./api";

export interface ContentPageRow {
  id: string;
  title: string;
  target: ContentPageTarget;
  createdBy: string;
}

export type PageActionCallbacks = {
  onEdit: (page: ContentPageRow) => void;
  onDelete: (pageId: string) => void;
  deletingId?: string;
};

export const columns: ColumnDef<ContentPageRow>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "target",
    header: "Target",
    cell: ({ row }) => {
      const target = row.getValue("target") as ContentPageTarget;

      return (
        <Badge variant="light" color={target === "mobile" ? "warning" : "info"} size="sm">
          {target === "mobile" ? "Mobile" : "Web"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
    cell: ({ row }) => row.getValue("createdBy") || "-",
  },
];

export const createActionColumn = (
  callbacks: PageActionCallbacks
): ColumnDef<ContentPageRow> => ({
  id: "actions",
  header: "Actions",
  cell: ({ row }) => (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          callbacks.onEdit(row.original);
        }}
        className="px-3 py-2"
      >
        <Edit size={16} />
      </Button>
      <Button
        variant="error"
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          callbacks.onDelete(row.original.id);
        }}
        disabled={callbacks.deletingId === row.original.id}
        className="px-3 py-2"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  ),
});
