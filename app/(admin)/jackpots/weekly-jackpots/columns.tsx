import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import Button from "@/components/ui/button/Button";

export type WeeklyJackpot = {
  id: string;
  title: string;
  amount: number;
  minStake: number;
  noOfGames: number;
  noOfTickets: number;
  ggr: number;
  agentCommission: number;
  terms: string;
  fixtures: string[];
  bonuses: { noOfLostGames: number; amount: number }[];
};

export type JackpotActionsCallbacks = {
  onEdit: (jackpot: WeeklyJackpot) => void;
  onDelete: (jackpotId: string) => void;
};

export const columns: ColumnDef<WeeklyJackpot>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return `₦${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "minStake",
    header: "Min. Stake",
    cell: ({ row }) => {
      const amount = row.getValue("minStake") as number;
      return `₦${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "noOfGames",
    header: "No. of Games",
  },
  {
    accessorKey: "noOfTickets",
    header: "No. of Tickets",
  },
  {
    accessorKey: "ggr",
    header: "GGR",
    cell: ({ row }) => {
      const amount = row.getValue("ggr") as number;
      return `₦${amount.toLocaleString()}`;
    },
  },
];

export const createActionColumn = (
  callbacks: JackpotActionsCallbacks
): ColumnDef<WeeklyJackpot> => ({
  id: "actions",
  header: "Action",
  cell: ({ row }) => {
    return (
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => callbacks.onEdit(row.original)}
        >
          <Edit size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this jackpot?")) {
              callbacks.onDelete(row.original.id);
            }
          }}
        >
          <Trash2 size={16} className="text-red-500" />
        </Button>
      </div>
    );
  },
});
