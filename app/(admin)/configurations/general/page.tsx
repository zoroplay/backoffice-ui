import { CalendarCog, Globe2, Layers } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { DataTable } from "@/components/tables/DataTable";

import {
  defaultGeneralSettings,
  generalSettingsSummary,
} from "./data";
import GeneralSettingsForm from "./components/GeneralSettingsForm";

type RecentChange = {
  key: string;
  item: string;
  previous: string;
  updated: string;
  actor: string;
  date: string;
};

const recentChanges: RecentChange[] = [
  {
    key: "auto-disbursement",
    item: "Auto Disbursement",
    previous: "Disabled",
    updated: "Enabled",
    actor: "Chidi Arinze",
    date: "2024-10-02",
  },
  {
    key: "withdrawal-limit",
    item: "Maximum Withdrawal",
    previous: "₦750,000",
    updated: "₦1,000,000",
    actor: "Lucy Wang",
    date: "2024-09-28",
  },
  {
    key: "tax",
    item: "WTH Tax",
    previous: "6.0%",
    updated: "7.5%",
    actor: "Finance Bot",
    date: "2024-09-26",
  },
];

const recentChangesColumns: ColumnDef<RecentChange>[] = [
  {
    accessorKey: "item",
    header: "Setting",
  },
  {
    accessorKey: "previous",
    header: "Previous",
  },
  {
    accessorKey: "updated",
    header: "Updated",
  },
  {
    accessorKey: "actor",
    header: "Changed By",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
];

export default function GeneralConfigurationsPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Configurations · General" />

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              General Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Centralise brand assets, payment thresholds, and automation rules in one tidy control panel.
            </p>
          </div>         
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {generalSettingsSummary.map((card) => (
            <div
              key={card.title}
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-gray-50/70 p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900/40"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {card.metric}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {card.helper}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${card.accent}`}
                >
                  <Globe2 className="mr-1 h-3.5 w-3.5" />
                  Syncd
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <GeneralSettingsForm
        initialValues={JSON.parse(
          JSON.stringify(defaultGeneralSettings)
        )}
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr),minmax(0,0.6fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-brand-500" />
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Configuration Playbook
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Align related modules after updating foundation values.
              </p>
            </div>
          </div>

          {/* Configuration Playbook Section */} 
          <div className="mt-4 grid gap-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/40">
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                1. Payments & Finance
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Ensure withdrawal ceilings and commission rules reflect compliance updates.
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/40">
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                2. Player Experience
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Review lobby widgets, slider pacing, and booking codes to match promotions.
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/40">
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                3. Partners & Affiliates
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Share refreshed tax and commission policies with agency partners.
              </p>
            </div>
          </div>
        </div>

          {/* Recent Adjustments Section */}
        <div className="rounded-2xl border  bg-white p-6 shadow-sm dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <CalendarCog className="h-5 w-5 text-indigo-500" />
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Recent Adjustments
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track the latest edits to keep governance tidy.
              </p>
            </div> 
          </div>
          <div className="mt-4 overflow-hidden rounded-xl">
            <DataTable columns={recentChangesColumns} data={recentChanges} />
          </div>
        </div>
      </section>
    </div>
  );
}
