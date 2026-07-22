"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Search, X } from "lucide-react";

import { ReportPageShell } from "../components/ReportPageShell";
import { POSTREQUEST } from "@/utils/base_request";

type ProductType = "" | "Sports" | "Casino" | "Virtual";

type FilterState = {
  month: string;
  year: string;
  product_type: ProductType;
};

type TaxSummary = {
  month: string;
  year: string;
  turnover: number;
};

type TaxResult = {
  id: string;
  date: string;
  turnover: number;
};

const monthOptions = [
  { number: "01", name: "January" },
  { number: "02", name: "February" },
  { number: "03", name: "March" },
  { number: "04", name: "April" },
  { number: "05", name: "May" },
  { number: "06", name: "June" },
  { number: "07", name: "July" },
  { number: "08", name: "August" },
  { number: "09", name: "September" },
  { number: "10", name: "October" },
  { number: "11", name: "November" },
  { number: "12", name: "December" },
];

function defaultFilters(): FilterState {
  const today = new Date();
  return {
    month: String(today.getMonth() + 1).padStart(2, "0"),
    year: String(today.getFullYear()),
    product_type: "",
  };
}

function yearOptions() {
  const current = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, index) => String(current - index));
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function money(value: number) {
  return `NGN ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function displayMonth(month: string) {
  const match = monthOptions.find((option) => option.number === String(month).padStart(2, "0"));
  return match ? match.name.slice(0, 3) : month || "-";
}

function mapSummary(value: unknown): TaxSummary | null {
  const summary = asRecord(value);
  if (!Object.keys(summary).length) return null;

  return {
    month: String(summary.month ?? ""),
    year: String(summary.year ?? ""),
    turnover: toNumber(summary.turnover),
  };
}

function mapResult(value: unknown, index: number): TaxResult {
  const item = asRecord(value);
  return {
    id: String(item.id ?? item.date ?? `turnover-${index}`),
    date: String(item.date ?? "-"),
    turnover: toNumber(item.turnover),
  };
}

export default function TaxOnTurnoverReportPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [paging, setPaging] = useState(true);
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [results, setResults] = useState<TaxResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    const response = await POSTREQUEST<any>(
      "/api/admin/reporting/get-tax-on-turnover-report",
      filters
    );
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const mappedSummary = mapSummary(body.summary);
    const mappedResults = Array.isArray(body.results) ? body.results.map(mapResult) : [];
    setSummary(mappedSummary);
    setResults(mappedResults);
  }

  function resetFilter() {
    setFilters(defaultFilters());
    setPaging(true);
    setSummary(null);
    setResults([]);
  }

  return (
    <ReportPageShell
      title="Tax On Turnover Report"
      description="Calculate tax-on-turnover figures by month, year, and product using the same report contract as the Nuxt back office."
    >
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void search();
          }}
        >
          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={filters.month}
              onChange={(event) =>
                setFilters((current) => ({ ...current, month: event.target.value }))
              }
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {monthOptions.map((month) => (
                <option key={month.number} value={month.number}>
                  {month.name}
                </option>
              ))}
            </select>
            <select
              value={filters.year}
              onChange={(event) =>
                setFilters((current) => ({ ...current, year: event.target.value }))
              }
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {yearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={filters.product_type}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  product_type: event.target.value as ProductType,
                }))
              }
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Product</option>
              <option value="Sports">Sports</option>
              <option value="Casino">Casino</option>
              <option value="Casino">Games</option>
              <option value="Virtual">Virtual Sports</option>
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={paging}
                onChange={(event) => setPaging(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-500"
              />
              Enable Paging
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-info-500 px-4 text-sm font-medium text-white hover:bg-info-600 disabled:opacity-60"
            >
              <Search size={16} />
              {loading ? "Searching" : "Search"}
            </button>
            <button
              type="button"
              onClick={resetFilter}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-medium dark:border-gray-700"
            >
              <X size={16} />
              Clear all filters
            </button>
          </div>

          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
            POST /api/admin/reporting/get-tax-on-turnover-report with month,
            year, and product_type.
          </div>
        </form>
      </section>

      <ReportTableSection title="Summary" loading={loading} empty={!summary} colSpan={5}>
        {summary ? (
          <tr>
            <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
              {displayMonth(summary.month)} {summary.year}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700 dark:text-gray-300">
              {money(summary.turnover)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700 dark:text-gray-300">
              {money(summary.turnover)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700 dark:text-gray-300">
              NGN 0.00
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700 dark:text-gray-300">
              0%
            </td>
          </tr>
        ) : null}
      </ReportTableSection>

      <ReportTableSection title="Results" loading={loading} empty={!results.length} colSpan={5}>
        {results.map((result) => (
          <tr key={result.id}>
            <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
              <a href="#" onClick={(event) => event.preventDefault()}>
                {result.date}
              </a>
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700 dark:text-gray-300">
              {money(result.turnover)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700 dark:text-gray-300">
              {money(result.turnover)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700 dark:text-gray-300">
              NGN 0.00
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700 dark:text-gray-300">
              0%
            </td>
          </tr>
        ))}
      </ReportTableSection>
    </ReportPageShell>
  );
}

function ReportTableSection({
  title,
  loading,
  empty,
  colSpan,
  children,
}: {
  title: string;
  loading: boolean;
  empty: boolean;
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <span className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:text-gray-300">
          Excel export
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {[
                "Month",
                "Return Before Tax",
                "Return After Tax",
                "Tax Amount",
                "Tax %",
              ].map((head, index) => (
                <th
                  key={head}
                  className={`whitespace-nowrap px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 ${
                    index === 0 ? "text-left" : "text-right"
                  }`}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {children}
            {empty ? (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {loading ? "Loading report" : "No record found"}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
