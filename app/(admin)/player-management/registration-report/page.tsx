"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GroupBase } from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import {
   defaultDateRange,
} from "@/components/common/DateRangeFilter";
import { columns } from "./columns";
import type { Registration } from "./data";
import { withAuth } from "@/utils/withAuth";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { normalizeApiError, playerApi } from "@/lib/api";
import { toast } from "sonner";

// ----------------------
// Select Options
// ----------------------
const clientTypeOptions = [
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "retail", label: "Retail" },
];

type ClientTypeOption = { value: string; label: string };

// ----------------------
// Component
// ----------------------
function RegistrationReport() {
  const [selectedClientType, setSelectedClientType] = useState<ClientTypeOption[]>([]);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [data, setData] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toDateTimeString = useCallback((date: Date, endOfDay = false) => {
    const d = new Date(date);
    if (endOfDay) {
      d.setHours(23, 59, 59, 999);
    } else {
      d.setHours(0, 0, 0, 0);
    }

    const pad = (value: number) => String(value).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }, []);

  const mapStatus = useCallback((status: unknown): Registration["status"] => {
    if (Number(status) === 1) return "Active";
    if (Number(status) === 3) return "Suspended";
    return "Inactive";
  }, []);

  const mapClientType = useCallback((source: unknown): Registration["clientType"] => {
    const normalized = String(source ?? "").trim().toLowerCase();
    if (normalized === "mobile") return "Mobile";
    if (normalized === "retail") return "Retail";
    return "Web";
  }, []);

  const mapRows = useCallback((payload: unknown): Registration[] => {
    const root = (payload && typeof payload === "object") ? (payload as { data?: unknown }) : {};
    const rows = Array.isArray(root.data) ? root.data : [];

    return rows.map((entry) => {
      const row = entry as Record<string, unknown>;
      return {
        username: String(row.username ?? ""),
        fullName: `${String(row.firstName ?? "")} ${String(row.lastName ?? "")}`.trim(),
        phoneNumber: String(row.phoneNumber ?? ""),
        registered: String(row.registered ?? row.createdAt ?? ""),
        lastLogin: String(row.lastLogin ?? row.registered ?? row.createdAt ?? ""),
        balance: Number(row.balance ?? 0),
        status: mapStatus(row.status),
        clientType: mapClientType(row.source),
      };
    });
  }, [mapClientType, mapStatus]);

  const fetchReport = useCallback(async () => {
    const start = dateRange.startDate ?? new Date("1970-01-01T00:00:00");
    const end = dateRange.endDate ?? new Date();
    const source = selectedClientType[0]?.value ?? "";

    try {
      setIsLoading(true);
      const response = await playerApi.getRegistrationReport(1, {
        from: toDateTimeString(start),
        to: toDateTimeString(end, true),
        source,
        period: "date_range",
        status: "all",
      });
      setData(mapRows(response));
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to load registration report");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.endDate, dateRange.startDate, mapRows, selectedClientType, toDateTimeString]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  const filteredData = useMemo(() => {
    const selectedTypes = selectedClientType.map((filter) => filter.value.toLowerCase());
    if (selectedTypes.length === 0) return data;

    return data.filter((item) => selectedTypes.includes(item.clientType.toLowerCase()));
  }, [data, selectedClientType]);

  // ----------------------
  // Clear filters
  // ----------------------
  const handleClear = () => {
    setDateRange(defaultDateRange);
    setSelectedClientType([]);
  };

  // ----------------------
  // Apply filters
  // ----------------------
 const handleSearch = () => {
  void fetchReport();
};


  return (
    <section className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Registration Report" />

      {/* Filters */}
      <TableFilterToolbar<ClientTypeOption, true, GroupBase<ClientTypeOption>>   
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: handleSearch,
          onClear: handleClear,
        }}
        selectProps={{
          containerClassName: "max-w-[20rem]",
          options: clientTypeOptions,
          placeholder: "Filter by Client Type",
          value: selectedClientType,
          onChange: (val) => setSelectedClientType(Array.isArray(val) ? [...val] : []),
          isMulti: true,
        }}
      />  

      {/* Data Table */}
      <DataTable columns={columns} data={filteredData} loading={isLoading} />
    </section>
  );
}

export default withAuth(RegistrationReport);
