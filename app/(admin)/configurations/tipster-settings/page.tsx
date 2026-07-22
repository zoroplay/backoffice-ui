"use client";

import { useMemo, useState } from "react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { withAuth } from "@/utils/withAuth";

type TipsterSetting = {
  id: string;
  minAmount: string;
  maxAmount: string;
  rebetCount: string;
};

const initialSettings: TipsterSetting[] = [
  { id: "tipster-1", minAmount: "0.00", maxAmount: "5000.00", rebetCount: "1" },
  { id: "tipster-2", minAmount: "5000.01", maxAmount: "50000.00", rebetCount: "2" },
  { id: "tipster-3", minAmount: "50000.01", maxAmount: "250000.00", rebetCount: "3" },
];

function TipsterSettingsPage() {
  const [settings, setSettings] = useState<TipsterSetting[]>(initialSettings);

  const highestAllowedRebets = useMemo(
    () => Math.max(...settings.map((item) => Number(item.rebetCount) || 0), 0),
    [settings],
  );

  function addRow() {
    setSettings((current) => [
      ...current,
      {
        id: `tipster-${Date.now()}`,
        minAmount: "0.00",
        maxAmount: "0.00",
        rebetCount: "0",
      },
    ]);
  }

  function removeRow(id: string) {
    setSettings((current) => current.filter((item) => item.id !== id));
  }

  function updateRow(id: string, key: keyof Omit<TipsterSetting, "id">, value: string) {
    setSettings((current) =>
      current.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Tipsters Settings" />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tipsters Settings
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              Configure stake amount bands and the number of allowed rebets for tipster-generated tickets. The dynamic add/remove row workflow and save contract mirror the Nuxt settings page.
            </p>
          </div>
          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
            <div>Load: <span className="font-mono">GET /admin/settings/tipsters</span></div>
            <div className="mt-1">Save: <span className="font-mono">POST /admin/settings/tipsters</span></div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Bands</p>
          <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{settings.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Highest Rebet Count</p>
          <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{highestAllowedRebets}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Validation</p>
          <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">Range Bands</p>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Settings</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Nuxt saved the full <span className="font-mono">items</span> array and allowed operators to add or remove amount bands inline.
            </p>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="rounded-md border border-success-300 px-4 py-2 text-sm font-medium text-success-700 hover:bg-success-50 dark:border-success-500/30 dark:text-success-300 dark:hover:bg-success-500/10"
          >
            Add More
          </button>
        </div>

        <form className="p-5">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  {["Min. Amount", "Max. Amount", "No of allowed Rebet", "Action"].map((head) => (
                    <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                {settings.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <input
                        value={item.minAmount}
                        onChange={(event) => updateRow(item.id, "minAmount", event.target.value)}
                        className="h-10 w-36 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                        inputMode="decimal"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={item.maxAmount}
                        onChange={(event) => updateRow(item.id, "maxAmount", event.target.value)}
                        className="h-10 w-36 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                        inputMode="decimal"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={item.rebetCount}
                        onChange={(event) => updateRow(item.id, "rebetCount", event.target.value)}
                        className="h-10 w-24 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                        inputMode="numeric"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => removeRow(item.id)}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              className="rounded-md bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Submit
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default withAuth(TipsterSettingsPage);
