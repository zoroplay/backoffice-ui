import { ColumnDef } from "@tanstack/react-table";

export interface PoolFixtureRow {
  id: string;
  serial: number;
  division: string;
  eventId: string;
  eventName: string;
  market: string;
  oddsHome: number;
  oddsDraw: number;
  oddsAway: number;
  date: string;
  time: string;
  scores: string;
  result: string;
  status: string;
}

const formatCurrency = (value: number) => value.toFixed(2);

export const columns: ColumnDef<PoolFixtureRow>[] = [
  {
    accessorKey: "serial",
    header: "S/N",
  },
  {
    accessorKey: "division",
    header: "Division",
  },
  {
    accessorKey: "eventId",
    header: "Event ID",
  },
  {
    accessorKey: "eventName",
    header: "Event",
    cell: ({ row }) => (
      <span className="truncate" title={row.getValue<string>("eventName") ?? ""}>
        {row.getValue("eventName") as string}
      </span>
    ),
  },
  {
    accessorKey: "market",
    header: "Market",
  },
  {
    accessorKey: "oddsHome",
    header: "1",
    cell: ({ row }) => formatCurrency(row.getValue("oddsHome") as number),
  },
  {
    accessorKey: "oddsDraw",
    header: "X",
    cell: ({ row }) => formatCurrency(row.getValue("oddsDraw") as number),
  },
  {
    accessorKey: "oddsAway",
    header: "2",
    cell: ({ row }) => formatCurrency(row.getValue("oddsAway") as number),
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "scores",
    header: "Scores",
  },
  {
    accessorKey: "result",
    header: "Results",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

