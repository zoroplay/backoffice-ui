import { ColumnDef } from "@tanstack/react-table";

export type TaxSummary = {
  period: string;
  beforeTax: number;
  afterTax: number;
  taxOnStake: number;
  taxOnWinnings: number;
};

export type TaxDetail = {
  customer: string;
  betslipId: string;
  punterAmt: number;
  stakeAmt: number;
  exciseAmt: number;
  odds: number;
  type: string;
  date: string;
  potentialWinnings: number;
  wthTax: number;
};

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
  { accessorKey: "date", header: "Date" },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "betslipId", header: "Betslip ID" },
  { accessorKey: "punterAmt", header: "Punter Amt" },
  { accessorKey: "stakeAmt", header: "Stake Amt" },
  { accessorKey: "exciseAmt", header: "Excise Amt" },
  { accessorKey: "odds", header: "Odds" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "potentialWinnings", header: "Pot. Winnings" },
  { accessorKey: "wthTax", header: "WTH Tax" },
];

