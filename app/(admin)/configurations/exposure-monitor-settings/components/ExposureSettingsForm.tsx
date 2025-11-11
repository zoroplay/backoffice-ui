'use client';

import React, { useMemo, useState } from "react";
import Select, {
  type GroupBase,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import { AlertTriangle, Bell, GaugeCircle, RefreshCcw } from "lucide-react";

import Button from "@/components/ui/button/Button";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { reactSelectStyles } from "@/utils/reactSelectStyles";

import {
  defaultExposureSettings,
  displayMetricOptions,
  refreshIntervalOptions,
} from "../data";
import type {
  ExposureMonitorSettings,
  SelectOption,
} from "../types";

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

type ExposureSettingsFormProps = {
  initialValues?: ExposureMonitorSettings;
  onSubmit?: (values: ExposureMonitorSettings) => void;
};

export function ExposureSettingsForm({
  initialValues = defaultExposureSettings,
  onSubmit,
}: ExposureSettingsFormProps) {
  const { theme } = useTheme();
  const normalizedTheme =
    theme === "light" || theme === "dark" ? theme : undefined;

  const selectStyles = useMemo<
    StylesConfig<SelectOption, false, GroupBase<SelectOption>>
  >(
    () =>
      reactSelectStyles<SelectOption, false, GroupBase<SelectOption>>(
        normalizedTheme
      ),
    [normalizedTheme]
  );

  const [settings, setSettings] = useState<ExposureMonitorSettings>(
    initialValues
  );
  const [isSaving, setIsSaving] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleChange = (
    field: keyof ExposureMonitorSettings,
    value: string | ExposureMonitorSettings[keyof ExposureMonitorSettings]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDisplayChange = (option: SingleValue<SelectOption>) => {
    handleChange("displayMetric", (option?.value ?? "stake") as typeof settings.displayMetric);
  };

  const handleRefreshChange = (option: SingleValue<SelectOption>) => {
    handleChange("refreshInterval", (option?.value ?? "manual") as typeof settings.refreshInterval);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setResultMessage(null);

    window.setTimeout(() => {
      setIsSaving(false);
      setResultMessage("Exposure monitor settings saved.");
      onSubmit?.(settings);
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Exposure Monitor Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Surface risky tickets early and keep the trading desk informed with automated notifications.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Display tickets with
          </label>
          <Select<SelectOption, false>
            options={displayMetricOptions}
            value={displayMetricOptions.find((opt) => opt.value === settings.displayMetric) ?? displayMetricOptions[0]}
            onChange={handleDisplayChange}
            styles={selectStyles}
            placeholder="Select metric"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Choose the exposure signal that prioritises the most critical tickets.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Amount threshold
          </label>
          <div className="flex gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <GaugeCircle className="h-4 w-4" />
            </div>
            <input
              className={cn(inputClassName, "flex-1")}
              value={settings.amountThreshold}
              onChange={(event) => handleChange("amountThreshold", event.target.value)}
              placeholder=">= 1000000"
              type="number"
              min={0}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tickets at or above this amount appear in the monitor list.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Send notification to
          </label>
          <div className="flex gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <Bell className="h-4 w-4" />
            </div>
            <textarea
              className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              value={settings.notifyEmails}
              onChange={(event) => handleChange("notifyEmails", event.target.value)}
              placeholder="risk-team@example.com"
              rows={2}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Separate multiple email addresses with a comma.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            When completion percentage is
          </label>
          <div className="flex gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <input
              className={cn(inputClassName, "flex-1")}
              value={settings.completionPercentage}
              onChange={(event) => handleChange("completionPercentage", event.target.value)}
              placeholder="85"
              type="number"
              min={0}
              max={100}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Triggers early warning notifications when risk crosses defined thresholds.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Max tickets per page
          </label>
          <input
            className={inputClassName}
            value={settings.maxTicketsPerPage}
            onChange={(event) => handleChange("maxTicketsPerPage", event.target.value)}
            type="number"
            min={1}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Helps analysts scan exposure without paging excessively.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Refresh list every
          </label>
          <Select<SelectOption, false>
            options={refreshIntervalOptions}
            value={refreshIntervalOptions.find((opt) => opt.value === settings.refreshInterval) ?? refreshIntervalOptions[0]}
            onChange={handleRefreshChange}
            styles={selectStyles}
            placeholder="Select interval"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Determine how frequently the monitor fetches new tickets.
          </p>
        </div>
      </div>

      {resultMessage ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {resultMessage}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Changes apply to the live exposure monitor once saved.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSettings(initialValues)}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSaving} startIcon={<RefreshCcw className="h-4 w-4" />}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default ExposureSettingsForm;
