"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

export type Commission = {
  id: string;
  agent: string;
  sport: string;
  reportDate: string;
  commissionProfile: string;
  noOfTickets: number;
  amountPlayed: number;
  totalWon: number;
  net: number;
  commissions: number;
  profit: number;
};

const formatCurrency = (amount: number) =>
  `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
};

const formatSport = (value: string) =>
  value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const columns: ColumnDef<Commission>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getFilteredRowModel().rows.length > 0 &&
          table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "agent",
    header: "Agent",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {row.original.agent}
      </span>
    ),
  },
  {
    accessorKey: "sport",
    header: "Sport",
    cell: ({ row }) => <span>{formatSport(row.original.sport)}</span>,
  },
  {
    accessorKey: "reportDate",
    header: "Date",
    cell: ({ row }) => <span>{formatDate(row.original.reportDate)}</span>,
  },
  {
    accessorKey: "commissionProfile",
    header: "Commission Profile",
  },
  {
    accessorKey: "noOfTickets",
    header: "No. of Tickets",
    cell: ({ row }) => <span className="font-medium">{row.original.noOfTickets}</span>,
  },
  {
    accessorKey: "amountPlayed",
    header: "Amount Played",
    cell: ({ row }) => (
      <span className="font-medium">{formatCurrency(row.original.amountPlayed)}</span>
    ),
  },
  {
    accessorKey: "totalWon",
    header: "Total Won",
    cell: ({ row }) => (
      <span className="font-medium">{formatCurrency(row.original.totalWon)}</span>
    ),
  },
  {
    accessorKey: "net",
    header: "Net",
    cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.net)}</span>,
  },
  {
    accessorKey: "commissions",
    header: "Commissions",
    cell: ({ row }) => (
      <span className="font-medium text-blue-600 dark:text-blue-400">
        {formatCurrency(row.original.commissions)}
      </span>
    ),
  },
  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }) => (
      <span className="font-medium text-green-600 dark:text-green-400">
        {formatCurrency(row.original.profit)}
      </span>
    ),
  },
];

