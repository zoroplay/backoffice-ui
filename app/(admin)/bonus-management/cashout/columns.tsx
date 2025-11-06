import { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import Button from "@/components/ui/button/Button";

export type CashoutReduction = {
  id: string;
  minOdds: number;
  reductionPercent: number;
  type: "Web" | "Shop";
};

export type CashoutReductionActionsCallbacks = {
  onDelete: (id: string) => void;
};

export const columns: ColumnDef<CashoutReduction>[] = [
  {
    accessorKey: "minOdds",
    header: "Min Odds",
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue("minOdds")}</span>;
    },
  },
  {
    accessorKey: "reductionPercent",
    header: "Reduction Percent",
    cell: ({ row }) => {
      const percentage = row.getValue("reductionPercent") as number;
      return <span className="font-medium">{percentage} %</span>;
    },
  },
];

export const createActionColumn = (
  callbacks: CashoutReductionActionsCallbacks
): ColumnDef<CashoutReduction> => ({
  id: "actions",
  header: "Action",
  cell: ({ row }) => {
    return (
      <div className="flex items-center justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this reduction tier?")) {
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

