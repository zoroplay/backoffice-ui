import { ColumnDef } from "@tanstack/react-table";

export interface PoolsTicketRow {
  id: string;
  ticketRef: string;
  player: string;
  channel: string;
  division: string;
  stake: number;
  potentialWinning: number;
  datePlaced: string;
  status: string;
  selections: number;
  agent?: string;
}

const currencyCell = (value: number) => `₦${value.toLocaleString()}`;

export const columns: ColumnDef<PoolsTicketRow>[] = [
  {
    accessorKey: "ticketRef",
    header: "Ticket Ref",
  },
  {
    accessorKey: "player",
    header: "Player",
  },
  {
    accessorKey: "channel",
    header: "Channel",
  },
  {
    accessorKey: "division",
    header: "Division",
  },
  {
    accessorKey: "selections",
    header: "Selections",
  },
  {
    accessorKey: "stake",
    header: "Stake",
    cell: ({ row }) => currencyCell(row.getValue("stake") as number),
  },
  {
    accessorKey: "potentialWinning",
    header: "Potential Winning",
    cell: ({ row }) => currencyCell(row.getValue("potentialWinning") as number),
  },
  {
    accessorKey: "datePlaced",
    header: "Date Placed",
    cell: ({ row }) => {
      const date = new Date(row.getValue("datePlaced") as string);
      return date.toLocaleString();
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const baseClass =
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";
      if (status === "Won") {
        return <span className={`${baseClass} bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300`}>Won</span>;
      }
      if (status === "Lost") {
        return <span className={`${baseClass} bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300`}>Lost</span>;
      }
      return <span className={`${baseClass} bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300`}>Pending</span>;
    },
  },
  {
    accessorKey: "agent",
    header: "Agent",
    cell: ({ row }) => row.getValue("agent") || "Self",
  },
];

