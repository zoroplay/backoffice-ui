import { ChartLine, ShieldAlert, TimerReset } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { DataTable } from "@/components/tables/DataTable";

import ExposureSettingsForm from "./components/ExposureSettingsForm";
import { activityTimeline, defaultExposureSettings } from "./data";

type ActivityTimeline = {
  id: string;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
};

const exposureHighlights = [
  {
    id: "highlight-1",
    title: "High value tickets",
    metric: "≥ ₦1,000,000",
    helper: "Current threshold",
    accent: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200",
    icon: ShieldAlert,
  },
  {
    id: "highlight-2",
    title: "Refresh cadence",
    metric: "30 seconds",
    helper: "Auto updates",
    accent: "bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-200",
    icon: TimerReset,
  },
  {
    id: "highlight-3",
    title: "Analyst bandwidth",
    metric: "50 tickets",
    helper: "Per page",
    accent: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200",
    icon: ChartLine,
  },
];

const activityColumns: ColumnDef<ActivityTimeline>[] = [
  {
    accessorKey: "title",
    header: "Update",
  },
  {
    accessorKey: "description",
    header: "Summary",
  },
  {
    accessorKey: "actor",
    header: "By",
  },
  {
    accessorKey: "timestamp",
    header: "When",
  },
];

export default function ExposureMonitorSettingsPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Configurations · Exposure Monitor" />

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Exposure Monitor
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure the guardrails that keep trading ahead of risky tickets. Tailor refresh cadence, notification rules, and high-value triggers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="light" color="success" size="sm">
              Monitor live
            </Badge>
            <Badge variant="light" color="info" size="sm">
              Updated this week
            </Badge>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {exposureHighlights.map((highlight) => {
            const Icon = highlight.icon;
            return (
              <div
                key={highlight.id}
                className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-gray-50/70 p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900/40"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${highlight.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {highlight.helper}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {highlight.title}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {highlight.metric}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),minmax(0,0.55fr)]">
        <ExposureSettingsForm initialValues={defaultExposureSettings} />

        <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Recent Activity
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track which teammates have made adjustments to the exposure thresholds.
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 dark:border-gray-800">
            <DataTable columns={activityColumns} data={activityTimeline} />
          </div>
        </section>
      </div>
    </div>
  );
}
