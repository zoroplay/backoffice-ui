"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { Checkbox } from "@/components/ui/checkbox";

import type { EventItem } from "../types";

export type EventRow = {
  id: string;
  eventName: string;
  matchId: string;
  startTime: string;
  highlighted: boolean;
  status: "active" | "inactive";
};

type EventsTableProps = {
  events: EventItem[];
  onToggleHighlight: (eventId: string, value: boolean) => void;
  onToggleStatus: (eventId: string) => void;
};

export function EventsTable({ events, onToggleHighlight, onToggleStatus }: EventsTableProps) {
  const columns = useMemo<ColumnDef<EventRow, unknown>[]>(() => {
    return [
      {
        accessorKey: "eventName",
        header: "Event",
        meta: {
          cellClassName: "text-left whitespace-normal max-w-[280px]",
        },
        cell: ({ row }) => (
          <div className="text-left text-sm font-medium text-gray-900 dark:text-gray-100">
            {row.original.eventName}
          </div>
        ),
      },
      {
        accessorKey: "matchId",
        header: "Match ID",
        meta: {
          cellClassName: "text-left",
        },
        cell: ({ row }) => (
          <span className="text-sm text-gray-600 dark:text-gray-300">{row.original.matchId}</span>
        ),
      },
      {
        accessorKey: "startTime",
        header: "Start Time",
        meta: {
          cellClassName: "text-left whitespace-nowrap",
        },
        cell: ({ row }) => (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {new Date(row.original.startTime).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "highlighted",
        header: "Highlighted",
        meta: {
          cellClassName: "text-center",
        },
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Checkbox
              checked={row.original.highlighted}
              onCheckedChange={(checked) => onToggleHighlight(row.original.id, checked)}
            />
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: {
          cellClassName: "text-center",
        },
        cell: ({ row }) => {
          const isActive = row.original.status === "active";
          return (
            <div className="flex justify-center">
              <Button
                variant="outline"
                className={
                  isActive
                    ? " text-red-600 dark:text-red-700 dark:hover:text-red-400 hover:bg-red-100"
                    : "hover:bg-brand-50 text-green-600 dark:text-green-500"
                }
                onClick={() => onToggleStatus(row.original.id)}
              >
                <span className={isActive ? "text-red-600 dark:text-red-700" : "text-green-600 dark:text-green-500"}>
                  {isActive ? "Deactivate" : "Activate"}
                </span>
              </Button>
            </div>
          );
        },
      },
    ];
  }, [onToggleHighlight, onToggleStatus]);

  return <DataTable columns={columns} data={events} />;
}

export default EventsTable;

