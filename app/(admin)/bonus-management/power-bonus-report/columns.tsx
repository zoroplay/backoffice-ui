"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PowerBonusConfig, AgentAssignment, DashboardRow } from "./data";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";

// 1. Configuration Columns
export const configColumns: ColumnDef<PowerBonusConfig>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ getValue }) => <span className="font-mono text-xs">{getValue<string>()}</span>,
  },
  {
    accessorKey: "provider",
    header: "Provider",
  },
  {
    accessorKey: "targetStake",
    header: "Target Stake",
    cell: ({ getValue }) => <span className="font-semibold">₦{getValue<number>().toLocaleString()}</span>,
  },
  {
    accessorKey: "period",
    header: "Period",
    cell: ({ row }) => (
      <div className="text-xs text-gray-500">
        <div>{row.original.startDate}</div>
        <div>to {row.original.endDate}</div>
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ getValue }) => {
      const active = getValue<boolean>();
      return (
        <Badge variant="light" color={active ? "success" : "neutral"}>
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "tiers",
    header: "Tiers",
    cell: ({ getValue }) => (
      <Badge variant="light" color="neutral" className="font-medium bg-gray-50 border border-gray-200">
        {getValue<any[]>().length} Tiers
      </Badge>
    ),
  },
  {
    id: "action",
    header: "Action",
    cell: () => (
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" className="p-2 h-auto">
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="sm" className="p-2 h-auto text-error-600">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    ),
  },
];

// 2. Assignment Columns
export const assignmentColumns: ColumnDef<AgentAssignment>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "powerBonusId", header: "Power Bonus ID" },
  { accessorKey: "agentId", header: "Agent ID" },
  { accessorKey: "provider", header: "Provider" },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
  },
];

// 3. Dashboard Columns
export const dashboardColumns: ColumnDef<DashboardRow>[] = [
  { accessorKey: "agent", header: "Agent" },
  { accessorKey: "totalTickets", header: "Total Tickets" },
  {
    accessorKey: "totalStake",
    header: "Total Stake",
    cell: ({ getValue }) => `₦${getValue<number>().toLocaleString()}`,
  },
  {
    accessorKey: "weightedStake",
    header: "Weighted Stake",
    cell: ({ getValue }) => `₦${getValue<number>().toLocaleString()}`,
  },
  { accessorKey: "avgSelections", header: "Avg Sel." },
  {
    accessorKey: "totalWinnings",
    header: "Total Winnings",
    cell: ({ getValue }) => `₦${getValue<number>().toLocaleString()}`,
  },
  { accessorKey: "ggr", header: "GGR" },
  {
    accessorKey: "margin",
    header: "Margin",
    cell: ({ getValue }) => `${getValue<number>().toFixed(1)}%`,
  },
  {
    accessorKey: "rate",
    header: "Rate",
    cell: ({ getValue }) => `${getValue<number>().toFixed(1)}%`,
  },
  {
    accessorKey: "grossBonus",
    header: "Gross Bonus",
    cell: ({ getValue }) => `₦${getValue<number>().toLocaleString()}`,
  },
  {
    accessorKey: "netBonus",
    header: "Net Bonus",
    cell: ({ getValue }) => `₦${getValue<number>().toLocaleString()}`,
  },
  {
    accessorKey: "eligible",
    header: "Eligible",
    cell: ({ getValue }) => (
      <div className="flex justify-center">
        {getValue<boolean>() ? (
          <CheckCircle2 className="h-4 w-4 text-success-500" />
        ) : (
          <XCircle className="h-4 w-4 text-error-500" />
        )}
      </div>
    ),
  },
];
