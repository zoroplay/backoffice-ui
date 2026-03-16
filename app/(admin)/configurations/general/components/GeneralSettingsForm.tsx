'use client';

import React, { useMemo, useState } from "react";
import Select, {
  type ActionMeta,
  type GroupBase,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import { CalendarDays, FileText, Info, ShieldCheck } from "lucide-react";

import Button from "@/components/ui/button/Button";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { reactSelectStyles } from "@/utils/reactSelectStyles";

import {
  booleanOptions,
  countryOptions,
  currencySymbols,
  dialCodes,
  paydayOptions,
  ticketStyleOptions,
} from "../data";
import type { GeneralSettings, SelectOption } from "../types";
import BooleanToggle from "./BooleanToggle";
import LogoUploader from "./LogoUploader";

type GeneralSettingsFormProps = {
  initialValues: GeneralSettings;
  onSubmit?: (values: GeneralSettings) => void;
};

type NumberFieldProps = {
  label: string;
  name: keyof GeneralSettings;
  value: string;
  onChange: (name: keyof GeneralSettings, value: string) => void;
  suffix?: string;
  prefix?: string;
  info?: string;
  min?: number;
  step?: number | string;
};

type RangeFieldProps = {
  label: string;
  from: string;
  to: string;
  onChange: (payload: { from: string; to: string }) => void;
  helper?: string;
};

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

function NumberField({
  label,
  name,
  value,
  onChange,
  prefix,
  suffix,
  info,
  min,
  step,
}: NumberFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {label}
        </label>
        {info ? (
          <span title={info}>
            <Info className="h-4 w-4 text-gray-400" />
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {prefix ? (
          <span className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {prefix}
          </span>
        ) : null}
        <input
          type="number"
          className={cn(inputClassName, prefix && "flex-1", suffix && "flex-1")}
          value={value ?? ""}
          min={min}
          step={step}
          onChange={(event) => onChange(name, event.target.value)}
        />
        {suffix ? (
          <span className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function RangeField({ label, from, to, onChange, helper }: RangeFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {label}
      </label>
      {helper ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helper}</p>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          className={inputClassName}
          value={from ?? ""}
          onChange={(event) => onChange({ from: event.target.value, to })}
        />
        <input
          type="number"
          className={inputClassName}
          value={to ?? ""}
          onChange={(event) => onChange({ from, to: event.target.value })}
        />
      </div>
    </div>
  );
}

export function GeneralSettingsForm({
  initialValues,
  onSubmit,
}: GeneralSettingsFormProps) {
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

  const [formValues, setFormValues] = useState<GeneralSettings>(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleChange = (
    field: keyof GeneralSettings,
    value: string | GeneralSettings["mainLogo"]
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBooleanChange = (field: keyof GeneralSettings) =>
    (value: GeneralSettings[typeof field]) => {
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleCountryChange = (
    option: SingleValue<SelectOption>,
    _meta: ActionMeta<SelectOption>
  ) => {
    const country = option?.value ?? "";
    setFormValues((prev) => ({
      ...prev,
      country,
      currencySymbol: currencySymbols[country] ?? prev.currencySymbol,
      dialCode: dialCodes[country] ?? prev.dialCode,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    window.setTimeout(() => {
      setIsSaving(false);
      setSaveMessage("Settings saved successfully.");
      onSubmit?.(formValues);
    }, 750);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Upload Section */} 
      <section className="grid gap-6 lg:grid-cols-[0.45fr,1fr]">
          <div className="space-y-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <LogoUploader
            label="Main Logo"
            description="Used across dashboards, receipts, and user touchpoints."
            value={formValues.mainLogo}
            onChange={(value) => handleChange("mainLogo", value)}
              showInitialPreview={false}
          />
          <LogoUploader
            label="Print Logo"
            description="Appears on printed slips and statements."
            value={formValues.printLogo}
            onChange={(value) => handleChange("printLogo", value)}
              showInitialPreview={false}
          />
        </div>

        <div className="grid gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Cash Flow Policies
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Configure transactional thresholds and automation limits for daily operations.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <NumberField
                label="Minimum Withdrawal"
                name="minimumWithdrawal"
                value={formValues.minimumWithdrawal}
                onChange={handleChange}
                prefix={formValues.currencySymbol}
                min={0}
              />
              <NumberField
                label="Minimum Deposit"
                name="minimumDeposit"
                value={formValues.minimumDeposit}
                onChange={handleChange}
                prefix={formValues.currencySymbol}
                min={0}
              />
              <NumberField
                label="Maximum Withdrawal"
                name="maximumWithdrawal"
                value={formValues.maximumWithdrawal}
                onChange={handleChange}
                prefix={formValues.currencySymbol}
                min={0}
              />
              <NumberField
                label="Max Upcoming Events Display"
                name="maxUpcomingEventsDisplay"
                value={formValues.maxUpcomingEventsDisplay}
                onChange={handleChange}
                min={0}
                info="Determines events shown on lobby widgets"
              />
              <RangeField
                label="Auto Disburse Between"
                from={formValues.autoDisburseRange.from}
                to={formValues.autoDisburseRange.to}
                onChange={({ from, to }) =>
                  setFormValues((prev) => ({
                    ...prev,
                    autoDisburseRange: { from, to },
                  }))
                }
                helper="Amounts eligible for automated wallet payouts"
              />
              <NumberField
                label="Auto Disbursements per User"
                name="autoDisbursementPerUserPerDay"
                value={formValues.autoDisbursementPerUserPerDay}
                onChange={handleChange}
                suffix="per day"
                min={0}
                info="Maximum number of auto-disbursements per user per day"
              />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <BooleanToggle
                label="Enable Auto-disbursement"
                value={formValues.enableAutoDisbursement}
                onChange={handleBooleanChange("enableAutoDisbursement")}
                
              />
              <BooleanToggle
                label="Allow Withdrawal Commission"
                value={formValues.allowWithdrawalCommission}
                onChange={handleBooleanChange("allowWithdrawalCommission")}
                
              />
              <BooleanToggle
                label="Allow Deposit Commission"
                value={formValues.allowDepositCommission}
                onChange={handleBooleanChange("allowDepositCommission")}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Platform Access & Compliance
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Control how customers engage and ensure the business meets regulatory requirements.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <BooleanToggle
                label="Allow Registration"
                value={formValues.allowRegistration}
                onChange={handleBooleanChange("allowRegistration")}
              />
              <BooleanToggle
                label="Enable Bank Account"
                value={formValues.enableBankAccount}
                onChange={handleBooleanChange("enableBankAccount")}
              />
              <BooleanToggle
                label="Enable Elbet User"
                value={formValues.enableElbetUser}
                onChange={handleBooleanChange("enableElbetUser")}
              />
              <BooleanToggle
                label="Enable Power Bonus"
                value={formValues.enablePowerBonus}
                onChange={handleBooleanChange("enablePowerBonus")}
              />
              <BooleanToggle
                label="Enable Web Affiliate"
                value={formValues.enableWebAffiliate}
                onChange={handleBooleanChange("enableWebAffiliate")}
              />
              <BooleanToggle
                label="Enable Tax"
                value={formValues.enableTax}
                onChange={handleBooleanChange("enableTax")}
              />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <NumberField
                label="Excise Tax"
                name="exciseTax"
                value={formValues.exciseTax}
                onChange={handleChange}
                suffix="%"
                min={0}
                step="0.1"
              />
              <NumberField
                label="WTH Tax"
                name="withholdingTax"
                value={formValues.withholdingTax}
                onChange={handleChange}
                suffix="%"
                min={0}
                step="0.1"
              />
              <NumberField
                label="Liability Threshold"
                name="liabilityThreshold"
                value={formValues.liabilityThreshold}
                onChange={handleChange}
                prefix={formValues.currencySymbol}
                min={0}
              />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Trackier API Key:
                </label>
                <input
                  className={inputClassName + " w-full"}
                  value={formValues.trackierApiKey ?? ""}
                  onChange={(event) =>
                    handleChange("trackierApiKey", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Trackier Auth Code:
                </label>
                <input
                  className={inputClassName}
                  value={formValues.trackierAuthCode ?? ""}
                  onChange={(event) =>
                    handleChange("trackierAuthCode", event.target.value)
                  }
                />
              </div>
            </div>
             <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Affiliate API Key:
                </label>
                <input
                  className={inputClassName + " w-full"}
                  value={formValues.affiliateApiKey ?? ""}
                  onChange={(event) =>
                    handleChange("affiliateApiKey", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Affiliate Auth Code:
                </label>
                <input
                  className={inputClassName}
                  value={formValues.affiliateAuthCode ?? ""}
                  onChange={(event) =>
                    handleChange("affiliateAuthCode", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Affiliate Brand ID:
                </label>
                <input
                  className={inputClassName}
                  value={formValues.affiliateBrandId ?? ""}
                  onChange={(event) =>
                    handleChange("affiliateBrandId", event.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Regional Defaults
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update the base region to automatically align currency symbols, dial codes and locale settings.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              startIcon={<FileText className="h-4 w-4" />}
              onClick={() => {
                const data = JSON.stringify(formValues, null, 2);
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `general-settings-${Date.now()}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export JSON
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Country of Operation
            </label>
            <Select<SelectOption, false>
              options={countryOptions}
              value={countryOptions.find((opt) => opt.value === formValues.country) ?? null}
              onChange={handleCountryChange}
              styles={selectStyles}
              placeholder="Select country"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Currency Symbol
            </label>
            <input
              className={inputClassName}
              value={formValues.currencySymbol ?? ""}
              onChange={(event) => handleChange("currencySymbol", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Dial Code
            </label>
            <input
              className={inputClassName}
              value={formValues.dialCode ?? ""}
              onChange={(event) => handleChange("dialCode", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Commission Pay Day
            </label>
            <Select<SelectOption, false>
              options={paydayOptions}
              value={paydayOptions.find((opt) => opt.value === formValues.commissionPayDay) ?? paydayOptions[0]}
              onChange={(option) =>
                handleChange("commissionPayDay", option?.value ?? "")
              }
              styles={selectStyles}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Power Bonus Start Day
            </label>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <CalendarDays className="h-4 w-4" />
              </div>
              <input
                type="date"
                className={inputClassName}
                value={(formValues.powerBonusStartDate ?? "").slice(0, 10)}
                onChange={(event) =>
                  handleChange("powerBonusStartDate", event.target.value)
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Print Ticket Style
            </label>
            <Select<SelectOption, false>
              options={ticketStyleOptions}
              value={ticketStyleOptions.find(
                (opt) => opt.value === formValues.printTicketStyle
              ) ?? ticketStyleOptions[0]}
              onChange={(option) =>
                handleChange("printTicketStyle", option?.value ?? "")
              }
              styles={selectStyles}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <NumberField
            label="Booking Code Duration"
            name="bookingCodeDuration"
            value={formValues.bookingCodeDuration}
            onChange={handleChange}
            suffix="days"
            min={0}
            info="Ticket code validity"
          />
          <NumberField
            label="Tipster Ticket Eligibility"
            name="tipsterTicketEligibility"
            value={formValues.tipsterTicketEligibility}
            onChange={handleChange}
            suffix="wins"
            min={0}
          />
          <NumberField
            label="Slider Speed"
            name="sliderSpeed"
            value={formValues.sliderSpeed}
            onChange={handleChange}
            suffix="ms"
            min={0}
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Need a reminder of what changed?
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Save to persist these settings across the backoffice. The changes apply instantly across modules.
          </p>
          {saveMessage ? (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
              {saveMessage}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormValues(initialValues)}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default GeneralSettingsForm;
