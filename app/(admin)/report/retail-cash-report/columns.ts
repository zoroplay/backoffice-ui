import { ColumnDef } from "@tanstack/react-table";
import { RetailCashRecord } from "./data";

export const columns: ColumnDef<RetailCashRecord>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const rawDate = row.original.date;
      if (!rawDate) return "-";
      const parsed = new Date(rawDate);
      return Number.isNaN(parsed.getTime())
        ? "-"
        : parsed.toLocaleDateString("en-GB");
    },
  },
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
    cell: ({ row }) => `\u20a6${row.original.depositAmount.toLocaleString()}`,
  },
  {
    accessorKey: "withdrawals",
    header: "Withdrawals",
  },
  {
    accessorKey: "withdrawalAmount",
    header: "Withdrawal Amount",
    cell: ({ row }) => `\u20a6${row.original.withdrawalAmount.toLocaleString()}`,
  },
];
