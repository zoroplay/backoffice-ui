"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Transaction = {
  date: string
  transactionId: string
  username: string
  operationType: string
  description: string
  amount: number
  prevBalance: number
  balance: number
}

export const columns: ColumnDef<Transaction>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "transactionId", header: "Transaction ID" },
  { accessorKey: "username", header: "User" },
  { accessorKey: "operationType", header: "Operation Type" },
  { accessorKey: "description", header: "Description" },
  { accessorKey: "amount", header: "Amount" },
  { accessorKey: "prevBalance", header: "Prev Balance" },
  { accessorKey: "balance", header: "Balance" },
]
