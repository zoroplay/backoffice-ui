"use client";

import { ColumnDef } from "@tanstack/react-table";

// ✅ Define the type for each row in the table
export type PendingCashoutBet = {
  betslipId: string;
  placedBy: string;
  cashoutBy: string;
  selection: string;
  odds: number;
  stake: number;
  potentialWins: number;
  cashoutAmount: number;
  dateTime: string; // could later change to Date if you parse it
};

// ✅ Define the columns
export const columns: ColumnDef<PendingCashoutBet>[] = [
  {
    accessorKey: "betslipId",
    header: "Betslip ID",
    cell: ({ row }) => <span className="font-medium">{row.original.betslipId}</span>,
  },
  {
    accessorKey: "placedBy",
    header: "Placed By",
  },
  {
    accessorKey: "cashoutBy",
    header: "Cashout By",
  },
  {
    accessorKey: "selection",
    header: "Selection",
    cell: ({ row }) => (
      <span className="text-sm text-gray-800 dark:text-gray-200">
        {row.original.selection}
      </span>
    ),
  },
  {
    accessorKey: "odds",
    header: "Odds",
    cell: ({ row }) => <span>{row.original.odds.toFixed(2)}</span>,
  },
  {
    accessorKey: "stake",
    header: "Stake (₦)",
    cell: ({ row }) => `${row.original.stake.toLocaleString()}`,
  },
  {
    accessorKey: "potentialWins",
    header: "Pot. Wins (₦)",
    cell: ({ row }) => `${row.original.potentialWins.toLocaleString()}`,
  },
  {
    accessorKey: "cashoutAmount",
    header: "Cashout Amount",
    cell: ({ row }) => `${row.original.cashoutAmount.toLocaleString()}`,
  },
  {
    accessorKey: "dateTime",
    header: "Date / Time",
    cell: ({ row }) => {
      const date = new Date(row.original.dateTime);
      return (
        <span>
          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      );
    },
  },
];
