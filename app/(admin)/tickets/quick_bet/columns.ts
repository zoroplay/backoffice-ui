import { ColumnDef } from "@tanstack/react-table";

export type QuickBet = {
  betslipId: string;
  betType: string;
  placedOn: string; // ISO date
  by: string;
  sportsLimit: string;
  sport: string;
  league: string;
  event: string;
  market: string;
  selection: string;
  odds: number;
  stake: number;
  ret: number; // return
  winLoss: number;
  clientType: string;
  betStatus: string;
  betSettledAt?: string | null;
};

export const columns: ColumnDef<QuickBet>[] = [
  { accessorKey: "betslipId", header: "Betslip ID" },
  { accessorKey: "betType", header: "Bet Type" },
  { accessorKey: "placedOn", header: "Placed on" },
  { accessorKey: "by", header: "By" },
  { accessorKey: "sportsLimit", header: "Sports Limit" },
  { accessorKey: "sport", header: "Sport" },
  { accessorKey: "league", header: "League" },
  { accessorKey: "event", header: "Event" },
  { accessorKey: "market", header: "Market" },
  { accessorKey: "selection", header: "Selection" },
  { accessorKey: "odds", header: "Odds" },
  { accessorKey: "stake", header: "Stake(₦)" },
  { accessorKey: "ret", header: "Return(₦)" },
  { accessorKey: "winLoss", header: "Win/Loss" },
  { accessorKey: "clientType", header: "Client Type" },
  { accessorKey: "betStatus", header: "Bet Status" },
  { accessorKey: "betSettledAt", header: "Bet Settled Date & Time" },
];
