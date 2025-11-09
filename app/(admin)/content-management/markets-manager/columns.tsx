import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

import Button from "@/components/ui/button/Button";

import { MarketDefinition, MarketGroup, TournamentMarket } from "./data";

export type MarketGroupRow = Pick<
  MarketGroup,
  "id" | "name" | "marketCount" | "lastUpdated" | "description" | "sport"
>;

export type MarketRow = Pick<
  MarketDefinition,
  | "id"
  | "name"
  | "shortName"
  | "description"
  | "status"
  | "cashout"
  | "priority"
  | "isPopular"
  | "marketType"
  | "lastUpdated"
>;

export type TournamentMarketRow = Pick<TournamentMarket, "id" | "name" | "status"> & {
  action?: string;
};

export const marketGroupColumns: ColumnDef<MarketGroupRow>[] = [
  {
    accessorKey: "sport",
    header: "Sport",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {row.original.sport}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Group Name",
  },
  {
    accessorKey: "marketCount",
    header: "Markets",
  },
  {
    accessorKey: "description",
    header: "Summary",
    cell: ({ row }) => (
      <span className="text-sm text-gray-500 dark:text-gray-400">{row.getValue("description")}</span>
    ),
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastUpdated") as string);
      return (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      );
    },
  },
];

export type MarketGroupActionCallbacks = {
  onEdit: (group: MarketGroupRow) => void;
  onDelete: (groupId: string) => void;
};

export const createMarketGroupActionColumn = (
  callbacks: MarketGroupActionCallbacks
): ColumnDef<MarketGroupRow> => ({
  id: "actions",
  header: "Actions",
  enableSorting: false,
  cell: ({ row }) => (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          callbacks.onEdit(row.original);
        }}
        className="px-3 py-2"
      >
        <Edit size={16} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          callbacks.onDelete(row.original.id);
        }}
        className="px-3 py-2"
      >
        <Trash2 size={16} className="text-red-500" />
      </Button>
    </div>
  ),
});

export const marketColumns: ColumnDef<MarketRow>[] = [
  {
    accessorKey: "name",
    header: "Market Name",
  },
  {
    accessorKey: "marketType",
    header: "Type",
  },
  {
    accessorKey: "shortName",
    header: "Short Name",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-sm text-gray-500 dark:text-gray-400">{row.getValue("description")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as MarketRow["status"];
      const isEnabled = status === "Enabled";
      return (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            isEnabled
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "cashout",
    header: "Cashout",
  },
  {
    accessorKey: "priority",
    header: "Priority",
  },
  {
    accessorKey: "isPopular",
    header: "Popular",
    cell: ({ row }) => {
      const value = row.getValue("isPopular") as boolean;
      return (
        <span className="text-sm text-gray-700 dark:text-gray-300">{value ? "Yes" : "No"}</span>
      );
    },
  },
  {
    accessorKey: "lastUpdated",
    header: "Updated",
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastUpdated") as string);
      return (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      );
    },
  },
];

export const tournamentMarketColumns: ColumnDef<TournamentMarketRow>[] = [
  {
    accessorKey: "name",
    header: "Market Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as TournamentMarketRow["status"];
      const isActive = status === "Active";
      return (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <span className="text-sm text-gray-500 dark:text-gray-400">{row.getValue("action") ?? "—"}</span>
    ),
  },
];

export type TournamentMarketActionCallbacks = {
  onEdit: (row: TournamentMarketRow) => void;
  onDelete: (marketId: string) => void;
};

export const createTournamentMarketActionColumn = (
  callbacks: TournamentMarketActionCallbacks
): ColumnDef<TournamentMarketRow> => ({
  id: "actions",
  header: "Manage",
  enableSorting: false,
  cell: ({ row }) => (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          callbacks.onEdit(row.original);
        }}
        className="px-3 py-2"
      >
        <Edit size={16} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          callbacks.onDelete(row.original.id);
        }}
        className="px-3 py-2"
      >
        <Trash2 size={16} className="text-red-500" />
      </Button>
    </div>
  ),
});

