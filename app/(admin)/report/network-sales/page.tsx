"use client";

import React, { useState } from "react";
import { reportsApi, normalizeApiError } from "@/lib/api";
import type { SingleValue } from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { networkSalesColumns } from "./columns";
import { NetworkSalesTypes } from "./columns";
import { withAuth } from "@/utils/withAuth";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Infotext } from "@/components/common/Info";

// ----------------------
// Select Options
// ----------------------
type FilterOption = {
  value: string;
  label: string;
};

const productTypeOptions: FilterOption[] = [
  { value: "sport", label: "Sport" },
  { value: "casino", label: "Casino" },
  { value: "games", label: "Games" },
  { value: "virtual sport", label: "Virtual Sport" },
];

// ----------------------
// Component
// ----------------------
function NetworkSales() {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption | null>(null);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);

  const [filteredData, setFilteredData] = useState<NetworkSalesTypes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----------------------
  // Apply filters
  // ----------------------
  const fmt = (d?: Date, endOfDay = false) => {
    if (!d) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy} ${endOfDay ? "23:59:59" : "00:00:00"}`;
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const productMap: Record<string, string> = {
        sport: "sports",
        casino: "casino",
        games: "games",
        "virtual sport": "virtuals",
      };

      const product = selectedFilter
        ? productMap[selectedFilter.value.toLowerCase()] ?? selectedFilter.value
        : "sports";

      const payload = {
        // period: "current_week",
        username: "",
        from: fmt(dateRange.startDate ?? undefined, false),
        to: fmt(dateRange.endDate ?? undefined, true),
        product,
      } as const;

      const res = await reportsApi.getNetworkSales(payload, 1);

      // res expected shape: { data: { data: [], total: {...} } }
      if (res && typeof res === "object" && "data" in res) {
        const payloadData = (res as any).data;
        const rows = Array.isArray(payloadData.data) ? payloadData.data : [];
        setFilteredData(rows as NetworkSalesTypes[]);
      } else if (Array.isArray(res)) {
        setFilteredData(res as NetworkSalesTypes[]);
      } else {
        setFilteredData([]);
      }
    } catch (err) {
      const apiErr = normalizeApiError(err);
      setError(apiErr.message ?? "Failed to fetch network sales");
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------
  // Clear filters
  // ----------------------
  const handleClear = () => {
    setDateRange(defaultDateRange);
    setSelectedFilter(null);
    setFilteredData([]);
  };

  return (
    <section className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Network Sales" />
      <Infotext text="Use the filters below to narrow down the results." />

      <TableFilterToolbar<FilterOption>
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: handleSearch,
          onClear: handleClear,
        }}
        selectProps={{
          containerClassName: "max-w-[22rem]",
          options: productTypeOptions,
          placeholder: "Filter by Product Type",
          value: selectedFilter,
          onChange: (selected: SingleValue<FilterOption>) =>
            setSelectedFilter(selected ?? null),
          isClearable: true,
        }}
      />

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-8 text-gray-500">Loading...</div>
      ) : (
        <>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <DataTable columns={networkSalesColumns} data={filteredData} />
        </>
      )}
    </section>
  );
}

export default withAuth(NetworkSales);
