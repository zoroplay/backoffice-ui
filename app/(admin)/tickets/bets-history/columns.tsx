"use client"

import { ColumnDef } from "@tanstack/react-table"
import  Badge  from "@/components/ui/badge/Badge"
import Button  from "@/components/ui/button/Button"

// Define your table data type
export type BetHistory = {
  betslipId: string
  betType: string
  placedOn: string
  placedBy: string
  betStatus: "Won" | "Lost" | "Cancelled" | "Pending"
  odds: number
  stake: number
  returns: number
  winLoss: string
  sport: string
  league: string
  event: string
  market: string
  lostEvents: number
  clientType: "Retail" | "Agent" | "Online"
  bonus: number
  settledAt: string
}

export const columns: ColumnDef<BetHistory>[] = [
  {
    accessorKey: "betslipId",
    header: "Betslip ID",
  },
  {
    accessorKey: "betType",
    header: "Bet Type",
  },
  {
    accessorKey: "placedOn",
    header: "Placed On",
  },
  {
    accessorKey: "placedBy",
    header: "By",
  },
  {
    accessorKey: "betStatus",
    header: "Bet Status",
    cell: ({ row }) => {
      const status = row.original.betStatus
      return (
        <Badge
          variant="light"
          color={
            status === "Won"
              ? "success"
              : status === "Lost"
              ? "error"
              : "info"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "odds",
    header: "Odds",
  },
  {
    accessorKey: "stake",
    header: "Stake (₦)",
  },
  {
    accessorKey: "returns",
    header: "Return (₦)",
  },
  {
    accessorKey: "winLoss",
    header: "Win/Loss (₦)",
  },
  {
    accessorKey: "sport",
    header: "Sport",
  },
  {
    accessorKey: "league",
    header: "League",
  },
  {
    accessorKey: "event",
    header: "Event",
  },
  {
    accessorKey: "market",
    header: "Market",
  },
  {
    accessorKey: "lostEvents",
    header: "Lost Events",
  },
  {
    accessorKey: "clientType",
    header: "Client Type",
  },
  {
    accessorKey: "bonus",
    header: "Bonus (₦)",
  },
  {
    accessorKey: "settledAt",
    header: "Bet Settled Date & Time",
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <Button variant="outline" size="sm">
        View
      </Button>
    ),
  },
]
