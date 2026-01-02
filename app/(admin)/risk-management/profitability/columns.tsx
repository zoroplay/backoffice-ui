import { ColumnDef } from "@tanstack/react-table";

export interface ProfitabilityRow {
  id: string;
  sport: string;
  tournament: string;
  event: string;
  date: string;
  market: string;
  selection: string;
  price: number;
  betCount: number;
  stake: number;
  potentialWinnings: number;
  settled: number;
  payout: number;
  profit: number;
  margin: number;
}

const currencyCell = (value: number) => `₦${value.toLocaleString()}`;

export const columns: ColumnDef<ProfitabilityRow>[] = [
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
    accessorKey: "stake",
    header: "Stake",
    cell: ({ row }) => currencyCell(row.getValue("stake") as number),
  },
  {
    accessorKey: "settled",
    header: "Settled Stake",
    cell: ({ row }) => currencyCell(row.getValue("settled") as number),
  },
  {
    accessorKey: "payout",
    header: "Payout",
    cell: ({ row }) => currencyCell(row.getValue("payout") as number),
  },
  {
    accessorKey: "potentialWinnings",
    header: "Potential Winnings",
    cell: ({ row }) => currencyCell(row.getValue("potentialWinnings") as number),
  },
  {
    accessorKey: "profit",
    header: "Net Profit",
    cell: ({ row }) => currencyCell(row.getValue("profit") as number),
  },
  {
    accessorKey: "margin",
    header: "Margin %",
    cell: ({ row }) => {
      const margin = row.getValue("margin") as number;
      return `${margin.toFixed(2)}%`;
    },
  },
];

