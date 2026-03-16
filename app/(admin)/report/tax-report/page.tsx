// page.tsx
"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import type { TaxDetail, TaxSummary } from "./data";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { summaryColumns, detailColumns } from "./columns";
import { withAuth } from "@/utils/withAuth";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import type { SingleValue } from "react-select";
import { Infotext } from "@/components/common/Info";
import { betsApi } from "@/lib/api/modules/bets";
import { normalizeApiError } from "@/lib/api";



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
  const [summaryData, setSummaryData] = useState<TaxSummary[]>([]);
  const [filteredData, setFilteredData] = useState<TaxDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fmt = (d?: Date, endOfDay = false) => {
    if (!d) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy} ${endOfDay ? "23:59:59" : "00:00:00"}`;
  };

  const toNumber = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const toTaxDetail = (row: Record<string, unknown>): TaxDetail => ({
    customer: String(row.customer ?? row.username ?? row.user ?? ""),
    betslipId: String(row.betslipId ?? row.betslip_id ?? row.ticketId ?? ""),
    punterAmt: toNumber(row.punterAmt ?? row.punterAmount),
    stakeAmt: toNumber(row.stakeAmt ?? row.stakeAmount),
    exciseAmt: toNumber(row.exciseAmt ?? row.exciseAmount),
    odds: toNumber(row.odds),
    type: String(row.type ?? row.clientType ?? row.channel ?? ""),
    date: String(row.date ?? row.createdAt ?? ""),
    potentialWinnings: toNumber(row.potentialWinnings ?? row.potentialWin),
    wthTax: toNumber(row.wthTax ?? row.withholdingTax),
  });

  const toTaxSummary = (row: Record<string, unknown>): TaxSummary => ({
    period: String(row.period ?? row.label ?? "Selected Range"),
    beforeTax: toNumber(row.beforeTax ?? row.returnBeforeTax),
    afterTax: toNumber(row.afterTax ?? row.returnAfterTax),
    taxOnStake: toNumber(row.taxOnStake ?? row.stakeTax),
    taxOnWinnings: toNumber(row.taxOnWinnings ?? row.winningsTax),
  });

  const summarizeFromDetails = (details: TaxDetail[]): TaxSummary[] => {
    if (details.length === 0) return [];

    const beforeTax = details.reduce((sum, row) => sum + row.potentialWinnings, 0);
    const afterTax = details.reduce((sum, row) => sum + row.wthTax, 0);
    const taxOnStake = details.reduce((sum, row) => sum + row.exciseAmt, 0);
    const taxOnWinnings = Math.max(0, beforeTax - afterTax);

    return [
      {
        period: "Selected Range",
        beforeTax,
        afterTax,
        taxOnStake,
        taxOnWinnings,
      },
    ];
  };

  const applyFilters = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        from: fmt(dateRange.startDate ?? undefined, false),
        to: fmt(dateRange.endDate ?? undefined, true),
        clientType: clientType?.value ?? "",
      } as const;

      const res = await betsApi.getTaxReport(payload, 1);
      const root = (res as { data?: unknown })?.data ?? res;

      const detailSource =
        (Array.isArray(root) && root) ||
        ((root as { data?: unknown })?.data as unknown[]) ||
        ((root as { details?: unknown })?.details as unknown[]) ||
        ((root as { results?: unknown })?.results as unknown[]) ||
        [];

      const summarySource =
        (Array.isArray((root as { summary?: unknown })?.summary)
          ? ((root as { summary?: unknown[] }).summary ?? [])
          : []) || [];

      const nextDetails = Array.isArray(detailSource)
        ? detailSource.map((row) =>
            toTaxDetail((row as Record<string, unknown>) ?? {})
          )
        : [];
      const nextSummary = Array.isArray(summarySource)
        ? summarySource.map((row) =>
            toTaxSummary((row as Record<string, unknown>) ?? {})
          )
        : [];

      setFilteredData(nextDetails);
      setSummaryData(
        nextSummary.length > 0 ? nextSummary : summarizeFromDetails(nextDetails)
      );
    } catch (err) {
      const apiErr = normalizeApiError(err);
      setError(apiErr.message ?? "Failed to fetch tax report");
      setFilteredData([]);
      setSummaryData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setClientType(null);
    setDateRange(defaultDateRange);
    setFilteredData([]);
    setSummaryData([]);
    setError(null);
  };

  return (
    <section className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Tax Report" />
      <Infotext text="Use the filters below to narrow down the results." />

      <TableFilterToolbar<ClientTypeOption>
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        isLoading={isLoading}
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
        <DataTable columns={summaryColumns} data={summaryData} />
      </div>

      {/* Detailed Table */}
      <div>
        <h2 className="text-lg font-semibold dark:text-gray-50 mb-2">Results</h2>
        {isLoading ? (
          <div className="flex justify-center py-8 text-gray-500">Loading...</div>
        ) : (
          <>
            {error && (
              <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <DataTable columns={detailColumns} data={filteredData} />
          </>
        )}
      </div>
    </section>
  );
}

export default withAuth(TaxReport);
