"use client";

import React, { useState } from "react";
import type { GroupBase } from "react-select";
import makeAnimated from "react-select/animated";
import type { Range } from "react-date-range";
import type { MultiValue } from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { summaryColumns, groupColumns } from "./columns";
import {
  netCashSummaryData,
  netCashGroupData,
  NetCashSummary,
  NetCashGroup,
} from "./data";
import { withAuth } from "@/utils/withAuth";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";

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

const filterOptionGroupMap = filterOptions.reduce<Map<string, string>>(
  (map, group) => {
    group.options.forEach((option) => {
      map.set(option.value, group.label);
    });
    return map;
  },
  new Map()
);

type FilterSelection = { value: string; label: string };

function NetCashReport() {
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [selectedFilters, setSelectedFilters] = useState<FilterSelection[]>([]);

  const handleFilterChange = (value: MultiValue<FilterSelection>) => {
    const latestSelections = new Map<string, FilterSelection>();

    value.forEach((option) => {
      const groupKey = filterOptionGroupMap.get(option.value) ?? option.value;
      latestSelections.set(groupKey, option);
    });

    const uniqueSelections: FilterSelection[] = [];
    const seenGroups = new Set<string>();

    value.forEach((option) => {
      const groupKey = filterOptionGroupMap.get(option.value) ?? option.value;
      if (seenGroups.has(groupKey)) {
        return;
      }

      const latestOption = latestSelections.get(groupKey);
      if (latestOption?.value === option.value) {
        uniqueSelections.push(option);
        seenGroups.add(groupKey);
      }
    });

    setSelectedFilters(uniqueSelections);
  };

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
        [
          "paystack",
          "internal transfer",
          "bank transfer",
        ].includes(f.value)
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
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Net Cash Report" />

      {/* Filters */}
      <TableFilterToolbar<FilterSelection, true, GroupBase<FilterSelection>>
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: handleSearch,
          onClear: handleClear,
        }}
        selectProps={{
          containerClassName: "w-[22rem]",
          options: filterOptions,
          components: animatedComponents,
          isMulti: true,
          placeholder: "Filter by Payment or Client Type",
          value: selectedFilters,
          onChange: (val: MultiValue<FilterSelection>) => handleFilterChange(val),
        }}
      />

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
