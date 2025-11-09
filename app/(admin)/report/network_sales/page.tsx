"use client";

import React, { useState } from "react";
import Select from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { FilterActions } from "@/components/common/FilterActions";
import type { Range } from "react-date-range";
import { DateRangeFilter, defaultDateRange } from "@/components/common/DateRangeFilter";
import { networkSalesColumns } from "../network_sales/columns";
import { NetworkSalesTypes } from "./columns";
import { networkSalesData } from "../network_sales/data";
import { withAuth } from "@/utils/withAuth";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";

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
  const { theme } = useTheme();
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

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range Picker */}
          <DateRangeFilter
            range={dateRange}
            onChange={(range) => setDateRange(range)}
          />

          {/* Single Select */}
          <div className="w-[20rem]">
            <Select
              styles={reactSelectStyles(theme)}
              options={productTypeOptions}
              placeholder="Filter by Product Type"
              value={selectedFilter}
              onChange={(val) => setSelectedFilter(val as FilterOption | null)}
              isClearable
            />
          </div>
        </div>

        <FilterActions onSearch={handleSearch} onClear={handleClear} />
      </div>

      {/* Table */}
      <DataTable columns={networkSalesColumns} data={filteredData} />
    </section>
  );
}

export default withAuth(NetworkSales);
