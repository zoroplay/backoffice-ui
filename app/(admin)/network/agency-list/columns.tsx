"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DollarSign, Lock, Check } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";

export type Agency = {
  username: string;
  name: string;
  agentType: string;
  status: string;
  networkBalance: number;
  networkTrust: number;
  availBalance: number;
  balance: number;
  commissionBalance: number;
  trustUser: number;
  tempBlock: boolean;
};

const formatCurrency = (amount: number) => {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const columns: ColumnDef<Agency>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <button
        className="hover:text-brand-600 dark:hover:text-brand-300 hover:underline font-medium"
        onClick={() => console.log("View agent:", row.original.username)}
      >
        {row.original.username}
      </button>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <button
        className=" hover:text-brand-600  dark:hover:text-brand-300 hover:underline font-medium"
        onClick={() => console.log("View agent:", row.original.name)}
      >
        {row.original.name}
      </button>
    ),
  },
  {
    accessorKey: "agentType",
    header: "Agent Type",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant="light"
          color={status === "Active" ? "success" : "warning"}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "networkBalance",
    header: "Network Balance",
    cell: ({ row }) => (
      <span className="font-medium">
        {formatCurrency(row.original.networkBalance)}
      </span>
    ),
  },
  {
    accessorKey: "networkTrust",
    header: "Network Trust",
    cell: ({ row }) => (
      <span className="font-medium">
        {formatCurrency(row.original.networkTrust)}
      </span>
    ),
  },
  {
    accessorKey: "availBalance",
    header: "Avail. Balance",
    cell: ({ row }) => (
      <span className="font-medium">
        {formatCurrency(row.original.availBalance)}
      </span>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => (
      <span className="font-medium">
        {formatCurrency(row.original.balance)}
      </span>
    ),
  },
  {
    accessorKey: "commissionBalance",
    header: "Commission Balance",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.commissionBalance}</span>
    ),
  },
  {
    accessorKey: "trustUser",
    header: "Trust User",
    cell: ({ row }) => (
      <span className="font-medium">
        {formatCurrency(row.original.trustUser)}
      </span>
    ),
  },
  {
    id: "tempBlock",
    header: "Temp. Block",
    cell: ({ row }) => {
      const hasBalance = row.original.balance > 0;
      const isBlocked = row.original.tempBlock;
      
      return (
        <div className="flex items-center justify-center gap-2">
          {hasBalance && (
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          )}
          <span className="text-gray-400">|</span>
          {isBlocked ? (
            <Lock className="h-4 w-4 text-error-600 dark:text-error-400" />
          ) : (
            <Check className="h-4 w-4 text-success-600 dark:text-success-400" />
          )}
        </div>
      );
    },
  },
];

