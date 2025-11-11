"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { columns } from "./columns";
import { retailCashData, RetailCashRecord } from "./data";
import { withAuth } from "@/utils/withAuth";
import { ReportFilterToolbar } from "@/components/common/ReportFilterToolbar";


function RetailCashReport() {
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [filteredData, setFilteredData] = useState<RetailCashRecord[]>(retailCashData);

  // ----------------------
  // Clear filters
  // ----------------------
  const handleClear = () => {
    setDateRange(defaultDateRange);
    setFilteredData(retailCashData);
  };

  // ----------------------
  // Apply filters
  // ----------------------
  const handleSearch = () => {
    const start = dateRange.startDate ?? new Date("1900-01-01");
    const end = dateRange.endDate ?? new Date("2100-12-31");

    const filterFn = (item: { date: string }) => {
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    };

    setFilteredData(retailCashData.filter(filterFn));
  };

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Retail Cash Report" />

      <ReportFilterToolbar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: handleSearch,
          onClear: handleClear,
        }}
      />

      {/* Table */}
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(RetailCashReport);
