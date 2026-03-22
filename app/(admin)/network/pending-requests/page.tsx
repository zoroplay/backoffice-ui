"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Info, Clock, CheckCircle2, XCircle } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { withAuth } from "@/utils/withAuth";
import { agentsApi, normalizeApiError } from "@/lib/api";

import { columns, PendingRequest } from "./columns";

const parsePendingRequests = (response: unknown): PendingRequest[] => {
  if (!response || typeof response !== "object") return [];
  const root = response as Record<string, unknown>;
  const candidates = [
    root.data,
    (root.data as Record<string, unknown> | undefined)?.data,
  ];

  const list = candidates.find(Array.isArray) as unknown[] | undefined;
  if (!Array.isArray(list)) return [];

  return list.map((item) => {
    const row = (item as Record<string, unknown>) ?? {};
    const statusNum = Number(row.status ?? 0);
    const status: PendingRequest["status"] =
      statusNum === 1
        ? "approved"
        : statusNum === 2
        ? "rejected"
        : "pending";

    return {
      id: String(row.id ?? ""),
      username: String(row.username ?? ""),
      name: String(
        row.name ?? `${String(row.firstName ?? "")} ${String(row.lastName ?? "")}`.trim()
      ),
      requestType: String(row.requestType ?? row.request_type ?? "Request"),
      requestedDate: String(
        row.requestedDate ?? row.requested_date ?? row.createdAt ?? new Date().toISOString()
      ),
      status,
      agentType: String(row.rolename ?? row.agentType ?? ""),
      parentUser: String(row.parentUser ?? row.parent_username ?? ""),
      notes: String(row.notes ?? ""),
    };
  });
};

function PendingRequestsPage() {
  const [allRequests, setAllRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await agentsApi.getAgentPendingRequests({ page: 1 });
        if (cancelled) return;
        setAllRequests(parsePendingRequests(response));
      } catch (err) {
        if (cancelled) return;
        const apiError = normalizeApiError(err);
        setError(apiError.message ?? "Failed to fetch pending requests");
        setAllRequests([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchRequests();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleApprove = useCallback((requestId: string) => {
    setAllRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? { ...request, status: "approved" as const }
          : request
      )
    );
  }, []);

  const handleReject = useCallback((requestId: string) => {
    setAllRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? { ...request, status: "rejected" as const }
          : request
      )
    );
  }, []);

  const tableColumns = useMemo(
    () =>
      columns.map((col) => {
        if (col.id === "actions") {
          return {
            ...col,
            cell: ({ row }: { row: { original: PendingRequest } }) => {
              const request = row.original;
              const isPending = request.status === "pending";

              return (
                <div className="flex items-center gap-2">
                  {isPending ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        className="h-8 bg-green-500 px-3 text-white hover:bg-green-600"
                        onClick={() => handleApprove(request.id)}
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-red-300 px-3 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={() => handleReject(request.id)}
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <span className="text-center text-sm text-gray-400 dark:text-gray-500">
                      Processed
                    </span>
                  )}
                </div>
              );
            },
          };
        }
        return col;
      }),
    [handleApprove, handleReject]
  );

  const pendingCount = allRequests.filter((r) => r.status === "pending").length;
  const approvedCount = allRequests.filter((r) => r.status === "approved").length;
  const rejectedCount = allRequests.filter((r) => r.status === "rejected").length;

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Pending Requests" />

      <span className="mb-2 flex items-center gap-1 text-gray-500 dark:text-gray-400">
        <Info className="h-4 w-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Pending requests load automatically. Admin can approve or reject requests.
        </p>
      </span>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {pendingCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Approved
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {approvedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Rejected
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {rejectedCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <DataTable columns={tableColumns} data={allRequests} loading={isLoading} />
    </div>
  );
}

export default withAuth(PendingRequestsPage);

