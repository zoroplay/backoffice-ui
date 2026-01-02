"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, XCircle, Clock, User } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";

export type PendingRequest = {
  id: string;
  username: string;
  name: string;
  requestType: string;
  requestedDate: string;
  status: "pending" | "approved" | "rejected";
  agentType?: string;
  parentUser?: string;
  notes?: string;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return (
        <Badge variant="light" color="success">
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="light" color="error">
          Rejected
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge variant="light" color="warning">
          Pending
        </Badge>
      );
  }
};

export const columns: ColumnDef<PendingRequest>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-gray-400" />
        <button
          className="font-medium hover:text-brand-600 dark:hover:text-brand-300 hover:underline"
          onClick={() => console.log("View request:", row.original.id)}
        >
          {row.original.username}
        </button>
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "requestType",
    header: "Request Type",
    cell: ({ row }) => (
      <span className="text-gray-700 dark:text-gray-300">
        {row.original.requestType}
      </span>
    ),
  },
  {
    accessorKey: "agentType",
    header: "Agent Type",
    cell: ({ row }) => (
      <span className="text-gray-600 dark:text-gray-400">
        {row.original.agentType || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "parentUser",
    header: "Parent User",
    cell: ({ row }) => (
      <span className="text-gray-600 dark:text-gray-400">
        {row.original.parentUser || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "requestedDate",
    header: "Requested Date",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-400" />
        <span className="text-gray-600 dark:text-gray-400">
          {formatDate(row.original.requestedDate)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const request = row.original;
      const isPending = request.status === "pending";

      return (
        <div className="flex items-center gap-2">
          {isPending && (
            <>
              <Button
                variant="primary"
                size="sm"
                className="h-8 bg-green-500 hover:bg-green-600 text-white px-3"
                onClick={() => {
                  console.log("Approve request:", request.id);
                  // TODO: Add approve logic
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 px-3"
                onClick={() => {
                  console.log("Reject request:", request.id);
                  // TODO: Add reject logic
                }}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Reject
              </Button>
            </>
          )}
          {!isPending && (
            <span className="text-sm text-gray-400 text-center dark:text-gray-500">
              Processed
            </span>
          )}
        </div>
      );
    },
  },
];

