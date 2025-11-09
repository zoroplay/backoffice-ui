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

const badge = (label: string, variant: "success" | "warning" | "neutral") => {
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";
  if (variant === "success") {
    return `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300`;
  }
  if (variant === "warning") {
    return `${base} bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200`;
  }
  return `${base} bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-200`;
};

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
      return <span className={badge(isActive ? "Active" : "Inactive", isActive ? "success" : "neutral")}>{isActive ? "Active" : "Inactive"}</span>;
    },
  },
  {
    accessorKey: "openInNewTab",
    header: "Open in New Tab",
    cell: ({ row }) => {
      const open = row.getValue("openInNewTab") as boolean;
      return <span className={badge(open ? "Yes" : "No", open ? "warning" : "neutral")}>{open ? "Yes" : "No"}</span>;
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

