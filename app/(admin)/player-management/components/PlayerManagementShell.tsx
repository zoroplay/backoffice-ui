import type { ReactNode } from "react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

type Metric = { label: string; value: string; detail?: string };
type Column = { label: string; key: string; align?: "left" | "right" | "center" };
type Row = Record<string, ReactNode>;

export function PlayerManagementShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle={title} />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">{description}</p>
      </section>
      {children}
    </div>
  );
}

export function PlayerMetrics({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{metric.label}</p>
          <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{metric.value}</p>
          {metric.detail ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{metric.detail}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function PlayerFilters() {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <input placeholder="Username, phone, or player ID" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
        <input defaultValue="2026-07-01" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
        <input defaultValue="2026-07-22" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
        <button className="h-10 rounded-md bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600">Search</button>
      </div>
    </section>
  );
}

export function PlayerSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PlayerTable({ columns, rows }: { columns: Column[]; rows: Row[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"}`}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"}`}>
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PlayerBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "info" }) {
  const tones = {
    neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    success: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    danger: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export const naira = (value: number) => `NGN ${value.toLocaleString()}`;
