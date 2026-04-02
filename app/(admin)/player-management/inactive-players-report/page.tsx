"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GroupBase } from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns } from "./columns";
import type { InactivePlayer } from "./data";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Info } from "lucide-react";
import { normalizeApiError, playerApi } from "@/lib/api";
import { toast } from "sonner";

const clientTypeOptions = [
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "retail", label: "Retail" },
];

type ClientTypeOption = { value: string; label: string };

function mapInactiveRow(entry: Record<string, unknown>): InactivePlayer {
  const status = Number(entry.status ?? 0);

  return {
    username: String(entry.username ?? ""),
    fullName: `${String(entry.firstName ?? "")} ${String(entry.lastName ?? "")}`.trim(),
    phoneNumber: String(entry.phoneNumber ?? ""),
    lastLogin: String(entry.lastLogin ?? entry.updatedAt ?? new Date().toISOString()),
    balance: Number(entry.balance ?? 0),
    processStatus: status === 1 ? "Completed" : status === 3 ? "Failed" : "Pending",
    clientType: String(entry.source ?? "web").toLowerCase() as InactivePlayer["clientType"],
  };
}

function InactivePlayersReport() {
  const [selectedClientType, setSelectedClientType] = useState<ClientTypeOption[]>([]);
  const [data, setData] = useState<InactivePlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  useEffect(() => {
    setPlaceholder("Search by Username");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  const loadReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await playerApi.getInactivePlayersReport(1, {
        country: "",
        state: "",
        username: query.trim(),
        source: "",
      });

      const root = (response && typeof response === "object") ? (response as { data?: unknown }) : {};
      const rows = Array.isArray(root.data) ? root.data : [];
      setData(rows.map((row) => mapInactiveRow(row as Record<string, unknown>)));
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to load inactive players report");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const filteredData = useMemo(() => {
    const clientTypeValues = selectedClientType.map((f) => (f.value ?? "").toLowerCase());
    const lowerSearch = query.trim().toLowerCase();

    return data.filter((item) => {
      const matchesUsername = !lowerSearch || item.username.toLowerCase().includes(lowerSearch);
      const matchesType =
        clientTypeValues.length === 0 || clientTypeValues.includes(item.clientType.toLowerCase());

      return matchesUsername && matchesType;
    });
  }, [data, query, selectedClientType]);

  const handleClear = () => {
    setSelectedClientType([]);
    resetQuery();
  };

  const handleSearch = () => {
 ;
    void loadReport();
  };

  return (
    <section className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Inactive Players Report" />

      <span className="mb-2 flex items-center gap-1 text-gray-500 dark:text-gray-400">
        <Info className="h-4 w-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Use the global search to filter by Username</p>
      </span>

      <TableFilterToolbar<ClientTypeOption, true, GroupBase<ClientTypeOption>>
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

      <DataTable columns={columns} data={filteredData} loading={isLoading} />
    </section>
  );
}

export default withAuth(InactivePlayersReport);
