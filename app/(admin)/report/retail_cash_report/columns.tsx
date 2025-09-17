"use client";

import { ColumnDef } from "@tanstack/react-table";
import { RetailCashRecord } from "./data";

export const columns: ColumnDef<RetailCashRecord>[] = [
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "deposits",
    header: "Deposits",
  },
  {
    accessorKey: "depositAmount",
    header: "Deposit Amount",
    cell: ({ row }) => `₦${row.original.depositAmount.toLocaleString()}`,
  },
  {
    accessorKey: "withdrawals",
    header: "Withdrawals",
  },
  {
    accessorKey: "withdrawalAmount",
    header: "Withdrawal Amount",
    cell: ({ row }) => `₦${row.original.withdrawalAmount.toLocaleString()}`,
  },
];
