"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { Range } from "react-date-range";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { DateRangeFilter, defaultDateRange } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";

import { columns } from "./columns";
import { networkSalesData, NetworkSalesReport } from "./data";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Infotext } from "@/components/common/Info";

const searchableFields: Array<keyof NetworkSalesReport> = ["name"];

function NetworkSalesReportPage() {
  const [filteredData, setFilteredData] = useState<NetworkSalesReport[]>(networkSalesData);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [appliedDateRange, setAppliedDateRange] = useState<Range>(defaultDateRange);

  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  useEffect(() => {
    setPlaceholder("Search by Agent/Shop Name");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  const filterSalesData = useCallback(
    (value: string) => {
      const searchTerm = value.trim().toLowerCase();

      return networkSalesData.filter((row) => {
        if (searchTerm) {
          const matchesSearch = searchableFields.some((field) =>
            String(row[field] ?? "").toLowerCase().includes(searchTerm)
          );

          if (!matchesSearch) {
            return false;
          }
        }

        // Date range filtering would go here if we had a date field
        // For now, we'll keep all records that pass the search filter
        return true;
      });
    },
    []
  );

  useEffect(() => {
    setFilteredData(filterSalesData(query));
  }, [filterSalesData, query]);

  const applyFilters = () => {
    const nextRange = dateRange.startDate && dateRange.endDate ? dateRange : defaultDateRange;
    setAppliedDateRange(nextRange);
    setFilteredData(filterSalesData(query));
  };

  const clearFilters = () => {
    setDateRange(defaultDateRange);
    setAppliedDateRange(defaultDateRange);
    setFilteredData(networkSalesData);
    resetQuery();
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Network Sales Report" />
      <Infotext text="Use the global search to filter by Agent/Shop Name, or use the filters below to narrow down the results." />

      <TableFilterToolbar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: applyFilters,
          onClear: clearFilters,
        }}
      />

      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(NetworkSalesReportPage);
