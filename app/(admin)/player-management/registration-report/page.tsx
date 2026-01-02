"use client";

import React, { useState } from "react";
import { GroupBase } from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import {
   defaultDateRange,
} from "@/components/common/DateRangeFilter";
import { columns } from "./columns";
import { registrations, Registration } from "./data";
import { withAuth } from "@/utils/withAuth";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";

// ----------------------
// Select Options
// ----------------------
const clientTypeOptions = [
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "retail", label: "Retail" },
];

type ClientTypeOption = { value: string; label: string };

// ----------------------
// Component
// ----------------------
function RegistrationReport() {
  const [selectedClientType, setSelectedClientType] = useState<ClientTypeOption[]>([]);
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

  const selectedTypes = selectedClientType.map((f) => f.value.toLowerCase());

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
      <TableFilterToolbar<ClientTypeOption, true, GroupBase<ClientTypeOption>>   
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: handleSearch,
          onClear: handleClear,
        }}
        selectProps={{
          containerClassName: "max-w-[20rem]",
          options: clientTypeOptions,
          placeholder: "Filter by Client Type",
          value: selectedClientType,
          onChange: (val) => setSelectedClientType(Array.isArray(val) ? [...val] : []),
          isMulti: true,
        }}
      />  

      {/* Data Table */}
      <DataTable columns={columns} data={filteredData} />
    </section>
  );
}

export default withAuth(RegistrationReport);
