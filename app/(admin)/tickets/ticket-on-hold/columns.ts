import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export type TicketOnHold = {
  betslipId: string;
  username: string;
  betType: string;
  selection: number;
  odds: number;
  stake: number;
  potentialReturn: number;
  clientType: string;
  dateTime: Date;
};

export const columns: ColumnDef<TicketOnHold>[] = [
  {
    accessorKey: "betslipId",
    header: "Betslip ID",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "betType",
    header: "Bet Type",
  },
  {
    accessorKey: "selection",
    header: "Selection",
  },
  {
    accessorKey: "odds",
    header: "Odds",
    cell: ({ row }) => {
      const odds = parseFloat(row.getValue("odds"));
      return odds.toFixed(2);
    },
  },
  {
    accessorKey: "stake",
    header: "Stake (₦)",
    cell: ({ row }) => {
      const stake = parseFloat(row.getValue("stake"));
      return `₦${stake.toLocaleString()}`;
    },
  },
  {
    accessorKey: "potentialReturn",
    header: "Return",
    cell: ({ row }) => {
      const returns = parseFloat(row.getValue("potentialReturn"));
      return `₦${returns.toLocaleString()}`;
    },
  },
  {
    accessorKey: "clientType",
    header: "Client Type",
  },
  {
    accessorKey: "dateTime",
    header: "Date/Time",
    cell: ({ row }) => {
      const date = row.getValue("dateTime") as Date;
      return format(date, "MMM dd, yyyy HH:mm");
    },
  },
];