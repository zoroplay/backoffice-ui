"use client";

import { ColumnDef } from "@tanstack/react-table";
import { NetCashSummary, NetCashGroup } from "./data";

// ----------------------
// First table: Summary
// ----------------------
export const summaryColumns: ColumnDef<NetCashSummary>[] = [
  {
     accessorKey: "deposits", 
     header: "Deposits" 
  },
  { 
    accessorKey: "depositAmount", 
    header: "Deposit Amount", 
    cell: ({ row }) => `₦${row.original.depositAmount.toLocaleString()}` 
  },
  { 
    accessorKey: "avgDepositAmount", 
    header: "Average Deposit Amount", cell: ({ row }) => `₦${row.original.avgDepositAmount.toLocaleString()}` 
  },
  { 
    accessorKey: "withdrawals",
     header: "Withdrawals" 
  },
  { 
    accessorKey: "withdrawalAmount", 
    header: "Withdrawal Amount", 
    cell: ({ row }) => `₦${row.original.withdrawalAmount.toLocaleString()}` 
},
  { 
    accessorKey: "avgWithdrawalAmount", 
    header: "Average Withdrawal Amount", 
    cell: ({ row }) => `₦${row.original.avgWithdrawalAmount.toLocaleString()}` },
  { 
     accessorKey: "netCash",
     header: "Net Cash",
     cell: ({ row }) => `₦${row.original.netCash.toLocaleString()}` 
  },
  { 
    accessorKey: "ratio",
    header: "Net Cash to Deposit Ratio (%)",
    cell: ({ row }) => `${row.original.ratio}%` 
  },
];

// ----------------------
// Second table: Grouped
// ----------------------
export const groupColumns: ColumnDef<NetCashGroup>[] = [
  {
     accessorKey: "group", header: "Group" 
  },
  {
     accessorKey: "deposits", header: "Deposits" 
  },
  {
     accessorKey: "depositAmount",
      header: "Deposit Amount", 
      cell: ({ row }) => `₦${row.original.depositAmount.toLocaleString()}` 
  },
  {
     accessorKey: "avgDepositAmount", 
     header: "Average Deposit Amount",
     cell: ({ row }) => `₦${row.original.avgDepositAmount.toLocaleString()}` 
  },
  {
     accessorKey: "withdrawals",
      header: "Withdrawals" 
    },
  {
     accessorKey: "withdrawalAmount",
      header: "Withdrawal Amount",
      cell: ({ row }) => `₦${row.original.withdrawalAmount.toLocaleString()}` 
  },
  {
     accessorKey: "avgWithdrawalAmount",
      header: "Average Withdrawal Amount",
       cell: ({ row }) => `₦${row.original.avgWithdrawalAmount.toLocaleString()}` },
  {
     accessorKey: "netCash", 
     header: "Net Cash",
     cell: ({ row }) => `₦${row.original.netCash.toLocaleString()}` 
  },
  {   
    accessorKey: "ratio",
    header: "Net Cash to Deposit Ratio (%)", 
    cell: ({ row }) => `${row.original.ratio}%` 
  },
];
