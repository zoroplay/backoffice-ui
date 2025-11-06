"use client";

import { ColumnDef } from "@tanstack/react-table";
import Badge, { BadgeColor } from "@/components/ui/badge/Badge";
import type {
  CashBook,
  CashBookStatus,
  CashIn,
  CashInStatus,
  CashOut,
  CashOutStatus,
  Expense,
  ExpenseStatus,
  ExpenseType,
  ExpenseCategory,
} from "./data";

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

// CashBooks Columns
const cashBookStatusColors: Record<CashBookStatus, { color: BadgeColor; label: string }> = {
  Open: { color: "info", label: "Open" },
  Closed: { color: "error", label: "Closed" },
  Pending: { color: "warning", label: "Pending" },
  Approved: { color: "success", label: "Approved" },
};

export const cashbooksColumns: ColumnDef<CashBook>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm text-gray-900 dark:text-gray-100">{row.original.date}</span>
    ),
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">{row.original.branch}</span>
    ),
  },
  {
    accessorKey: "normalSales",
    header: "Normal Sales",
    cell: ({ row }) => (
      <span className="text-gray-800 dark:text-gray-200">
        {formatCurrency(row.original.normalSales)}
      </span>
    ),
  },
  {
    accessorKey: "normalPayout",
    header: "Normal Payout",
    cell: ({ row }) => (
      <span className="text-gray-800 dark:text-gray-200">
        {formatCurrency(row.original.normalPayout)}
      </span>
    ),
  },
  {
    accessorKey: "virtualSales",
    header: "Virtual Sales",
    cell: ({ row }) => (
      <span className="text-gray-800 dark:text-gray-200">
        {formatCurrency(row.original.virtualSales)}
      </span>
    ),
  },
  {
    accessorKey: "virtualPayout",
    header: "Virtual Payout",
    cell: ({ row }) => (
      <span className="text-gray-800 dark:text-gray-200">
        {formatCurrency(row.original.virtualPayout)}
      </span>
    ),
  },
  {
    accessorKey: "closingBalance",
    header: "Closing Balance",
    cell: ({ row }) => (
      <span className="font-semibold text-green-600 dark:text-green-400">
        {formatCurrency(row.original.closingBalance)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { color, label } = cashBookStatusColors[row.original.status] || cashBookStatusColors["Pending"];
      return (
        <Badge color={color} variant="light" size="sm">
          {label}
        </Badge>
      );
    },
  },
  {
    id: "action",
    header: "Action",
    cell: () => (
      <button className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
        View
      </button>
    ),
  },
];

// Cash In Columns
const cashInStatusColors: Record<CashInStatus, { color: BadgeColor; label: string }> = {
  Pending: { color: "warning", label: "Pending" },
  Approved: { color: "success", label: "Approved" },
  Rejected: { color: "error", label: "Rejected" },
};

export const cashinColumns: ColumnDef<CashIn>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm text-gray-900 dark:text-gray-100">
        {formatDateTime(row.original.date)}
      </span>
    ),
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">{row.original.branch}</span>
    ),
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
    accessorKey: "comment",
    header: "Comment",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{row.original.comment}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { color, label } = cashInStatusColors[row.original.status] || cashInStatusColors["Pending"];
      return (
        <Badge color={color} variant="light" size="sm">
          {label}
        </Badge>
      );
    },
  },
  {
    id: "action",
    header: "Action",
    cell: () => (
      <div className="flex gap-2">
        <button className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
          Edit
        </button>
        <button className="text-sm text-red-500 hover:text-red-600 dark:text-red-400">
          Delete
        </button>
      </div>
    ),
  },
];

// Cash Out Columns
const cashOutStatusColors: Record<CashOutStatus, { color: BadgeColor; label: string }> = {
  Pending: { color: "warning", label: "Pending" },
  Approved: { color: "success", label: "Approved" },
  Rejected: { color: "error", label: "Rejected" },
};

export const cashoutColumns: ColumnDef<CashOut>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm text-gray-900 dark:text-gray-100">
        {formatDateTime(row.original.date)}
      </span>
    ),
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">{row.original.branch}</span>
    ),
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
    accessorKey: "comment",
    header: "Comment",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{row.original.comment}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { color, label } = cashOutStatusColors[row.original.status] || cashOutStatusColors["Pending"];
      return (
        <Badge color={color} variant="light" size="sm">
          {label}
        </Badge>
      );
    },
  },
  {
    id: "action",
    header: "Action",
    cell: () => (
      <div className="flex gap-2">
        <button className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
          Edit
        </button>
        <button className="text-sm text-red-500 hover:text-red-600 dark:text-red-400">
          Delete
        </button>
      </div>
    ),
  },
];

// Expenses Columns
const expenseStatusColors: Record<ExpenseStatus, { color: BadgeColor; label: string }> = {
  Pending: { color: "warning", label: "Pending" },
  Approved: { color: "success", label: "Approved" },
  Rejected: { color: "error", label: "Rejected" },
};

export const expensesColumns: ColumnDef<Expense>[] = [
  {
    accessorKey: "expense",
    header: "Expense",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">{row.original.expense}</span>
    ),
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{row.original.branch}</span>
    ),
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{row.original.user}</span>
    ),
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { color, label } = expenseStatusColors[row.original.status] || expenseStatusColors["Pending"];
      return (
        <Badge color={color} variant="light" size="sm">
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "approvedBy",
    header: "Approved By",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {row.original.approvedBy || "-"}
      </span>
    ),
  },
  {
    accessorKey: "approvedAt",
    header: "Approved At",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {row.original.approvedAt ? formatDateTime(row.original.approvedAt) : "-"}
      </span>
    ),
  },
  {
    id: "action",
    header: "Action",
    cell: () => (
      <div className="flex gap-2">
        <button className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
          Approve
        </button>
        <button className="text-sm text-red-500 hover:text-red-600 dark:text-red-400">
          Reject
        </button>
      </div>
    ),
  },
];

// Expense Type Columns
export const expenseTypeColumns: ColumnDef<ExpenseType>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">{row.original.title}</span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{row.original.category}</span>
    ),
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
    id: "action",
    header: "Action",
    cell: () => (
      <div className="flex gap-2">
        <button className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
          Edit
        </button>
        <button className="text-sm text-red-500 hover:text-red-600 dark:text-red-400">
          Delete
        </button>
      </div>
    ),
  },
];

// Expense Category Columns
export const expenseCategoryColumns: ColumnDef<ExpenseCategory>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">{row.original.title}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{row.original.description}</span>
    ),
  },
  {
    id: "action",
    header: "Action",
    cell: () => (
      <div className="flex gap-2">
        <button className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
          Edit
        </button>
        <button className="text-sm text-red-500 hover:text-red-600 dark:text-red-400">
          Delete
        </button>
      </div>
    ),
  },
];


