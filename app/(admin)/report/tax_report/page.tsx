// page.tsx
"use client";

import React, { useState } from "react";
import Select from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import makeAnimated from "react-select/animated";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import type { TaxDetail } from "./data";
import { FilterActions } from "@/components/common/FilterActions";
import { DateRangeFilter, defaultDateRange } from "@/components/common/DateRangeFilter";
import { summaryColumns, detailColumns } from "./columns";
import { taxSummary, taxDetails } from "./data";
import { withAuth } from "@/utils/withAuth";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";



// ----------------------
// Client Type Options
// ----------------------
const clientTypeOptions = [
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

type ClientTypeOption = { value: string; label: string };

function TaxReport() {
  const { theme } = useTheme();
  const [clientType, setClientType] = useState<
    ClientTypeOption | null
  >(null);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [filteredData, setFilteredData] = useState<TaxDetail[]>(taxDetails);

  const applyFilters = () => {
    const filtered = taxDetails.filter((row: TaxDetail) => {
      let match = true;

      if (clientType) {
        match = match && row.type.toLowerCase() === clientType.value.toLowerCase();
      }

      if (dateRange.startDate && dateRange.endDate) {
        const rowDate = new Date(row.date);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);

        rowDate.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        match = match && rowDate >= start && rowDate <= end;
      }

      return match;
    });

    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setClientType(null);
    setDateRange(defaultDateRange);
    setFilteredData(taxDetails);
  };

  return (
    <section className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Tax Report" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Filters */} 
        <div className="flex flex-wrap items-center gap-4">
          {/* Client Type */}
          <div className="w-[20rem]">
            <Select<ClientTypeOption, false>
              styles={reactSelectStyles(theme)}
              options={clientTypeOptions}
              components={animatedComponents}
              placeholder="Filter by Client Type"
              value={clientType}
              onChange={(selected) => setClientType(selected ?? null)}
              isClearable
            />
          </div>

          {/* Date Range Picker */}
          <DateRangeFilter range={dateRange} onChange={(range) => setDateRange(range)} />
        </div>

        {/* Search & Clear Actions */}
        <FilterActions onSearch={applyFilters} onClear={clearFilters} />          
      </div>

      {/* Summary Table */}
      <div>
        <h2 className="text-lg dark:text-gray-50 font-semibold mb-2">Summary</h2>
        <DataTable columns={summaryColumns} data={taxSummary} />
      </div>

      {/* Detailed Table */}
      <div>
        <h2 className="text-lg font-semibold dark:text-gray-50 mb-2">Results</h2>
        <DataTable columns={detailColumns} data={filteredData} />
      </div>
    </section>
  );
}

export default withAuth(TaxReport);
