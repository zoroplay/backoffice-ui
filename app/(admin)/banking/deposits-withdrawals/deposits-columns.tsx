"use client";

import { ColumnDef } from "@tanstack/react-table";

import Badge, { BadgeColor } from "@/components/ui/badge/Badge";

import type { Deposit, DepositStatus, ReviewStatus } from "./deposits-data";

const statusColors: Record<DepositStatus, { color: BadgeColor; label: string }> = {
  Pending: { color: "warning", label: "Pending" },
  Approved: { color: "info", label: "Approved" },
  Declined: { color: "error", label: "Declined" },
  Processing: { color: "warning", label: "Processing" },
  Completed: { color: "success", label: "Completed" },
};

const reviewStatusColors: Record<ReviewStatus, { color: BadgeColor; label: string }> = {
  "Under Review": { color: "warning", label: "Under Review" },
  Reviewed: { color: "success", label: "Reviewed" },
  Flagged: { color: "error", label: "Flagged" },
  Clear: { color: "success", label: "Clear" },
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

export const depositColumns: ColumnDef<Deposit>[] = [
  {
    accessorKey: "createdDate",
    header: "Created Date",
    cell: ({ row }) => (
      <span className="text-sm">{formatDateTime(row.original.createdDate)}</span>
    ),
  },
  {
    accessorKey: "lastUpdatedDate",
    header: "Last Updated Date",
    cell: ({ row }) => (
      <span className="text-sm">{formatDateTime(row.original.lastUpdatedDate)}</span>
    ),
  },
  {
    accessorKey: "transactionId",
    header: "TransactionID",
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
        {row.original.transactionId}
      </span>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
  },
  {
    accessorKey: "bank",
    header: "Bank",
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
    accessorKey: "fullName",
    header: "Full Name",
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
    accessorKey: "transactionNote",
    header: "Transaction Note",
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
  {
    accessorKey: "clientType",
    header: "Client Type",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.clientType}</span>
    ),
  },
  {
    accessorKey: "handledBy",
    header: "Handled by",
  },
  {
    accessorKey: "action",
    header: "Action",
  },
  {
    accessorKey: "approve",
    header: "Approve",
    cell: ({ row }) => (
      <span className={row.original.approve ? "text-green-600" : "text-gray-400"}>
        {row.original.approve ? "Yes" : "No"}
      </span>
    ),
  },
  {
    accessorKey: "declineReason",
    header: "Decline Reason",
    cell: ({ row }) => (
      <span className="text-sm text-red-600 dark:text-red-400">
        {row.original.declineReason || "-"}
      </span>
    ),
  },
  {
    accessorKey: "reviewStatus",
    header: "Review Status",
    cell: ({ row }) => {
      const { color, label } =
        reviewStatusColors[row.original.reviewStatus] ||
        reviewStatusColors["Under Review"];
      return (
        <Badge color={color} variant="light" size="sm">
          {label}
        </Badge>
      );
    },
  },
];

