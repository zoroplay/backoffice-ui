"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DollarSign, Lock, Check, Send, Users } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";

export type Agency = {
  id?: string;
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

type AgencyActionCallbacks = {
  onSendToAgent: (agency: Agency) => void;
  onSendToAllAgents: () => void;
  onToggleTempBlock: (agency: Agency) => void;
};

const formatCurrency = (amount: number) => {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const baseColumns: ColumnDef<Agency>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => {
      const agentId = row.original.id || row.original.username;
      return (
        <Link
          href={`/network/agent/${agentId}`}
          className="hover:text-brand-600 dark:hover:text-brand-300 hover:underline font-medium"
        >
          {row.original.username}
        </Link>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const agentId = row.original.id || row.original.username;
      return (
        <Link
          href={`/network/agent/${agentId}`}
          className="hover:text-brand-600 dark:hover:text-brand-300 hover:underline font-medium"
        >
          {row.original.name}
        </Link>
      );
    },
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
];

export const createColumns = (
  callbacks: AgencyActionCallbacks
): ColumnDef<Agency>[] => [
  ...baseColumns,
  {
    id: "tempBlock",
    header: "Temp. Block",
    cell: ({ row }) => {
      const agency = row.original;
      const agentId = agency.id || agency.username;
      const isBlocked = agency.tempBlock;

      return (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={`/network/agent/${agentId}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white transition hover:bg-emerald-600"
            title="Open Agent Overview"
            aria-label="Open Agent Overview"
          >
            <DollarSign className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => callbacks.onToggleTempBlock(agency)}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-white transition ${
              isBlocked
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-gray-500 hover:bg-gray-600"
            }`}
            title={isBlocked ? "Unblock agent" : "Temporarily block agent"}
            aria-label={isBlocked ? "Unblock agent" : "Temporarily block agent"}
          >
            {isBlocked ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </button>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => callbacks.onSendToAgent(row.original)}
          className="p-2 h-auto text-brand-600 hover:bg-brand-50"
          title="Send message to this agent"
          aria-label="Send message to this agent"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={callbacks.onSendToAllAgents}
          className="p-2 h-auto text-emerald-600 hover:bg-emerald-50"
          title="Send message to all agents"
          aria-label="Send message to all agents"
        >
          <Users className="h-3.5 w-3.5" />
        </Button>
      </div>
    ),
  },
];

