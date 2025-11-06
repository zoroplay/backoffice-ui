import { ColumnDef } from "@tanstack/react-table";

export type PlayerBonusReport = {
  id: string;
  username: string;
  playerId: string;
  bonusType: string;
  totalWon: number;
  date: string;
  amountAwarded: number;
  wageringRequirement: number;
  wageringRequirementRemaining: number;
  wageringRequirementAchieved: number;
  transactionType: string;
  referralSource: string;
  playerAgentType: string;
};

export const columns: ColumnDef<PlayerBonusReport>[] = [
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "playerId",
    header: "Player ID",
  },
  {
    accessorKey: "bonusType",
    header: "Bonus Type",
  },
  {
    accessorKey: "totalWon",
    header: "Total Won",
    cell: ({ row }) => {
      const amount = row.getValue("totalWon") as number;
      return `₦${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "amountAwarded",
    header: "Amount Awarded",
    cell: ({ row }) => {
      const amount = row.getValue("amountAwarded") as number;
      return `₦${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "wageringRequirement",
    header: "Wagering Requirement",
    cell: ({ row }) => {
      const amount = row.getValue("wageringRequirement") as number;
      return `₦${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "wageringRequirementRemaining",
    header: "Wagering Requirement Remaining",
    cell: ({ row }) => {
      const amount = row.getValue("wageringRequirementRemaining") as number;
      return `₦${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "wageringRequirementAchieved",
    header: "Wagering Requirement Achieved",
    cell: ({ row }) => {
      const amount = row.getValue("wageringRequirementAchieved") as number;
      return `₦${amount.toLocaleString()}`;
    },
  },
];

