"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Range } from "react-date-range";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import { columns } from "./columns";
import type { FrozenAccount } from "./data";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Info } from "lucide-react";
import { normalizeApiError, playerApi } from "@/lib/api";
import { toast } from "sonner";

function mapFrozenRow(entry: Record<string, unknown>): FrozenAccount {
  const status = Number(entry.status ?? 0);

  return {
    username: String(entry.username ?? ""),
    fullName: `${String(entry.firstName ?? "")} ${String(entry.lastName ?? "")}`.trim(),
    balance: Number(entry.balance ?? 0),
    playerStatus: status === 3 ? "Frozen" : status === 2 ? "Partially Frozen" : "Released",
    freezeDate: String(entry.registered ?? entry.updatedAt ?? new Date().toISOString()),
    freezeType: "Manual",
    reason: String(entry.reason ?? ""),
    processStatus: "Pending",
  };
}

function FrozenAccountReportPage() {
  const [data, setData] = useState<FrozenAccount[]>([]);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [isLoading, setIsLoading] = useState(false);

  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  useEffect(() => {
    const placeholderText = "Search by Username, Full Name, or Reason";
    setPlaceholder(placeholderText);

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  const loadReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await playerApi.getFrozenAccountsReport(1, {
        country: "",
        state: "",
        username: query.trim(),
        source: "",
      });

      const root = (response && typeof response === "object") ? (response as { data?: unknown }) : {};
      const rows = Array.isArray(root.data) ? root.data : [];
      setData(rows.map((row) => mapFrozenRow(row as Record<string, unknown>)));
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to load frozen account report");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const filteredData = useMemo(() => {
    const term = query.trim().toLowerCase();

    return data.filter((row) => {
      const matchesSearch =
        !term ||
        row.username.toLowerCase().includes(term) ||
        row.fullName.toLowerCase().includes(term) ||
        row.reason.toLowerCase().includes(term);

      const matchesDate =
        dateRange.startDate && dateRange.endDate
          ? (() => {
              const rowDate = new Date(row.freezeDate);
              const start = new Date(dateRange.startDate);
              const end = new Date(dateRange.endDate);

              rowDate.setHours(0, 0, 0, 0);
              start.setHours(0, 0, 0, 0);
              end.setHours(23, 59, 59, 999);

              return rowDate >= start && rowDate <= end;
            })()
          : true;

      return matchesSearch && matchesDate;
    });
  }, [data, dateRange.endDate, dateRange.startDate, query]);

  const applyFilters = () => {
    void loadReport();
  };

  const clearFilters = () => {
    setDateRange(defaultDateRange);
    resetQuery();
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Frozen Account Report" />

      <span className="mb-2 flex items-center gap-1 text-gray-500 dark:text-gray-400">
        <Info className="h-4 w-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Use the global search to filter by Username, Full Name, or Reason</p>
      </span>

      <TableFilterToolbar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: applyFilters,
          onClear: clearFilters,
        }}
      />

      <DataTable columns={columns} data={filteredData} loading={isLoading} />
    </div>
  );
}

export default withAuth(FrozenAccountReportPage);
