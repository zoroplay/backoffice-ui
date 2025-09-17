// page.tsx
"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { columns } from "./columns";
import { retailCashData } from "./data";
import { withAuth } from "@/utils/withAuth";

function RetailCashReport() {
  const [dateRange, setDateRange] = useState<any>(null);

  return (
    <div className="space-y-6 p-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <DateRangeFilter
          onChange={(range) => {
            setDateRange(range);
            console.log("Selected Range:", range);
          }}
        />
      </div>

      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Retail Cash Report" />

      {/* Table */}
      <DataTable columns={columns} data={retailCashData} />
    </div>
  );
}

export default withAuth(RetailCashReport);
