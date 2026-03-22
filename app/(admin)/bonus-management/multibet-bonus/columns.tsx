import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import Button from "@/components/ui/button/Button";

export type MultibetBonus = {
  id: string;
  numberOfEvents: number;
  bonusPercentage: number;
  type: "Onliners" | "Shop";
  raw?: Record<string, unknown>;
};

export type MultibetBonusActionsCallbacks = {
  onEdit: (bonus: MultibetBonus) => void;
  onDelete: (bonusId: string) => void;
};

export const columns: ColumnDef<MultibetBonus>[] = [
  {
    accessorKey: "numberOfEvents",
    header: "No. of Events",
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue("numberOfEvents")}</span>;
    },
  },
  {
    accessorKey: "bonusPercentage",
    header: "Bonus",
    cell: ({ row }) => {
      const percentage = row.getValue("bonusPercentage") as number;
      return <span className="font-medium">{percentage} %</span>;
    },
  },
];

export const createActionColumn = (
  callbacks: MultibetBonusActionsCallbacks
): ColumnDef<MultibetBonus> => ({
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
            if (window.confirm("Are you sure you want to delete this bonus tier?")) {
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

