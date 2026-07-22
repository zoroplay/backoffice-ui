import type { ReactNode } from "react";
import Link from "next/link";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

type Metric = {
  label: string;
  value: string;
  detail?: string;
};

type Column = {
  label: string;
  key: string;
  align?: "left" | "right" | "center";
};

type Row = Record<string, ReactNode>;

export function BankingPageShell({
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
          <Link
            href="/banking/cashflow"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
          >
            Open Cashflow Manager
          </Link>
        </div>
      </section>
      {children}
    </div>
  );
}

export function BankingMetrics({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {metric.label}
          </p>
          <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">
            {metric.value}
          </p>
          {metric.detail ? (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {metric.detail}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function BankingFilters({
  branches = true,
  statuses = true,
}: {
  branches?: boolean;
  statuses?: boolean;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {branches ? (
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Branch
            </span>
            <select className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option>All branches</option>
              <option>Lagos Main Branch</option>
              <option>Abuja Branch</option>
              <option>Port Harcourt Branch</option>
              <option>Kano Branch</option>
            </select>
          </label>
        ) : null}
        {statuses ? (
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </span>
            <select className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option>All statuses</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Closed</option>
            </select>
          </label>
        ) : null}
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            From
          </span>
          <input
            defaultValue="2025-11-01"
            className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            To
          </span>
          <input
            defaultValue="2025-11-04"
            className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </label>
        <div className="flex items-end gap-2">
          <button className="h-10 rounded-md bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600">
            Search
          </button>
          <button className="h-10 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900">
            Export
          </button>
        </div>
      </div>
    </section>
  );
}

export function BankingSection({
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
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function BankingTable({
  columns,
  rows,
}: {
  columns: Column[];
  rows: Row[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 ${
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                      ? "text-center"
                      : "text-left"
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${
                    column.align === "right"
                      ? "text-right"
                      : column.align === "center"
                        ? "text-center"
                        : "text-left"
                  }`}
                >
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

export function BankingBadge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger";
  children: ReactNode;
}) {
  const tones = {
    neutral:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    success:
      "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300",
    warning:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    danger: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export const money = (value: number) => `NGN ${value.toLocaleString()}`;

export function statusTone(status: string): "success" | "warning" | "danger" | "neutral" {
  if (status === "Approved" || status === "Closed" || status === "Open") return "success";
  if (status === "Rejected") return "danger";
  if (status === "Pending") return "warning";
  return "neutral";
}
