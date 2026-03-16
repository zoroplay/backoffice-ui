import { ColumnDef } from "@tanstack/react-table"
import { TableDataTypes } from "./data" // adjust path if you keep the interface & mock data elsewhere

// Define columns for the Gaming Activities table
export const columns: ColumnDef<TableDataTypes>[] = [
  {
    accessorKey: "group",
    header: "Group",
    cell: ({ row }) => <span className="font-medium">{row.getValue("group")}</span>,
  },
  {
    accessorKey: "bets",
    header: "Bets",
    cell: ({ row }) => {
      const value = row.getValue<number>("bets")
      return <span>{value.toFixed(2)}</span>
    },
  },
  {
    accessorKey: "turnover",
    header: "Turnover",
    cell: ({ row }) => {
      const value = row.getValue<number>("turnover")
      return <span>{value.toFixed(2)}</span>
    },
  },
  {
    accessorKey: "winnings",
    header: "Winnings",
    cell: ({ row }) => {
      const value = row.getValue<number>("winnings")
      return <span>{value.toFixed(2)}</span>
    },
  },
  {
    accessorKey: "ggr",
    header: "GGR",
    cell: ({ row }) => {
      const value = row.getValue<number>("ggr")
      return <span>{value.toFixed(2)}</span>
    },
  },
  {
    accessorKey: "margin",
    header: "Margin",
    cell: ({ row }) => {
      const value = row.getValue<string>("margin")
      return <span className="text-green-600">{value}</span>
    },
  },
]
