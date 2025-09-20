// columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TaxSummary, TaxDetail } from "./data";

// ----------------------
// Summary Columns
// ----------------------
export const summaryColumns: ColumnDef<TaxSummary>[] = [
  { accessorKey: "period", header: "Period" },
  { accessorKey: "beforeTax", header: "Return Before Tax" },
  { accessorKey: "afterTax", header: "Return After Tax" },
  { accessorKey: "taxOnStake", header: "Tax On Stake" },
  { accessorKey: "taxOnWinnings", header: "Tax On Winnings" },
];

// ----------------------
// Detailed Columns
// ----------------------
export const detailColumns: ColumnDef<TaxDetail>[] = [
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "betslipId", header: "Betslip ID" },
  { accessorKey: "punterAmt", header: "Punter Amt" },
  { accessorKey: "stakeAmt", header: "Stake Amt" },
  { accessorKey: "exciseAmt", header: "Excise Amt" },
  { accessorKey: "odds", header: "Odds" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "potentialWinnings", header: "Pot. Winnings" },
  { accessorKey: "wthTax", header: "WTH Tax" },
];
