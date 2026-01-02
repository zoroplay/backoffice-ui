// page.tsx
"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import type { TaxDetail } from "./data";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { summaryColumns, detailColumns } from "./columns";
import { taxSummary, taxDetails } from "./data";
import { withAuth } from "@/utils/withAuth";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import type { SingleValue } from "react-select";
import { Infotext } from "@/components/common/Info";



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

type ClientTypeOption = { value: string; label: string };

function TaxReport() {
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
      <Infotext text="Use the filters below to narrow down the results." />

      <TableFilterToolbar<ClientTypeOption>
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: applyFilters,
          onClear: clearFilters,
        }}
        selectProps={{
          containerClassName: "max-w-[22rem]",
          options: clientTypeOptions,
          placeholder: "Filter by Client Type",
          value: clientType,
          onChange: (selected: SingleValue<ClientTypeOption>) =>
            setClientType(selected ?? null),
          isClearable: true,
        }}
      />


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
