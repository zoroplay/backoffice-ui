"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";
import { withAuth } from "@/utils/withAuth";

type CashoutLevel = "web_cashout" | "shop_cashout";

type CashoutItem = {
  id?: string | number;
  min_odds: string | number;
  reduction_perc: string | number;
  level?: CashoutLevel | string;
};

type CashoutFormData = {
  enable_cashout: boolean | string | number;
  stake_percentage: string;
  cashout_min_payout: string;
  cashout_max_payout: string;
  items: CashoutItem[];
  level: CashoutLevel;
};

const emptyForm = (level: CashoutLevel): CashoutFormData => ({
  enable_cashout: false,
  stake_percentage: "",
  cashout_min_payout: "",
  cashout_max_payout: "",
  items: [],
  level,
});

function settingValue(settings: Array<{ option?: string; value?: unknown }>, option: string) {
  return settings.find((item) => item.option === option)?.value;
}

function booleanValue(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function CashoutPage() {
  const [activeLevel, setActiveLevel] = useState<CashoutLevel>("web_cashout");
  const [forms, setForms] = useState<Record<CashoutLevel, CashoutFormData>>({
    web_cashout: emptyForm("web_cashout"),
    shop_cashout: emptyForm("shop_cashout"),
  });
  const [loading, setLoading] = useState<Record<CashoutLevel, boolean>>({
    web_cashout: true,
    shop_cashout: true,
  });
  const [saving, setSaving] = useState<CashoutLevel | null>(null);

  async function loadCashOut(level: CashoutLevel) {
    setLoading((current) => ({ ...current, [level]: true }));
    const response = await GETREQUEST<any>(`/api/admin/settings/cash-out?level=${level}`);
    const body = response.data ?? {};

    if (!response.ok) {
      toast.error(response.error || body.message || "An error occured");
      setLoading((current) => ({ ...current, [level]: false }));
      return;
    }

    const settings = Array.isArray(body.settings) ? body.settings : [];
    setForms((current) => ({
      ...current,
      [level]: {
        enable_cashout: booleanValue(settingValue(settings, "enable_cashout")),
        stake_percentage: String(settingValue(settings, "stake_percentage") ?? ""),
        cashout_min_payout: String(settingValue(settings, "cashout_min_payout") ?? ""),
        cashout_max_payout: String(settingValue(settings, "cashout_max_payout") ?? ""),
        items: Array.isArray(body.items) ? body.items : [],
        level,
      },
    }));
    setLoading((current) => ({ ...current, [level]: false }));
  }

  function updateForm(level: CashoutLevel, patch: Partial<CashoutFormData>) {
    setForms((current) => ({ ...current, [level]: { ...current[level], ...patch } }));
  }

  function updateItem(level: CashoutLevel, index: number, patch: Partial<CashoutItem>) {
    setForms((current) => ({
      ...current,
      [level]: {
        ...current[level],
        items: current[level].items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
      },
    }));
  }

  function addReduction(level: CashoutLevel) {
    setForms((current) => ({
      ...current,
      [level]: {
        ...current[level],
        items: [
          ...current[level].items,
          {
            min_odds: "3.1",
            reduction_perc: "10",
            level,
          },
        ],
      },
    }));
  }

  function removeReduction(level: CashoutLevel, index: number) {
    setForms((current) => ({
      ...current,
      [level]: {
        ...current[level],
        items: current[level].items.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  }

  async function saveCashOut(level: CashoutLevel) {
    setSaving(level);
    const response = await POSTREQUEST<any>("/api/admin/settings/cash-out", forms[level]);
    const body = response.data ?? {};
    setSaving(null);

    if (!response.ok || !body.success) {
      toast.error(response.error || body.message || "Something went wrong");
      return;
    }

    toast.success("CashOut Settings has bee saved");
    await loadCashOut(level);
  }

  useEffect(() => {
    loadCashOut("web_cashout");
    loadCashOut("shop_cashout");
  }, []);

  const activeForm = forms[activeLevel];

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="CashOut Settings" />

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex border-b border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
          <TabButton active={activeLevel === "web_cashout"} onClick={() => setActiveLevel("web_cashout")}>
            Web Settings
          </TabButton>
          <TabButton active={activeLevel === "shop_cashout"} onClick={() => setActiveLevel("shop_cashout")}>
            Shop Settings
          </TabButton>
        </div>

        <div className="p-5">
          {loading[activeLevel] ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
          ) : (
            <form
              className="grid gap-6 lg:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                saveCashOut(activeLevel);
              }}
            >
              <div className="space-y-5">
                <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={booleanValue(activeForm.enable_cashout)}
                    onChange={(event) => updateForm(activeLevel, { enable_cashout: event.target.checked })}
                  />
                  Enable {activeLevel === "web_cashout" ? "Web" : "Shop"} Cashout
                </label>

                <Field
                  label="Cashout Stake Percentage"
                  suffix="%"
                  value={activeForm.stake_percentage}
                  onChange={(value) => updateForm(activeLevel, { stake_percentage: value })}
                />
                <Field
                  label="Min Payout Amount"
                  prefix="₦"
                  value={activeForm.cashout_min_payout}
                  onChange={(value) => updateForm(activeLevel, { cashout_min_payout: value })}
                />
                <Field
                  label="Max Payout Amount"
                  prefix="₦"
                  value={activeForm.cashout_max_payout}
                  onChange={(value) => updateForm(activeLevel, { cashout_max_payout: value })}
                />

                <Button type="submit" disabled={saving === activeLevel}>
                  {saving === activeLevel ? "Saveing..." : "Save"}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Min Odds</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Reduction Percent</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                      {activeForm.items.map((item, index) => (
                        <tr key={`${item.id ?? "new"}-${index}`}>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 dark:text-gray-300">&lt;=</span>
                              <input
                                type="number"
                                step="0.01"
                                value={String(item.min_odds ?? "")}
                                onChange={(event) => updateItem(activeLevel, index, { min_odds: event.target.value })}
                                className="h-10 w-24 rounded-md border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.01"
                                value={String(item.reduction_perc ?? "")}
                                onChange={(event) => updateItem(activeLevel, index, { reduction_perc: event.target.value })}
                                className="h-10 w-24 rounded-md border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                              />
                              <span className="text-gray-600 dark:text-gray-300">%</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Button type="button" variant="outline" onClick={() => removeReduction(activeLevel, index)}>
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {!activeForm.items.length ? (
                        <tr>
                          <td colSpan={3} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                            No reductions configured.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="outline" onClick={() => addReduction(activeLevel)}>
                    Add More
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-4 py-2 text-sm font-medium ${
        active ? "bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white" : "text-gray-600 dark:text-gray-400"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  onChange,
  prefix,
  suffix,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  value: string;
}) {
  return (
    <label className="block space-y-2 text-sm">
      <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        {prefix ? <span className="text-gray-500 dark:text-gray-400">{prefix}</span> : null}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-32 rounded-md border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
        />
        {suffix ? <span className="text-gray-500 dark:text-gray-400">{suffix}</span> : null}
      </div>
    </label>
  );
}

export default withAuth(CashoutPage);
