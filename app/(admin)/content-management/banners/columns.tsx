import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";

import Button from "@/components/ui/button/Button";

export interface BannerRow {
  id: string;
  title: string;
  type: string;
  target: string;
  position: string;
  link: string;
  imageUrl: string;
  isActive: boolean;
  lastUpdated: string;
}

export type BannerActionCallbacks = {
  onEdit: (banner: BannerRow) => void;
  onDelete: (bannerId: string) => void;
};

export const columns: ColumnDef<BannerRow>[] = [
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.getValue("imageUrl") as string;
      return (
        <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <Image
            src={imageUrl}
            alt={row.original.title}
            fill
            sizes="96px"
            className="object-cover"
            unoptimized
          />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "target",
    header: "Target",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "link",
    header: "Link",
    cell: ({ row }) => (
      <a
        href={row.getValue("link") as string}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-brand-500 underline"
      >
        {row.getValue("link") as string}
      </a>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
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
  callbacks: BannerActionCallbacks
): ColumnDef<BannerRow> => ({
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
