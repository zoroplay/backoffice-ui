"use client"

import { ColumnDef } from "@tanstack/react-table"

export type NetworkSalesTypes = {
  name: string
  bets: number
  turnover: number
  winnings: number
  ggr: number
  margin: string
  ngr: number
  date: string
  productType: string
}

export const networkSalesColumns: ColumnDef<NetworkSalesTypes>[] = [
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
