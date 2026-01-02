import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import Button from "@/components/ui/button/Button";

export type BonusCampaign = {
  id: string;
  campaignName: string;
  bonusCode: string;
  startDate: string;
  endDate: string;
  chooseBonus: string;
  affiliateIds: string;
  trackierCampaignIds: string;
};

export type CampaignActionsCallbacks = {
  onEdit: (campaign: BonusCampaign) => void;
  onDelete: (campaignId: string) => void;
};

export const columns: ColumnDef<BonusCampaign>[] = [
  {
    accessorKey: "campaignName",
    header: "Campaign Name",
  },
  {
    accessorKey: "bonusCode",
    header: "Bonus Code",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("startDate"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("endDate"));
      return date.toLocaleDateString();
    },
  },
];

export const createActionColumn = (
  callbacks: CampaignActionsCallbacks
): ColumnDef<BonusCampaign> => ({
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
            if (window.confirm("Are you sure you want to delete this campaign?")) {
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

