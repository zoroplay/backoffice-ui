import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

import Button from "@/components/ui/button/Button";

export interface ContentPageRow {
  id: string;
  title: string;
  target: string;
  createdBy: string;
  content: string;
  isActive: boolean;
  lastUpdated: string;
}

export type PageActionCallbacks = {
  onEdit: (page: ContentPageRow) => void;
  onDelete: (pageId: string) => void;
};

export const columns: ColumnDef<ContentPageRow>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "target",
    header: "Target",
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastUpdated") as string);
      return date.toLocaleString();
    },
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
        variant="outline"
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          callbacks.onDelete(row.original.id);
        }}
        className="px-3 py-2"
      >
        <Trash2 size={16} className="text-red-500" />
      </Button>
    </div>
  ),
});

