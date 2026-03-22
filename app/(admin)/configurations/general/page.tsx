"use client";

import { Globe2, Layers } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { normalizeApiError, settingsApi } from "@/lib/api";

import {
  countryOptions as staticCountryOptions,
  defaultGeneralSettings,
} from "./data";
import GeneralSettingsForm from "./components/GeneralSettingsForm";
import type { GeneralSettings, SelectOption } from "./types";

type SettingRecord = {
  option?: string;
  value?: string | number | null;
};

const toStringValue = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
};

const toBooleanSetting = (value: unknown): "yes" | "no" => {
  const normalized = toStringValue(value).trim().toLowerCase();
  if (
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "true" ||
    normalized === "enabled"
  ) {
    return "yes";
  }
  return "no";
};

const extractSettingsRecords = (payload: unknown): SettingRecord[] => {
  if (Array.isArray(payload)) {
    return payload as SettingRecord[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const root = payload as { data?: unknown };

  if (Array.isArray(root.data)) {
    return root.data as SettingRecord[];
  }

  return [];
};

const buildSettingsMap = (records: SettingRecord[]): Record<string, string> => {
  return records.reduce<Record<string, string>>((acc, setting) => {
    const option = toStringValue(setting.option).trim();
    if (!option) return acc;
    acc[option] = toStringValue(setting.value);
    return acc;
  }, {});
};

const mapSettingsToForm = (settingsMap: Record<string, string>): GeneralSettings => {
  const get = (key: string, fallback = "") => settingsMap[key] ?? fallback;

  return {
    ...defaultGeneralSettings,
    mainLogo: get("logo", toStringValue(defaultGeneralSettings.mainLogo)),
    printLogo: get("print_logo", toStringValue(defaultGeneralSettings.printLogo)),
    minimumWithdrawal: get("min_withdrawal", defaultGeneralSettings.minimumWithdrawal),
    minimumDeposit: get("min_deposit", defaultGeneralSettings.minimumDeposit),
    allowRegistration: toBooleanSetting(get("allow_registration", defaultGeneralSettings.allowRegistration)),
    enableBankAccount: toBooleanSetting(get("enable_bank_account", defaultGeneralSettings.enableBankAccount)),
    autoDisburseRange: {
      from: get("auto_disbursement_min", defaultGeneralSettings.autoDisburseRange.from),
      to: get("auto_disbursement_max", defaultGeneralSettings.autoDisburseRange.to),
    },
    enablePowerBonus: toBooleanSetting(get("enable_power_bonus", defaultGeneralSettings.enablePowerBonus)),
    commissionPayDay: get("payment_day", defaultGeneralSettings.commissionPayDay),
    bookingCodeDuration: get("booking_duration", defaultGeneralSettings.bookingCodeDuration),
    tipsterTicketEligibility: get("min_tipster_length", defaultGeneralSettings.tipsterTicketEligibility),
    allowDepositCommission: toBooleanSetting(
      get("allow_deposit_commission", defaultGeneralSettings.allowDepositCommission)
    ),
    enableWebAffiliate: toBooleanSetting(get("uses_accts", defaultGeneralSettings.enableWebAffiliate)),
    enableTax: toBooleanSetting(get("enable_tax", defaultGeneralSettings.enableTax)),
    trackierApiKey: get("trackier_api_key", defaultGeneralSettings.trackierApiKey),
    country: get("country", defaultGeneralSettings.country),
    currencySymbol: get(
      "currency_symbol",
      get("curreny_symbol", defaultGeneralSettings.currencySymbol)
    ),
    dialCode: get("dial_code", defaultGeneralSettings.dialCode),
    maximumWithdrawal: get("max_withdrawal", defaultGeneralSettings.maximumWithdrawal),
    maxUpcomingEventsDisplay: get("max_event_weeks", defaultGeneralSettings.maxUpcomingEventsDisplay),
    enableElbetUser: toBooleanSetting(get("enable_elbet_user", defaultGeneralSettings.enableElbetUser)),
    enableAutoDisbursement: toBooleanSetting(
      get("auto_disbursement", defaultGeneralSettings.enableAutoDisbursement)
    ),
    autoDisbursementPerUserPerDay: get(
      "auto_disbursement_per_day",
      defaultGeneralSettings.autoDisbursementPerUserPerDay
    ),
    powerBonusStartDate: get("power_bonus_start_day", defaultGeneralSettings.powerBonusStartDate),
    printTicketStyle: get("ticket_type", defaultGeneralSettings.printTicketStyle),
    liabilityThreshold: get("liability_threshold", defaultGeneralSettings.liabilityThreshold),
    sliderSpeed: get("slider_speed", defaultGeneralSettings.sliderSpeed),
    allowWithdrawalCommission: toBooleanSetting(
      get("allow_withdrawal_commission", defaultGeneralSettings.allowWithdrawalCommission)
    ),
    exciseTax: get("deposit_commission_percent", defaultGeneralSettings.exciseTax),
    withholdingTax: get("withdrawal_commission_percent", defaultGeneralSettings.withholdingTax),
    trackierAuthCode: get("trackier_auth_code", defaultGeneralSettings.trackierAuthCode),
    affiliateAuthCode: get("affiliate_auth_code", defaultGeneralSettings.affiliateAuthCode),
    affiliateApiKey: get("affiliate_api_key", defaultGeneralSettings.affiliateApiKey),
    affiliateBrandId: get("affiliate_brand_id", defaultGeneralSettings.affiliateBrandId),
  };
};

const toApiBool = (value: "yes" | "no") => (value === "yes" ? "1" : "0");

const toSavePayload = (
  formValues: GeneralSettings,
  existingSettings: Record<string, string>
): Record<string, string> => {
  const payload: Record<string, string> = {
    ...existingSettings,
    logo: toStringValue(formValues.mainLogo),
    print_logo: toStringValue(formValues.printLogo),
    min_withdrawal: formValues.minimumWithdrawal,
    max_withdrawal: formValues.maximumWithdrawal,
    slider_speed: formValues.sliderSpeed,
    allow_registration: formValues.allowRegistration === "yes" ? "Yes" : "No",
    booking_duration: formValues.bookingCodeDuration,
    max_event_weeks: formValues.maxUpcomingEventsDisplay,
    min_tipster_length: formValues.tipsterTicketEligibility,
    currency_symbol: formValues.currencySymbol,
    curreny_symbol: formValues.currencySymbol,
    min_deposit: formValues.minimumDeposit,
    payment_day: formValues.commissionPayDay,
    ticket_type: formValues.printTicketStyle,
    enable_bank_account: toApiBool(formValues.enableBankAccount),
    auto_disbursement: toApiBool(formValues.enableAutoDisbursement),
    auto_disbursement_min: formValues.autoDisburseRange.from,
    auto_disbursement_max: formValues.autoDisburseRange.to,
    auto_disbursement_per_day: formValues.autoDisbursementPerUserPerDay,
    uses_accts: toApiBool(formValues.enableWebAffiliate),
    liability_threshold: formValues.liabilityThreshold,
    enable_elbet_user: toApiBool(formValues.enableElbetUser),
    allow_deposit_commission: toApiBool(formValues.allowDepositCommission),
    allow_withdrawal_commission: toApiBool(formValues.allowWithdrawalCommission),
    deposit_commission_percent: formValues.exciseTax,
    withdrawal_commission_percent: formValues.withholdingTax,
    country: formValues.country,
    dial_code: formValues.dialCode,
    enable_power_bonus: toApiBool(formValues.enablePowerBonus),
    power_bonus_start_day: formValues.powerBonusStartDate,
    trackier_api_key: formValues.trackierApiKey,
    trackier_auth_code: formValues.trackierAuthCode,
    affiliate_api_key: formValues.affiliateApiKey,
    affiliate_auth_code: formValues.affiliateAuthCode,
    affiliate_brand_id: formValues.affiliateBrandId,
    enable_tax: toApiBool(formValues.enableTax),
  };

  return payload;
};

const extractCountries = (payload: unknown): SelectOption[] => {
  const root = (payload && typeof payload === "object"
    ? (payload as { data?: unknown })
    : {}) as { data?: unknown };

  const rows = Array.isArray(payload)
    ? (payload as Record<string, unknown>[])
    : Array.isArray(root.data)
      ? (root.data as Record<string, unknown>[])
      : [];

  if (!rows.length) return staticCountryOptions;

  const mapped = rows
    .map((row) => {
      const label =
        toStringValue(row.name) ||
        toStringValue(row.country) ||
        toStringValue(row.label) ||
        toStringValue(row.value);

      if (!label) return null;
      return {
        label,
        value: label,
      };
    })
    .filter((row): row is SelectOption => Boolean(row));

  return mapped.length ? mapped : staticCountryOptions;
};

export default function GeneralConfigurationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [countryOptions, setCountryOptions] = useState<SelectOption[]>(staticCountryOptions);
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(defaultGeneralSettings);

  const summaryCards = useMemo(() => {
    return [
      {
        title: "Country of Operation",
        helper: "Impacts currency, dial code & fiscal options",
        metric: generalSettings.country || "Not set",
        accent: "bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-200",
      },
      {
        title: "Cash Flow",
        helper: `Min ${generalSettings.minimumWithdrawal || "0"} · Max ${generalSettings.maximumWithdrawal || "0"}`,
        metric: `${generalSettings.currencySymbol || ""}${generalSettings.minimumDeposit || "0"}+`,
        accent: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200",
      },
      {
        title: "Automation",
        helper: `Auto disburse up to ${generalSettings.autoDisbursementPerUserPerDay || "0"}/user`,
        metric: generalSettings.enableAutoDisbursement === "yes" ? "Enabled" : "Disabled",
        accent: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200",
      },
    ];
  }, [generalSettings]);

  const loadGeneralSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const [settingsPayload, countriesPayload] = await Promise.all([
        settingsApi.getGeneralSettings(),
        settingsApi.getCountries().catch(() => null),
      ]);

      const map = buildSettingsMap(extractSettingsRecords(settingsPayload));
      setSettingsMap(map);
      setGeneralSettings(mapSettingsToForm(map));

      if (countriesPayload) {
        setCountryOptions(extractCountries(countriesPayload));
      }
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message || "Failed to load general settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGeneralSettings();
  }, [loadGeneralSettings]);

  const handleSave = async (values: GeneralSettings) => {
    setIsSaving(true);
    try {
      const payload = toSavePayload(values, settingsMap);
      await settingsApi.saveGeneralSettings(payload);
      toast.success("General settings saved successfully");
      setGeneralSettings(values);
      setSettingsMap(payload);
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message || "Failed to save general settings");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

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
          {summaryCards.map((card) => (
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
                <span className="text-xs text-gray-500 dark:text-gray-400">{card.helper}</span>
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
        initialValues={generalSettings}
        countryOptions={countryOptions}
        onSubmit={handleSave}
        isSubmitting={isSaving}
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)]">
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

          <div className="mt-4 grid gap-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/40">
              <p className="font-semibold text-gray-800 dark:text-gray-100">1. Payments & Finance</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Ensure withdrawal ceilings and commission rules reflect compliance updates.
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/40">
              <p className="font-semibold text-gray-800 dark:text-gray-100">2. Player Experience</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Review lobby widgets, slider pacing, and booking codes to match promotions.
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/40">
              <p className="font-semibold text-gray-800 dark:text-gray-100">3. Partners & Affiliates</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Share refreshed tax and commission policies with agency partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading general settings...</p>
      ) : null}
    </div>
  );
}
