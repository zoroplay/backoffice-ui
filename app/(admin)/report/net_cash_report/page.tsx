"use client";

import React, { useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import type { Range } from "react-date-range";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { summaryColumns, groupColumns } from "./columns";
import {
  netCashSummaryData,
  netCashGroupData,
  NetCashSummary,
  NetCashGroup,
} from "./data";
import { withAuth } from "@/utils/withAuth";

// ----------------------
// Filter Options
// ----------------------
const filterOptions = [
  {
    label: "Payment",
    options: [
      { value: "paystack", label: "Paystack" },
      { value: "internal transfer", label: "Internal Transfer" },
      { value: "bank transfer", label: "Bank Transfer" },
    ],
  },
  {
    label: "Client Type",
    options: [
      { value: "website", label: "Website" },
      { value: "mobile", label: "Mobile" },
      { value: "cashier", label: "Cashier" },
    ],
  },
];

const animatedComponents = makeAnimated();

// Default wide date range
const defaultDateRange: Range = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

function NetCashReport() {
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [selectedFilters, setSelectedFilters] = useState<any[]>([]);

  // state for filtered data
  const [filteredSummary, setFilteredSummary] =
    useState<NetCashSummary[]>(netCashSummaryData);
  const [filteredGroups, setFilteredGroups] =
    useState<NetCashGroup[]>(netCashGroupData);

  // ----------------------
  // Clear filters
  // ----------------------
  const handleClear = () => {
    setDateRange(defaultDateRange);
    setSelectedFilters([]);
    setFilteredSummary(netCashSummaryData);
    setFilteredGroups(netCashGroupData);
  };

  // ----------------------
  // Apply filters
  // ----------------------
  const handleSearch = () => {
    const start = dateRange.startDate ?? new Date("1900-01-01");
    const end = dateRange.endDate ?? new Date("2100-12-31");

    const selectedPayments = selectedFilters
      .filter((f) =>
        ["paystack", "internal transfer", "bank transfer"].includes(f.value)
      )
      .map((f) => f.value.toLowerCase());

    const selectedClients = selectedFilters
      .filter((f) => ["website", "mobile", "cashier"].includes(f.value))
      .map((f) => f.value.toLowerCase());

    const filterFn = (item: {
      date: string;
      paymentMethod?: string;
      clientType?: string;
    }) => {
      const itemDate = new Date(item.date);
      const matchesDate = itemDate >= start && itemDate <= end;

      const matchesPayment =
        selectedPayments.length === 0 ||
        (item.paymentMethod &&
          selectedPayments.includes(item.paymentMethod.toLowerCase()));

      const matchesClient =
        selectedClients.length === 0 ||
        (item.clientType &&
          selectedClients.includes(item.clientType.toLowerCase()));

      return matchesDate && matchesPayment && matchesClient;
    };

    setFilteredSummary(netCashSummaryData.filter(filterFn));
    setFilteredGroups(netCashGroupData.filter(filterFn));
  };

  return (
    <section className="space-y-6 p-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Date Range */}
          <DateRangeFilter
            range={dateRange}
            onChange={(range) => setDateRange(range)}
          />


          {/* Combined Select */}
          <div className="w-[20rem]">
            <Select
              options={filterOptions}
              components={animatedComponents}
              isMulti
              placeholder="Filter by Payment / Client Type"
              value={selectedFilters}
              onChange={(val) => {setSelectedFilters(val as any[])
                console.log(selectedFilters)
              }}
            />
          </div>
        </div>

        {/* Search & Clear */}
        <FilterActions onSearch={handleSearch} onClear={handleClear} />
      </div>

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Net Cash Report" />

      {/* First Table */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Total Net Cash</h2>
        <DataTable columns={summaryColumns} data={filteredSummary} />
      </div>

      {/* Second Table */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Results</h2>
        <DataTable columns={groupColumns} data={filteredGroups} />
      </div>
    </section>
  );
}

export default withAuth(NetCashReport);
