// page.tsx
"use client";

import React, { useState } from "react";
import Select from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import makeAnimated from "react-select/animated";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { summaryColumns, detailColumns } from "./columns";
import { taxSummary, taxDetails } from "./data";
import { withAuth } from "@/utils/withAuth";

const defaultDateRange: Range = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

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
]
}]

const animatedComponents = makeAnimated();

function TaxReport() {
  const [clientType, setClientType] = useState<
    { value: string; label: string } | null
  >(null);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);

  return (
    <div className="space-y-6 p-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Client Type */}
        <div className="w-[20rem]">
            <Select
              options={clientTypeOptions}
              components={animatedComponents}
              isMulti
              placeholder="Filter by Client Type"
              value={clientType}
              onChange={(selected) => setClientType(selected as any[0])}
            />
          </div>

        {/* Date Range Picker */}
        <DateRangeFilter range={dateRange} onChange={(range) => setDateRange(range)} />
      </div>

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Tax Report" />

      {/* Summary Table */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        <DataTable columns={summaryColumns} data={taxSummary} />
      </div>

      {/* Detailed Table */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Results</h2>
        <DataTable columns={detailColumns} data={taxDetails} />
      </div>
    </div>
  );
}

export default withAuth(TaxReport);
