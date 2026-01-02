import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import Button from "@/components/ui/button/Button";

export type PlayerBonus = {
  id: string;
  name: string;
  value: string;
  product: string;
  bonusType: string;
  minStake: number;
  minNoEvents: number;
  minOddsPerEvent: number;
  minTotalOdds: number;
  betType: string;
  maxWinnings: number;
  status: "Active" | "Inactive" | "Expired";
};

export type BonusActionsCallbacks = {
  onEdit: (bonus: PlayerBonus) => void;
  onDelete: (bonusId: string) => void;
};

export const columns: ColumnDef<PlayerBonus>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "value",
    header: "Value",
  },
  {
    accessorKey: "product",
    header: "Product",
  },
  {
    accessorKey: "bonusType",
    header: "Bonus Type",
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
    accessorKey: "minNoEvents",
    header: "Min. no Events",
  },
  {
    accessorKey: "minOddsPerEvent",
    header: "Min. Odds/Event",
    cell: ({ row }) => {
      const odds = row.getValue("minOddsPerEvent") as number;
      return odds.toFixed(2);
    },
  },
  {
    accessorKey: "minTotalOdds",
    header: "Min. Total Odds",
    cell: ({ row }) => {
      const odds = row.getValue("minTotalOdds") as number;
      return odds.toFixed(2);
    },
  },
  {
    accessorKey: "betType",
    header: "Bet Type",
  },
  {
    accessorKey: "maxWinnings",
    header: "Max. Winnings",
    cell: ({ row }) => {
      const amount = row.getValue("maxWinnings") as number;
      return `₦${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColors = {
        Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        Inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
        Expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${
            statusColors[status as keyof typeof statusColors]
          }`}
        >
          {status}
        </span>
      );
    },
  },
];

export const createActionColumn = (
  callbacks: BonusActionsCallbacks
): ColumnDef<PlayerBonus> => ({
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
            if (window.confirm("Are you sure you want to delete this bonus?")) {
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

