// columns/networkSalesColumns.ts
"use client"

import { ColumnDef } from "@tanstack/react-table"

export type NetworkSales = {
  name: string
  bets: number
  turnover: number
  winnings: number
  ggr: number
  margin: string
  ngr: number
}

export const networkSalesColumns: ColumnDef<NetworkSales>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "bets",
    header: "Bets",
  },
  {
    accessorKey: "turnover",
    header: "Turnover",
  },
  {
    accessorKey: "winnings",
    header: "Winnings",
  },
  {
    accessorKey: "ggr",
    header: "GGR",
  },
  {
    accessorKey: "margin",
    header: "Margin",
  },
  {
    accessorKey: "ngr",
    header: "NGR",
  },
]
