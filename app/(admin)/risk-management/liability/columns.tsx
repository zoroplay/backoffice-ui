import { ColumnDef } from "@tanstack/react-table";

export interface LiabilityRow {
  id: string;
  sport: string;
  tournament: string;
  event: string;
  date: string;
  market: string;
  selection: string;
  price: number;
  betCount: number;
  liability: number;
  exposure: number;
}

export const columns: ColumnDef<LiabilityRow>[] = [
  {
    accessorKey: "sport",
    header: "Sport",
  },
  {
    accessorKey: "tournament",
    header: "Tournament",
    cell: ({ row }) => (
      <span className="truncate" title={row.getValue<string>("tournament") ?? ""}>
        {row.getValue("tournament") as string}
      </span>
    ),
  },
  {
    accessorKey: "event",
    header: "Event",
    cell: ({ row }) => (
      <span className="truncate" title={row.getValue<string>("event") ?? ""}>
        {row.getValue("event") as string}
      </span>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const value = row.getValue("date") as string;
      const date = new Date(value);
      return date.toLocaleString();
    },
  },
  {
    accessorKey: "market",
    header: "Market",
  },
  {
    accessorKey: "selection",
    header: "Selection",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return price.toFixed(2);
    },
  },
  {
    accessorKey: "betCount",
    header: "Bet Count",
  },
  {
    accessorKey: "liability",
    header: "Liability",
    cell: ({ row }) => {
      const amount = row.getValue("liability") as number;
      return `₦${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "exposure",
    header: "Exposure",
    cell: ({ row }) => {
      const amount = row.getValue("exposure") as number;
      return `₦${amount.toLocaleString()}`;
    },
  },
];

