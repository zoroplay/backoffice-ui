"use client";

import { ColumnDef } from "@tanstack/react-table";

import Badge, { BadgeColor } from "@/components/ui/badge/Badge";

import type { Withdrawal, WithdrawalStatus } from "./withdrawals-data";

const statusColors: Record<WithdrawalStatus, { color: BadgeColor; label: string }> = {
  Pending: { color: "warning", label: "Pending" },
  Approved: { color: "info", label: "Approved" },
  Declined: { color: "error", label: "Declined" },
  Processing: { color: "warning", label: "Processing" },
  Completed: { color: "success", label: "Completed" },
};

const formatCurrency = (amount: number) =>
  `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

export const withdrawalColumns: ColumnDef<Withdrawal>[] = [
  {
    accessorKey: "dateRequested",
    header: "Date Requested",
    cell: ({ row }) => (
      <span className="text-sm">{formatDateTime(row.original.dateRequested)}</span>
    ),
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {row.original.username}
      </span>
    ),
  },
  {
    accessorKey: "nameOnFile",
    header: "Name on file",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-800 dark:text-gray-100">
        {formatCurrency(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "accountNumber",
    header: "Acct. No.",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.accountNumber}</span>
    ),
  },
  {
    accessorKey: "accountName",
    header: "Acct. Name",
  },
  {
    accessorKey: "bank",
    header: "Bank",
  },
  {
    accessorKey: "updatedBy",
    header: "Updated By",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { color, label } =
        statusColors[row.original.status] || statusColors["Pending"];
      return (
        <Badge color={color} variant="light" size="sm">
          {label}
        </Badge>
      );
    },
  },
];

