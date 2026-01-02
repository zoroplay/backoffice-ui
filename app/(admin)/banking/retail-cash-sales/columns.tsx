"use client";

import { ColumnDef } from "@tanstack/react-table";

import type { NetworkSalesReport } from "./data";

const formatCurrency = (amount: number) =>
  `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

export const columns: ColumnDef<NetworkSalesReport>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "onlineSales",
    header: "Online sales",
    cell: ({ row }) => (
      <span className="text-gray-800 dark:text-gray-200">
        {formatCurrency(row.original.onlineSales)}
      </span>
    ),
  },
  {
    accessorKey: "totalOnlineSales",
    header: "Total Online sales",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-800 dark:text-gray-100">
        {formatCurrency(row.original.totalOnlineSales)}
      </span>
    ),
  },
  {
    accessorKey: "onlineWithdrawal",
    header: "Online Withdrawal",
    cell: ({ row }) => (
      <span className="text-gray-800 dark:text-gray-200">
        {formatCurrency(row.original.onlineWithdrawal)}
      </span>
    ),
  },
  {
    accessorKey: "totalOnlineWithdrawals",
    header: "Total Online Withdrawals",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-800 dark:text-gray-100">
        {formatCurrency(row.original.totalOnlineWithdrawals)}
      </span>
    ),
  },
  {
    accessorKey: "onlineBalance",
    header: "Online Balance",
    cell: ({ row }) => (
      <span className="font-semibold text-green-600 dark:text-green-400">
        {formatCurrency(row.original.onlineBalance)}
      </span>
    ),
  },
  {
    accessorKey: "availableBalance",
    header: "Available Balance",
    cell: ({ row }) => (
      <span className="font-semibold text-blue-600 dark:text-blue-400">
        {formatCurrency(row.original.availableBalance)}
      </span>
    ),
  },
];

