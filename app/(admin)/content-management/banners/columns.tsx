import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import type { BannerPosition, BannerTarget, BannerType } from "./api";

export interface BannerRow {
  id: string;
  title: string;
  bannerType: BannerType;
  target: BannerTarget;
  position: BannerPosition;
  link: string;
  image: string;
}

export type BannerActionCallbacks = {
  onEdit: (banner: BannerRow) => void;
  onDelete: (bannerId: string) => void;
  deletingId?: string;
};

function titleCase(value: string) {
  if (value === "popup") return "Pop Up";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const columns: ColumnDef<BannerRow>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const image = row.getValue("image") as string;

      return image ? (
        <img
          src={image}
          alt={row.original.title}
          className="h-16 max-w-36 rounded-md border border-gray-200 object-cover dark:border-gray-700"
        />
      ) : (
        <span className="text-xs text-gray-500 dark:text-gray-400">No image</span>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "bannerType",
    header: "Type",
    cell: ({ row }) => titleCase(row.getValue("bannerType") as string),
  },
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => titleCase(row.getValue("position") as string),
  },
  {
    accessorKey: "target",
    header: "Target",
    cell: ({ row }) => {
      const target = row.getValue("target") as BannerTarget;

      return (
        <Badge variant="light" color={target === "mobile" ? "warning" : "info"} size="sm">
          {titleCase(target)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "link",
    header: "Link",
    cell: ({ row }) => {
      const link = row.getValue("link") as string;

      return link ? <span className="whitespace-normal break-all text-sm">{link}</span> : "-";
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
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
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
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
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
