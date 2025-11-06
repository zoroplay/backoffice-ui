import { ColumnDef } from "@tanstack/react-table";

export type JackpotTicket = {
  id: string;
  betslipId: string;
  placedOn: string;
  by: string;
  status: string;
  stake: number;
  amountWon: number;
  totalGames: number;
  clientType: string;
  betSettledDateTime: string;
};

export const columns: ColumnDef<JackpotTicket>[] = [
  {
    accessorKey: "betslipId",
    header: "Betslip ID",
  },
  {
    accessorKey: "placedOn",
    header: "Placed on",
  },
  {
    accessorKey: "by",
    header: "By",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColors: Record<string, string> = {
        Won: "text-green-600 dark:text-green-400",
        Lost: "text-red-600 dark:text-red-400",
        Pending: "text-yellow-600 dark:text-yellow-400",
      };
      return (
        <span className={statusColors[status] || "text-gray-600 dark:text-gray-400"}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "stake",
    header: "Stake",
    cell: ({ row }) => {
      const amount = row.getValue("stake") as number;
      return `₦${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "amountWon",
    header: "Amount won",
    cell: ({ row }) => {
      const amount = row.getValue("amountWon") as number;
      return amount > 0 ? `₦${amount.toLocaleString()}` : "-";
    },
  },
  {
    accessorKey: "totalGames",
    header: "Total Games",
  },
  {
    accessorKey: "clientType",
    header: "Client Type",
  },
  {
    accessorKey: "betSettledDateTime",
    header: "Bet Settled Date & Time",
  },
];

