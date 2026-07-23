"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";
import { withAuth } from "@/utils/withAuth";

import {
  categoryLabels,
  cloneDefaultRiskPayloads,
  defaultRiskPayloads,
  riskCategories,
  type RiskCategory,
  type RiskPayload,
  type RiskPeriod,
} from "./data";
import { riskFieldGroups, type RiskField, type RiskFieldGroup } from "./field";

type ApiBody<T = unknown> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
};

type SettingOption = {
  option?: string;
  value?: string | number;
};

type MaxPayoutRow = {
  ticketLength: string;
  maxPayout: string;
  maxBonusPayout: string;
};

type MaxPayoutContext = {
  category: RiskCategory;
  period: RiskPeriod;
};

type RiskState = ReturnType<typeof cloneDefaultRiskPayloads>;

const periodLabels: Record<RiskPeriod, string> = {
  day: "Day",
  night: "Night",
};

function clientId() {
  return process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
}

function dataArray<T>(body: ApiBody<T[]> | null | undefined): T[] {
  return Array.isArray(body?.data) ? body.data : [];
}

function boolValue(value: string | number | undefined) {
  return String(value ?? "0") === "1" || String(value).toLowerCase() === "true";
}

function hydratePeriodPayload(
  category: RiskCategory,
  period: RiskPeriod,
  settings: SettingOption[]
): RiskPayload {
  const payload = { ...defaultRiskPayloads[category][period] };

  settings.forEach((item) => {
    if (!item.option) return;

    if (item.option in payload) {
      payload[item.option] = item.value ?? "";
    }

    if (category === "retail" && item.option === "enable_cut_x") {
      payload[`enable_cut_x_${period}`] = item.value ?? "";
    }
  });

  return payload;
}

const booleanButtonClasses = (active: boolean) =>
  cn(
    "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-brand-500 text-white shadow-sm hover:bg-brand-600"
      : "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
  );

function fieldId(category: RiskCategory, period: RiskPeriod, field: RiskField) {
  return `${category}-${period}-${field.option(category, period)}`;
}

function MaxPayoutModal({
  context,
  rows,
  isLoading,
  isSaving,
  onClose,
  onAddRow,
  onRemoveRow,
  onChangeRow,
  onSave,
}: {
  context: MaxPayoutContext | null;
  rows: MaxPayoutRow[];
  isLoading: boolean;
  isSaving: boolean;
  onClose: () => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onChangeRow: (index: number, key: keyof MaxPayoutRow, value: string) => void;
  onSave: () => void;
}) {
  return (
    <Modal isOpen={Boolean(context)} onClose={onClose} size="3xl" closeOnBackdrop={false}>
      <ModalHeader>
        Max Payout per Selections {context ? `(${categoryLabels[context.category]} ${periodLabels[context.period]})` : ""}
      </ModalHeader>
      <ModalBody>
        {isLoading ? (
          <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Loading max payout settings...</div>
        ) : (
          <div className="space-y-4">
            {rows.map((row, index) => (
              <div key={index} className="grid gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700 md:grid-cols-[1fr_1fr_1fr_auto]">
                <div>
                  <Label>No. of Selections</Label>
                  <Input
                    type="number"
                    value={row.ticketLength}
                    onChange={(event) => onChangeRow(index, "ticketLength", event.target.value)}
                  />
                </div>
                <div>
                  <Label>Max Payout</Label>
                  <Input
                    type="number"
                    value={row.maxPayout}
                    onChange={(event) => onChangeRow(index, "maxPayout", event.target.value)}
                  />
                </div>
                <div>
                  <Label>Max Bonus Payout</Label>
                  <Input
                    type="number"
                    value={row.maxBonusPayout}
                    onChange={(event) => onChangeRow(index, "maxBonusPayout", event.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 px-3 text-error-500"
                    onClick={() => onRemoveRow(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}

            {!rows.length ? (
              <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No max payout rows configured.
              </div>
            ) : null}

            <Button type="button" variant="outline" onClick={onAddRow} startIcon={<Plus size={16} />}>
              Add More
            </Button>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="button" onClick={onSave} disabled={isLoading || isSaving}>
          {isSaving ? "Please wait..." : "Save"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

const BettingParametersPage: React.FC = () => {
  const [riskState, setRiskState] = useState<RiskState>(() => cloneDefaultRiskPayloads());
  const [activePeriods, setActivePeriods] = useState<Record<RiskCategory, RiskPeriod>>({
    online: "day",
    retail: "day",
  });
  const [activeCategory, setActiveCategory] = useState<RiskCategory>("online");
  const [loadingCategories, setLoadingCategories] = useState<Record<RiskCategory, boolean>>({
    online: true,
    retail: true,
  });
  const [savingKey, setSavingKey] = useState("");
  const [maxPayoutContext, setMaxPayoutContext] = useState<MaxPayoutContext | null>(null);
  const [maxPayoutRows, setMaxPayoutRows] = useState<MaxPayoutRow[]>([]);
  const [isMaxPayoutLoading, setIsMaxPayoutLoading] = useState(false);
  const [isMaxPayoutSaving, setIsMaxPayoutSaving] = useState(false);

  const categories = useMemo(() => riskCategories, []);

  const loadCategorySettings = useCallback(async (category: RiskCategory) => {
    setLoadingCategories((prev) => ({ ...prev, [category]: true }));

    const response = await GETREQUEST<ApiBody<SettingOption[]>>(
      `/admin/settings/${clientId()}/risk-management?category=${category}`
    );
    const body = response.data;

    if (!response.ok || body?.success === false) {
      toast.error(response.error || body?.message || "An error occured!");
      setLoadingCategories((prev) => ({ ...prev, [category]: false }));
      return;
    }

    const settings = dataArray(body);
    setRiskState((prev) => ({
      ...prev,
      [category]: {
        day: hydratePeriodPayload(category, "day", settings),
        night: hydratePeriodPayload(category, "night", settings),
      },
    }));
    setLoadingCategories((prev) => ({ ...prev, [category]: false }));
  }, []);

  useEffect(() => {
    categories.forEach((category) => {
      void loadCategorySettings(category);
    });
  }, [categories, loadCategorySettings]);

  const setPayloadValue = (
    category: RiskCategory,
    period: RiskPeriod,
    key: string,
    value: string | number
  ) => {
    setRiskState((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [period]: {
          ...prev[category][period],
          [key]: value,
        },
      },
    }));
  };

  const resetPeriod = (category: RiskCategory, period: RiskPeriod) => {
    setRiskState((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [period]: { ...defaultRiskPayloads[category][period] },
      },
    }));
  };

  const saveRiskParameters = async (category: RiskCategory, period: RiskPeriod) => {
    const key = `${category}-${period}`;
    setSavingKey(key);

    const response = await POSTREQUEST<ApiBody>(
      `/admin/settings/${clientId()}/risk-management/save`,
      riskState[category][period]
    );
    const body = response.data;

    setSavingKey("");

    if (!response.ok || body?.success === false) {
      toast.error(response.error || body?.message || "Something went wrong");
      return;
    }

    toast.success(category === "online" ? "Risks has been saved" : "Settings has bee saved");
  };

  const openMaxPayoutModal = async (category: RiskCategory, period: RiskPeriod) => {
    setMaxPayoutContext({ category, period });
    setIsMaxPayoutLoading(true);
    setMaxPayoutRows([]);

    const response = await GETREQUEST<ApiBody<Record<string, unknown>[]>>(
      `/admin/bets/max-payout-ticket-length?section=${category}&period=${period}`
    );
    const body = response.data;
    setIsMaxPayoutLoading(false);

    if (!response.ok || body?.success === false) {
      toast.error(response.error || body?.message || "Unable to load max payout settings");
      return;
    }

    setMaxPayoutRows(
      dataArray(body).map((item) => ({
        ticketLength: String(item.ticketLength ?? item.ticket_length ?? ""),
        maxPayout: String(item.maxPayout ?? item.max_payout ?? ""),
        maxBonusPayout: String(item.maxBonusPayout ?? item.max_bonus_payout ?? ""),
      }))
    );
  };

  const saveMaxPayoutRows = async () => {
    if (!maxPayoutContext) return;

    setIsMaxPayoutSaving(true);
    const response = await POSTREQUEST<ApiBody>("/admin/bets/max-payout-ticket-length", {
      section: maxPayoutContext.category,
      period: maxPayoutContext.period,
      items: maxPayoutRows.map((row) => ({
        ...row,
        maxBonusPayout: Number(row.maxBonusPayout) || 0,
      })),
    });
    const body = response.data;
    setIsMaxPayoutSaving(false);

    if (!response.ok || body?.success === false) {
      toast.error(response.error || body?.message || "Something went wrong");
      return;
    }

    toast.success("Max payout per selections has been saved");
    setMaxPayoutContext(null);
  };

  const renderBooleanField = (category: RiskCategory, period: RiskPeriod, field: RiskField) => {
    const key = field.option(category, period);
    const value = boolValue(riskState[category][period][key]);

    return (
      <div key={key} className="flex flex-col gap-2">
        <Label>{field.label}</Label>
        <div className="inline-flex w-full max-w-xs items-center justify-between rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
          <button
            type="button"
            className={booleanButtonClasses(value)}
            onClick={() => setPayloadValue(category, period, key, 1)}
          >
            Yes
          </button>
          <button
            type="button"
            className={booleanButtonClasses(!value)}
            onClick={() => setPayloadValue(category, period, key, 0)}
          >
            No
          </button>
        </div>
      </div>
    );
  };

  const renderNumberField = (category: RiskCategory, period: RiskPeriod, field: RiskField) => {
    const key = field.option(category, period);

    return (
      <div key={key} className="flex flex-col gap-2">
        <Label htmlFor={fieldId(category, period, field)}>{field.label}</Label>
        <div className="relative">
          {field.prefix ? (
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-xs font-medium text-gray-500 dark:text-gray-400">
              {field.prefix}
            </span>
          ) : null}
          <Input
            id={fieldId(category, period, field)}
            type="number"
            step={field.label.includes("Odd") ? 0.01 : undefined}
            value={String(riskState[category][period][key] ?? "")}
            onChange={(event) => setPayloadValue(category, period, key, event.target.value)}
            className={cn(field.prefix && "pl-14", field.suffix && "pr-14")}
          />
          {field.suffix ? (
            <span className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
              {field.suffix}
            </span>
          ) : null}
        </div>
        {field.helperText ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">{field.helperText}</p>
        ) : null}
      </div>
    );
  };

  const renderFieldGroup = (category: RiskCategory, period: RiskPeriod, group: RiskFieldGroup) => {
    const fields = group.fields.filter((field) => !field.retailOnly || category === "retail");

    return (
      <div
        key={`${category}-${period}-${group.title}`}
        className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{group.title}</h4>
          {group.description ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">{group.description}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map((field) =>
            field.type === "boolean"
              ? renderBooleanField(category, period, field)
              : renderNumberField(category, period, field)
          )}
        </div>
      </div>
    );
  };

  const renderCategoryPanel = (category: RiskCategory) => {
    const period = activePeriods[category];
    const isLoading = loadingCategories[category];
    const isSaving = savingKey === `${category}-${period}`;

    return (
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{categoryLabels[category]}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure {categoryLabels[category].toLowerCase()} betting parameters for day and night periods.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            startIcon={<Settings size={16} />}
            onClick={() => void openMaxPayoutModal(category, period)}
          >
            Max Payout per Selections
          </Button>
        </div>

        <div className="px-6 pb-6">
          <Tabs
            value={period}
            onValueChange={(value) =>
              setActivePeriods((prev) => ({
                ...prev,
                [category]: value as RiskPeriod,
              }))
            }
          >
            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800/60 md:flex-row md:items-center md:justify-between">
              <TabsList className="bg-white/80 dark:bg-gray-900/60">
                <TabsTrigger value="day" className="px-4 py-2">
                  Day
                </TabsTrigger>
                <TabsTrigger value="night" className="px-4 py-2">
                  Night
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => resetPeriod(category, period)} disabled={isSaving}>
                  Reset
                </Button>
                <Button type="button" onClick={() => void saveRiskParameters(category, period)} disabled={isLoading || isSaving}>
                  {isSaving ? "Please wait..." : "Save"}
                </Button>
              </div>
            </div>

            {(["day", "night"] as RiskPeriod[]).map((periodValue) => (
              <TabsContent key={periodValue} value={periodValue} className="mt-0">
                {isLoading ? (
                  <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    Loading {categoryLabels[category].toLowerCase()} risk settings...
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
                    {riskFieldGroups.map((group) => renderFieldGroup(category, periodValue, group))}
                  </form>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Betting Parameters" />

      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as RiskCategory)}>
        <TabsList className="mb-6 h-auto rounded-lg border border-gray-200 bg-gray-50 p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800/60">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="rounded-md px-6 py-3 text-sm font-medium">
              {categoryLabels[category]}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            {renderCategoryPanel(category)}
          </TabsContent>
        ))}
      </Tabs>

      <MaxPayoutModal
        context={maxPayoutContext}
        rows={maxPayoutRows}
        isLoading={isMaxPayoutLoading}
        isSaving={isMaxPayoutSaving}
        onClose={() => setMaxPayoutContext(null)}
        onAddRow={() =>
          setMaxPayoutRows((prev) => [
            ...prev,
            { ticketLength: "3", maxPayout: "50000", maxBonusPayout: "" },
          ])
        }
        onRemoveRow={(index) => setMaxPayoutRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index))}
        onChangeRow={(index, key, value) =>
          setMaxPayoutRows((prev) =>
            prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row))
          )
        }
        onSave={() => void saveMaxPayoutRows()}
      />
    </div>
  );
};

export default withAuth(BettingParametersPage);
