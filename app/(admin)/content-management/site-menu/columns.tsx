import { ColumnDef } from "@tanstack/react-table";

export interface SiteMenuRow {
  id: string;
  title: string;
  placement: string;
  parent?: string;
  url: string;
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
  lastUpdated: string;
}

import Badge from "@/components/ui/badge/Badge";

export const columns: ColumnDef<SiteMenuRow>[] = [
  {
    accessorKey: "title",
    header: "Menu Item",
  },
  {
    accessorKey: "placement",
    header: "Placement",
  },
  {
    accessorKey: "parent",
    header: "Parent Menu",
    cell: ({ row }) => row.getValue("parent") || "—",
  },
  {
    accessorKey: "url",
    header: "Link",
  },
  {
    accessorKey: "order",
    header: "Order",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return <Badge variant="light" color={isActive ? "success" : "neutral"}>{isActive ? "Active" : "Inactive"}</Badge>;
    },
  },
  {
    accessorKey: "openInNewTab",
    header: "Open in New Tab",
    cell: ({ row }) => {
      const open = row.getValue("openInNewTab") as boolean;
      return <Badge variant="light" color={open ? "success" : "error"}>{open ? "Yes" : "No"}</Badge>;
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

