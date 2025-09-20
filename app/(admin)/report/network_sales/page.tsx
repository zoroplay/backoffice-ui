"use client";

import React, { useState } from "react";
import Select from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { FilterActions } from "@/components/common/FilterActions";
import type { Range } from "react-date-range";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { networkSalesColumns } from "../network_sales/columns";
import { NetworkSalesTypes } from "./columns";
import { networkSalesData } from "../network_sales/data";
import { withAuth } from "@/utils/withAuth";

// ----------------------
// Select Options
// ----------------------
const groupedOptions = [
  {
    label: "Product Type",
    options: [
      { value: "sport", label: "Sport" },
      { value: "casino", label: "Casino" },
      { value: "games", label: "Games" },
      { value: "virtual sport", label: "Virtual Sport" },
    ],
  },
];

// ----------------------
// Component
// ----------------------
function NetworkSales() {
  const [selectedFilter, setSelectedFilter] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const [filteredData, setFilteredData] = useState<NetworkSalesTypes[]>(
    networkSalesData
  );

  // ----------------------
  // Clear filters
  // ----------------------
  const handleClear = () => {
    setDateRange({
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    });
    setSelectedFilter([]);
    setFilteredData(networkSalesData);
  };

  // ----------------------
  // Apply filters
  // ----------------------
  const handleSearch = () => {
  const start = dateRange.startDate ?? new Date("1900-01-01");
  const end = dateRange.endDate ?? new Date("2100-12-31");

  // Extract selected product types in lowercase
  const selectedProductTypes = selectedFilter
    .filter((f) => ["sport", "games", "casino", "virtual sport"].includes(f.value.toLowerCase()))
    .map((f) => f.value.toLowerCase());

  const filterFn = (item: { date: string; productType?: string }) => {
    const itemDate = new Date(item.date);
    const matchesDate = itemDate >= start && itemDate <= end;

    const matchesProductType =
      selectedProductTypes.length === 0 ||
      (item.productType && selectedProductTypes.includes(item.productType.toLowerCase()));

    return matchesDate && matchesProductType;
  };

  setFilteredData(networkSalesData.filter(filterFn));
};

  return (
    <section className="space-y-6 p-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Multi-Select */}
          <div className="w-[20rem]">
            <Select
              options={groupedOptions}
              isMulti
              placeholder="Filter by Product Type"
              value={selectedFilter}
              onChange={(val) => {
                setSelectedFilter(val as any[])
                console.log(selectedFilter)
              }
              }
            />
          </div>

          {/* Date Range Picker */}
          <DateRangeFilter
             range={dateRange}
             onChange={(range) => setDateRange(range)}
           />
        </div>

        <FilterActions onSearch={handleSearch} onClear={handleClear} />
      </div>

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Network Sales" />

      {/* Table */}
      <DataTable columns={networkSalesColumns} data={filteredData} />
    </section>
  );
}

export default withAuth(NetworkSales);
