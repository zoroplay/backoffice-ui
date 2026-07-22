import Link from "next/link";
import type { ReactNode } from "react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

type Action = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

type Metric = {
  label: string;
  value: string;
  detail?: string;
};

type FilterField = {
  label: string;
  value?: string;
  placeholder?: string;
  options?: string[];
};

type TableColumn = {
  label: string;
  key: string;
  align?: "left" | "right" | "center";
};

type TableRow = Record<string, ReactNode>;

export function CasinoRouteShell({
  title,
  description,
  actions = [],
  children,
}: {
  title: string;
  description: string;
  actions?: Action[];
  children: ReactNode;
}) {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle={title} />

      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        {actions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={
                  action.variant === "secondary"
                    ? "inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
                    : "inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
                }
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {children}
    </div>
  );
}

export function CasinoMetrics({ metrics }: { metrics: Metric[] }) {
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

export function CasinoFilterPanel({ fields }: { fields: FilterField[] }) {
  return (
    <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:grid-cols-2 xl:grid-cols-4">
      {fields.map((field) => (
        <label key={field.label} className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {field.label}
          </span>
          {field.options ? (
            <select
              defaultValue={field.value ?? ""}
              className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">{field.placeholder ?? "All"}</option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              defaultValue={field.value ?? ""}
              placeholder={field.placeholder}
              className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          )}
        </label>
      ))}
      <div className="flex items-end gap-2">
        <button className="h-10 rounded-md bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600">
          Search
        </button>
        <button className="h-10 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900">
          Clear
        </button>
      </div>
    </div>
  );
}

export function CasinoSection({
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

export function CasinoTable({
  columns,
  rows,
  emptyLabel = "No data available",
}: {
  columns: TableColumn[];
  rows: TableRow[];
  emptyLabel?: string;
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
          {rows.length > 0 ? (
            rows.map((row, index) => (
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
            ))
          ) : (
            <tr>
              <td
                className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                colSpan={columns.length}
              >
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function CasinoStatusBadge({
  active,
  label,
}: {
  active: boolean;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {label ?? (active ? "Active" : "Inactive")}
    </span>
  );
}

export function CasinoFormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

export function CasinoField({
  label,
  value,
  options,
  type = "text",
}: {
  label: string;
  value?: string | number;
  options?: string[];
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      {options ? (
        <select
          defaultValue={value ?? ""}
          className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          defaultValue={value}
          className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      )}
    </label>
  );
}
