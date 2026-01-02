"use client";

import React, { useState } from "react";
import type { SingleValue } from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { networkSalesColumns } from "../network_sales/columns";
import { NetworkSalesTypes } from "./columns";
import { networkSalesData } from "../network_sales/data";
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

  const [filteredData, setFilteredData] = useState<NetworkSalesTypes[]>(
    networkSalesData
  );

  // ----------------------
  // Apply filters
  // ----------------------
  const handleSearch = () => {
    const filtered = networkSalesData.filter((row) => {
      // Product Type filter
      const matchesProductType = selectedFilter
        ? selectedFilter.value.toLowerCase() === row.productType.toLowerCase()
        : true;


      // Date range filter
      const matchesDate =
        dateRange && dateRange.startDate && dateRange.endDate
          ? (() => {
            const rowDate = new Date(row.date);
            const start = new Date(dateRange.startDate);
            const end = new Date(dateRange.endDate);

            rowDate.setHours(0, 0, 0, 0);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            return rowDate >= start && rowDate <= end;
          })()
          : true;

      return matchesProductType && matchesDate;
    });

    setFilteredData(filtered);
  };

  // ----------------------
  // Clear filters
  // ----------------------
  const handleClear = () => {
    setDateRange(defaultDateRange);
    setSelectedFilter(null);
    setFilteredData(networkSalesData);
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
      <DataTable columns={networkSalesColumns} data={filteredData} />
    </section>
  );
}

export default withAuth(NetworkSales);
