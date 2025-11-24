"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Edit2, Eye, Trash2, XCircle } from "lucide-react";

import Badge, { type BadgeColor } from "@/components/ui/badge/Badge";

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

const actionButtonClasses =
  "rounded-md border border-transparent p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-300";

const destructiveButtonClasses =
  "rounded-md border border-transparent p-1.5 text-red-500 transition hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-red-400 dark:hover:bg-red-900/30";

const approveButtonClasses =
  "rounded-md border border-transparent p-1.5 text-emerald-500 transition hover:bg-emerald-100 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-900/30";

// CashBooks Columns
const cashBookStatusColors: Record<CashBookStatus, { color: BadgeColor; label: string }> = {
  Open: { color: "info", label: "Open" },
  Closed: { color: "error", label: "Closed" },
  Pending: { color: "warning", label: "Pending" },
  Approved: { color: "success", label: "Approved" },
};

type CashBookActionHandlers = {
  onView: (row: CashBook) => void;
};

export const createCashbooksColumns = (
  handlers: CashBookActionHandlers
): ColumnDef<CashBook>[] => [
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
      const { color, label } =
        cashBookStatusColors[row.original.status] || cashBookStatusColors["Pending"];
      return (
        <Badge color={color} variant="light">
          {label}
        </Badge>
      );
    },
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <button
        type="button"
        className={actionButtonClasses}
        onClick={(event) => {
          event.stopPropagation();
          handlers.onView(row.original);
        }}
      >
        <Eye className="h-4 w-4" />
        <span className="sr-only">View cashbook</span>
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

type CashInActionHandlers = {
  onEdit: (row: CashIn) => void;
  onDelete: (row: CashIn) => void;
};

export const createCashinColumns = (
  handlers: CashInActionHandlers
): ColumnDef<CashIn>[] => [
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
      const { color, label } =
        cashInStatusColors[row.original.status] || cashInStatusColors["Pending"];
      return (
        <Badge color={color} variant="light">
          {label}
        </Badge>
      );
    },
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">          
        <button
          type="button"
          className={actionButtonClasses}
          onClick={(event) => {
            event.stopPropagation();
            handlers.onEdit(row.original);
          }}
        >
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit cash in</span>
        </button>
        <button
          type="button"
          className={destructiveButtonClasses}
          onClick={(event) => {
            event.stopPropagation();
            handlers.onDelete(row.original);
          }}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete cash in</span>
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

type CashOutActionHandlers = {
  onEdit: (row: CashOut) => void;
  onDelete: (row: CashOut) => void;
};

export const createCashoutColumns = (
  handlers: CashOutActionHandlers
): ColumnDef<CashOut>[] => [
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
      const { color, label } =
        cashOutStatusColors[row.original.status] || cashOutStatusColors["Pending"];
      return (
        <Badge color={color} variant="light">
          {label}
        </Badge>
      );
    },
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          className={actionButtonClasses}
          onClick={(event) => {
            event.stopPropagation();
            handlers.onEdit(row.original);
          }}
        >
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit cash out</span>
        </button>
        <button
          type="button"
          className={destructiveButtonClasses}
          onClick={(event) => {
            event.stopPropagation();
            handlers.onDelete(row.original);
          }}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete cash out</span>
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

type ExpenseActionHandlers = {
  onApprove: (row: Expense) => void;
  onReject: (row: Expense) => void;
};

export const createExpensesColumns = (
  handlers: ExpenseActionHandlers
): ColumnDef<Expense>[] => [
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
      const { color, label } =
        expenseStatusColors[row.original.status] || expenseStatusColors["Pending"];
      return (
        <Badge color={color} variant="light">
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
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          className={approveButtonClasses}
          onClick={(event) => {
            event.stopPropagation();
            handlers.onApprove(row.original);
          }}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span className="sr-only">Approve expense</span>
        </button>
        <button
          type="button"
          className={destructiveButtonClasses}
          onClick={(event) => {
            event.stopPropagation();
            handlers.onReject(row.original);
          }}
        >
          <XCircle className="h-4 w-4" />
          <span className="sr-only">Reject expense</span>
        </button>
      </div>
    ),
  },
];

// Expense Type Columns
type ExpenseTypeActionHandlers = {
  onEdit: (row: ExpenseType) => void;
  onDelete: (row: ExpenseType) => void;
};

export const createExpenseTypeColumns = (
  handlers: ExpenseTypeActionHandlers
): ColumnDef<ExpenseType>[] => [
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
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          className={actionButtonClasses}
          onClick={(event) => {
            event.stopPropagation();
            handlers.onEdit(row.original);
          }}
        >
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit expense type</span>
        </button>
        <button
          type="button"
          className={destructiveButtonClasses}
          onClick={(event) => {
            event.stopPropagation();
            handlers.onDelete(row.original);
          }}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete expense type</span>
        </button>
      </div>
    ),
  },
];

// Expense Category Columns
type ExpenseCategoryActionHandlers = {
  onEdit: (row: ExpenseCategory) => void;
  onDelete: (row: ExpenseCategory) => void;
};

export const createExpenseCategoryColumns = (
  handlers: ExpenseCategoryActionHandlers
): ColumnDef<ExpenseCategory>[] => [
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
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          className={actionButtonClasses}
          onClick={(event) => {
            event.stopPropagation();
            handlers.onEdit(row.original);
          }}
        >
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit expense category</span>
        </button>
        <button
          type="button"
          className={destructiveButtonClasses}
          onClick={(event) => {
            event.stopPropagation();
            handlers.onDelete(row.original);
          }}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete expense category</span>
        </button>
      </div>
    ),
  },
];


