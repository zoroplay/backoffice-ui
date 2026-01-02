import { ColumnDef } from "@tanstack/react-table";

export interface CouponTicketRow {
  id: string;
  name: string;
  bets: number;
  turnover: number;
  winnings: number;
  ggr: number;
  margin: number;
  ngr: number;
  channel: string;
  status: string;
  region: string;
  date: string;
}

const currency = (value: number) => `₦${value.toLocaleString()}`;
const percentage = (value: number) => `${value.toFixed(1)}%`;

export const columns: ColumnDef<CouponTicketRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "bets",
    header: "# of Bets",
  },
  {
    accessorKey: "turnover",
    header: "Turnover",
    cell: ({ row }) => currency(row.getValue("turnover") as number),
  },
  {
    accessorKey: "winnings",
    header: "Winnings",
    cell: ({ row }) => currency(row.getValue("winnings") as number),
  },
  {
    accessorKey: "ggr",
    header: "GGR",
    cell: ({ row }) => currency(row.getValue("ggr") as number),
  },
  {
    accessorKey: "margin",
    header: "Margin (%)",
    cell: ({ row }) => percentage(row.getValue("margin") as number),
  },
  {
    accessorKey: "ngr",
    header: "NGR",
    cell: ({ row }) => currency(row.getValue("ngr") as number),
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "channel",
    header: "Channel",
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date") as string);
      return date.toLocaleString();
    },
  },
];

