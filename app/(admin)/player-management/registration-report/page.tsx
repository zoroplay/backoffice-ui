"use client";

import React, { useState } from "react";
import Select from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { FilterActions } from "@/components/common/FilterActions";
import type { Range } from "react-date-range";
import {
  DateRangeFilter,
  defaultDateRange,
} from "@/components/common/DateRangeFilter";
import { columns } from "./columns";
import { registrations, Registration } from "./data";
import { withAuth } from "@/utils/withAuth";

// ----------------------
// Select Options
// ----------------------
const clientTypeOptions = [
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "retail", label: "Retail" },
];

// ----------------------
// Component
// ----------------------
function RegistrationReport() {
  const [selectedClientType, setSelectedClientType] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [filteredData, setFilteredData] = useState<Registration[]>(registrations);

  // ----------------------
  // Clear filters
  // ----------------------
  const handleClear = () => {
    setDateRange(defaultDateRange);
    setSelectedClientType([]);
    setFilteredData(registrations);
  };

  // ----------------------
  // Apply filters
  // ----------------------
 const handleSearch = () => {
  const start = dateRange.startDate ?? new Date("1900-01-01");
  const end = dateRange.endDate ?? new Date("2100-12-31");

  const selectedTypes = Array.isArray(selectedClientType)
    ? selectedClientType.map((f) => f.value.toLowerCase())
    : [];

  const filtered = registrations.filter((item) => {
    const regDate = new Date(item.registered.replace(/-/g, "/"));
    const inRange = regDate >= start && regDate <= end;

    const typeMatch =
      selectedTypes.length === 0 ||
      selectedTypes.includes(item.clientType.toLowerCase());

    return inRange && typeMatch;
  });

  setFilteredData(filtered);
};


  return (
    <section className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Registration Report" />

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Client Type Multi-Select */}
          <div className="w-[20rem]">
            <Select
              className="dark:text-black"
              options={clientTypeOptions}
              placeholder="Filter by Client Type"
              isMulti
              value={selectedClientType}
              onChange={(val) => setSelectedClientType(val as any[])}
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

      {/* Data Table */}
      <DataTable columns={columns} data={filteredData} />
    </section>
  );
}

export default withAuth(RegistrationReport);
