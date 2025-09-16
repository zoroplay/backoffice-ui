"use client";

import React, { useState } from "react";
import Select from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { networkSalesColumns } from "../network_sales/columns";
import { networkSalesData } from "../network_sales/data";
import { withAuth } from "@/utils/withAuth";

// ----------------------
// Select Options
// ----------------------
const groupedOptions = [
  {
    label: "Product Type",
    options: [
      { value: "Sport", label: "Sport" },
      { value: "Casino", label: "Casino" },
      { value: "Games", label: "Games" },
      { value: "Virtual Sport", label: "Virtual Sport" },
    ],
}];


// ----------------------
// Component
// ----------------------
function NetworkSales() {
  const [filters, setFilters] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  

  // ----------------------
  // Filter & Search logic placeholder
  // ----------------------
  const filteredData = networkSalesData.filter((row) => {
    // Example: filter by search text in group column
    if (searchText) {
      return row.name.toString().includes(searchText);
    }
    return true;
  });

  return (
    <div className="space-y-6 p-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Grouped Multi-Select */}
        <div className="w-[20rem]">
          <Select
            options={groupedOptions}
            placeholder="Filter by Product Type"
            value={filters}
            onChange={(val) => setFilters(val as any[])}
          />
        </div>

        {/* Date Range Picker */}
        <DateRangeFilter
        onChange={(range) => {
        console.log("Selected Range:", range);
    // You can trigger table filtering here
  }}
/>

        {/* Search */}
        {/* <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border py-2 px-3 rounded focus:outline-none focus:ring focus:ring-zinc-500 w-[20rem]"
        /> */}
      </div>

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Network Sales" />
      {/* Table */}
      <DataTable columns={networkSalesColumns} data={filteredData} />
    </div>
  );
}

export default withAuth(NetworkSales);
