import { ColumnDef } from "@tanstack/react-table";

export type OpenBet = {
  betslipId: string;
  betType: string;
  placedOn: string; 
  by: string;
  odds: number;
  stake: number;
  sport: string;
  league: string;
  event: string;
  market: string;
  selection: string;  
  ret: number; 
  clientType: string;
  ticketType: string;
};

export const columns: ColumnDef<OpenBet>[] = [
  { accessorKey: "betslipId", header: "Betslip ID" },
  { accessorKey: "betType", header: "Bet Type" },
  { accessorKey: "placedOn", header: "Placed on" },
  { accessorKey: "by", header: "By" },
  { accessorKey: "odds", header: "Odds" },
  { accessorKey: "stake", header: "Stake (₦)" },
  { accessorKey: "ret", header: "Potential Winnings (₦)" },
  { accessorKey: "sport", header: "Sport" },
  { accessorKey: "league", header: "League" },
  { accessorKey: "event", header: "Event" },
  { accessorKey: "market", header: "Market" },
  { accessorKey: "selection", header: "Selection" },
  { accessorKey: "clientType", header: "Client Type" },
];
// Betslip ID	Bet Type	Placed on	By	Odds	Stake	Potential Winnings	Sport	League	Event	Market	Selection	Client Type