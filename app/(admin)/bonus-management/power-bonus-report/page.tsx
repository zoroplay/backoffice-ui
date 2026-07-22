"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { withAuth } from "@/utils/withAuth";

type Tier = {
  minSelections: number;
  maxSelections: number;
  rateLowMargin: number;
  rateHighMargin: number;
};

type PowerBonusConfig = {
  id: number;
  provider: string;
  targetStake: number;
  activePeriodStart: string;
  activePeriodEnd: string;
  isActive: boolean;
  tiers: Tier[];
};

type Assignment = {
  id: string;
  powerBonusId: number;
  agentId: number;
  provider: string;
  createdAt: string;
};

type DashboardRow = {
  agentId: number;
  username: string;
  targetStake: number;
  totalTickets: number;
  totalStake: number;
  totalWeightedStake: number;
  avgSelections: number;
  totalWinnings: number;
  ggr: number;
  ggrMargin: number;
  bonusRate: number;
  grossBonus: number;
  commissionDeducted: number;
  netBonus: number;
  isEligible: boolean;
  reason: string;
};

const providerOptions = [
  { label: "Sports", value: "sports" },
  { label: "Virtual", value: "virtual" },
];

const agents = [
  { id: 184, label: "retail-main-184 - Lagos Main (#184)" },
  { id: 91, label: "ibadan-shop-091 - Ibadan Shop (#91)" },
  { id: 27, label: "lagos-kiosk-027 - Lagos Kiosk (#27)" },
];

const initialConfigurations: PowerBonusConfig[] = [
  {
    id: 1,
    provider: "sports",
    targetStake: 5000000,
    activePeriodStart: "2026-07-01",
    activePeriodEnd: "2026-07-31",
    isActive: true,
    tiers: [
      { minSelections: 1, maxSelections: 4, rateLowMargin: 2.5, rateHighMargin: 1.5 },
      { minSelections: 5, maxSelections: 9, rateLowMargin: 3, rateHighMargin: 2 },
    ],
  },
  {
    id: 2,
    provider: "virtual",
    targetStake: 2500000,
    activePeriodStart: "2026-07-01",
    activePeriodEnd: "2026-07-31",
    isActive: false,
    tiers: [{ minSelections: 1, maxSelections: 6, rateLowMargin: 2, rateHighMargin: 1 }],
  },
];

const initialAssignments: Assignment[] = [
  { id: "asgn-1", powerBonusId: 1, agentId: 184, provider: "sports", createdAt: "2026-07-10" },
  { id: "asgn-2", powerBonusId: 1, agentId: 91, provider: "sports", createdAt: "2026-07-12" },
];

const dashboardRows: DashboardRow[] = [
  {
    agentId: 184,
    username: "retail-main-184",
    targetStake: 5000000,
    totalTickets: 842,
    totalStake: 6120000,
    totalWeightedStake: 7380000,
    avgSelections: 6,
    totalWinnings: 4210000,
    ggr: 1910000,
    ggrMargin: 31.2,
    bonusRate: 3,
    grossBonus: 183600,
    commissionDeducted: 22000,
    netBonus: 161600,
    isEligible: true,
    reason: "Eligible",
  },
  {
    agentId: 91,
    username: "ibadan-shop-091",
    targetStake: 5000000,
    totalTickets: 403,
    totalStake: 2900000,
    totalWeightedStake: 3420000,
    avgSelections: 5,
    totalWinnings: 2310000,
    ggr: 590000,
    ggrMargin: 20.3,
    bonusRate: 0,
    grossBonus: 0,
    commissionDeducted: 0,
    netBonus: 0,
    isEligible: false,
    reason: "Target stake not met",
  },
];

const blankTier: Tier = {
  minSelections: 1,
  maxSelections: 1,
  rateLowMargin: 0,
  rateHighMargin: 0,
};

const blankConfig: PowerBonusConfig = {
  id: 0,
  provider: "",
  targetStake: 0,
  activePeriodStart: "",
  activePeriodEnd: "",
  isActive: true,
  tiers: [blankTier],
};

function money(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function PowerBonusReportPage() {
  const [activeTab, setActiveTab] = useState<"configurations" | "assignments" | "dashboard">("configurations");
  const [configurations, setConfigurations] = useState(initialConfigurations);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [configForm, setConfigForm] = useState<PowerBonusConfig>(blankConfig);
  const [editingConfigId, setEditingConfigId] = useState<number | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({ agentId: "", powerBonusId: "", provider: "" });
  const [assignmentQuery, setAssignmentQuery] = useState("");
  const [resultType, setResultType] = useState<"none" | "calculation" | "dashboard">("dashboard");
  const [selectedPayRows, setSelectedPayRows] = useState<number[]>([]);

  const payableRows = useMemo(
    () => dashboardRows.filter((row) => resultType === "calculation" && row.isEligible && row.netBonus > 0),
    [resultType],
  );

  const isAllPayableSelected = payableRows.length > 0 && selectedPayRows.length === payableRows.length;
  const filteredAssignments = assignmentQuery
    ? assignments.filter((assignment) => String(assignment.agentId) === assignmentQuery)
    : assignments;

  function addTier() {
    setConfigForm((current) => ({
      ...current,
      tiers: [...current.tiers, { ...blankTier }],
    }));
  }

  function removeTier(index: number) {
    setConfigForm((current) => ({
      ...current,
      tiers: current.tiers.length === 1 ? current.tiers : current.tiers.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function updateTier(index: number, key: keyof Tier, value: number) {
    setConfigForm((current) => ({
      ...current,
      tiers: current.tiers.map((tier, itemIndex) =>
        itemIndex === index ? { ...tier, [key]: value } : tier,
      ),
    }));
  }

  function editConfiguration(config: PowerBonusConfig) {
    setEditingConfigId(config.id);
    setConfigForm({ ...config, tiers: config.tiers.map((tier) => ({ ...tier })) });
  }

  function resetConfigForm() {
    setEditingConfigId(null);
    setConfigForm(blankConfig);
  }

  function submitConfiguration() {
    if (editingConfigId) {
      setConfigurations((current) =>
        current.map((config) =>
          config.id === editingConfigId ? { ...configForm, id: editingConfigId } : config,
        ),
      );
    } else {
      setConfigurations((current) => [
        ...current,
        { ...configForm, id: Math.max(...current.map((config) => config.id), 0) + 1 },
      ]);
    }
    resetConfigForm();
  }

  function assignAgent() {
    if (!assignmentForm.agentId || !assignmentForm.powerBonusId || !assignmentForm.provider) return;

    setAssignments((current) => [
      ...current,
      {
        id: `asgn-${current.length + 1}`,
        agentId: Number(assignmentForm.agentId),
        powerBonusId: Number(assignmentForm.powerBonusId),
        provider: assignmentForm.provider,
        createdAt: "2026-07-22",
      },
    ]);
    setAssignmentForm({ agentId: "", powerBonusId: "", provider: "" });
  }

  function toggleAllPayableRows(checked: boolean) {
    setSelectedPayRows(checked ? payableRows.map((row) => row.agentId) : []);
  }

  function toggleRow(agentId: number, checked: boolean) {
    setSelectedPayRows((current) =>
      checked ? [...new Set([...current, agentId])] : current.filter((id) => id !== agentId),
    );
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Power Bonus" />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Power Bonus</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              Manage power bonus configurations, assign agents to bonus profiles, run monthly calculations, review dashboard estimates, and pay eligible agents.
            </p>
          </div>
          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
            <div>Providers: <span className="font-mono">sports</span>, <span className="font-mono">virtual</span></div>
            <div className="mt-1">Agent source: <span className="font-mono">/admin/retail/agents</span></div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800">
        {[
          ["configurations", "Configurations"],
          ["assignments", "Assignments"],
          ["dashboard", "Calculation & Dashboard"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`border-b-2 px-4 py-3 text-sm font-medium ${
              activeTab === key
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "configurations" ? (
        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {editingConfigId ? "Update Configuration" : "Create Configuration"}
              </h2>
            </div>
            <form className="space-y-5 p-5">
              <div className="grid gap-4 md:grid-cols-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Provider
                  <select
                    value={configForm.provider}
                    onChange={(event) => setConfigForm((current) => ({ ...current, provider: event.target.value }))}
                    className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                  >
                    <option value="">Select provider</option>
                    {providerOptions.map((provider) => (
                      <option key={provider.value} value={provider.value}>{provider.label}</option>
                    ))}
                  </select>
                </label>
                <NumberField label="Target Stake" value={configForm.targetStake} onChange={(value) => setConfigForm((current) => ({ ...current, targetStake: value }))} />
                <DateField label="Start Date" value={configForm.activePeriodStart} onChange={(value) => setConfigForm((current) => ({ ...current, activePeriodStart: value }))} />
                <DateField label="End Date" value={configForm.activePeriodEnd} onChange={(value) => setConfigForm((current) => ({ ...current, activePeriodEnd: value }))} />
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={configForm.isActive}
                  onChange={(event) => setConfigForm((current) => ({ ...current, isActive: event.target.checked }))}
                />
                Active
              </label>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      {["Min Selections", "Max Selections", "Rate Low Margin", "Rate High Margin", "Action"].map((head) => (
                        <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                    {configForm.tiers.map((tier, index) => (
                      <tr key={`${index}-${tier.minSelections}-${tier.maxSelections}`}>
                        <td className="px-4 py-3"><InlineNumber value={tier.minSelections} onChange={(value) => updateTier(index, "minSelections", value)} /></td>
                        <td className="px-4 py-3"><InlineNumber value={tier.maxSelections} onChange={(value) => updateTier(index, "maxSelections", value)} /></td>
                        <td className="px-4 py-3"><InlineNumber value={tier.rateLowMargin} onChange={(value) => updateTier(index, "rateLowMargin", value)} /></td>
                        <td className="px-4 py-3"><InlineNumber value={tier.rateHighMargin} onChange={(value) => updateTier(index, "rateHighMargin", value)} /></td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            disabled={configForm.tiers.length === 1}
                            onClick={() => removeTier(index)}
                            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/30 dark:text-red-300"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap justify-between gap-2">
                <button type="button" onClick={addTier} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">
                  Add Tier
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={submitConfiguration} className="rounded-md bg-success-500 px-4 py-2 text-sm font-medium text-white">
                    {editingConfigId ? "Update Configuration" : "Create Configuration"}
                  </button>
                  <button type="button" onClick={resetConfigForm} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </section>

          <PowerBonusTable
            title="Power Bonus Configurations"
            columns={["ID", "Provider", "Target Stake", "Period", "Status", "Tiers", "Action"]}
            rows={configurations.map((config) => [
              config.id,
              config.provider,
              money(config.targetStake),
              `${config.activePeriodStart} - ${config.activePeriodEnd}`,
              config.isActive ? "Active" : "Inactive",
              config.tiers.length,
              <button key="edit" type="button" onClick={() => editConfiguration(config)} className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white">Edit</button>,
            ])}
          />
        </div>
      ) : null}

      {activeTab === "assignments" ? (
        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Assign Agent to Power Bonus</h2>
            </div>
            <form className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_1fr_auto]">
              <SelectField label="Agent" value={assignmentForm.agentId} options={agents.map((agent) => [String(agent.id), agent.label])} onChange={(value) => setAssignmentForm((current) => ({ ...current, agentId: value }))} />
              <TextField label="Power Bonus ID" value={assignmentForm.powerBonusId} onChange={(value) => setAssignmentForm((current) => ({ ...current, powerBonusId: value }))} />
              <SelectField label="Provider" value={assignmentForm.provider} options={providerOptions.map((provider) => [provider.value, provider.label])} onChange={(value) => setAssignmentForm((current) => ({ ...current, provider: value }))} />
              <button type="button" onClick={assignAgent} className="h-10 self-end rounded-md bg-success-500 px-4 text-sm font-medium text-white">Assign Agent</button>
            </form>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Fetch Agent Assignments</h2>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
              <SelectField label="Agent" value={assignmentQuery} options={agents.map((agent) => [String(agent.id), agent.label])} onChange={setAssignmentQuery} />
              <button type="button" className="h-10 self-end rounded-md bg-brand-500 px-4 text-sm font-medium text-white">Load Assignments</button>
            </div>
            <PowerBonusTable
              title="Assignments"
              columns={["ID", "Power Bonus ID", "Agent ID", "Provider", "Created At"]}
              rows={filteredAssignments.map((assignment) => [
                assignment.id,
                assignment.powerBonusId,
                assignment.agentId,
                assignment.provider,
                assignment.createdAt,
              ])}
            />
          </section>
        </div>
      ) : null}

      {activeTab === "dashboard" ? (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <MonthForm title="Calculate For Agent" button="Run Calculation" onRun={() => setResultType("calculation")} />
            <MonthForm title="Dashboard Breakdown" button="Load Dashboard" onRun={() => setResultType("dashboard")} />
          </div>

          <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Dashboard Breakdown</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Showing: <span className="font-semibold">{resultType === "calculation" ? "Calculated Result" : resultType === "dashboard" ? "Dashboard Estimate" : "No Result Loaded"}</span>
                </p>
              </div>
              {resultType === "calculation" ? (
                <button
                  type="button"
                  disabled={!selectedPayRows.length}
                  className="rounded-md bg-success-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Pay Selected Agents
                </button>
              ) : null}
            </div>
            <div className="overflow-x-auto p-5">
              <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {resultType === "calculation" ? (
                      <th className="px-4 py-3 text-left">
                        <input type="checkbox" checked={isAllPayableSelected} onChange={(event) => toggleAllPayableRows(event.target.checked)} />
                      </th>
                    ) : null}
                    {["Agent", "Target Stake", "Total Tickets", "Total Stake", "Weighted Stake", "Avg Selections", "Total Winnings", "GGR", "Margin", "Bonus Rate", "Gross/Estimated Bonus", "Commission Deducted", "Net Bonus", "Eligible", "Reason", "Action"].map((head) => (
                      <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                  {dashboardRows.map((row) => {
                    const canPay = resultType === "calculation" && row.isEligible && row.netBonus > 0;
                    return (
                      <tr key={row.agentId}>
                        {resultType === "calculation" ? (
                          <td className="px-4 py-3">
                            <input type="checkbox" disabled={!canPay} checked={selectedPayRows.includes(row.agentId)} onChange={(event) => toggleRow(row.agentId, event.target.checked)} />
                          </td>
                        ) : null}
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{row.username}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.targetStake)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.totalTickets.toLocaleString()}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.totalStake)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.totalWeightedStake)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.avgSelections}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.totalWinnings)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.ggr)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.ggrMargin}%</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.bonusRate}%</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.grossBonus)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.commissionDeducted)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.netBonus)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.isEligible ? "Yes" : "No"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{resultType === "dashboard" ? "Dashboard estimate" : row.reason}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {canPay ? (
                            <button type="button" className="rounded-md bg-success-500 px-3 py-1.5 text-xs font-medium text-white">Pay</button>
                          ) : (
                            <button type="button" disabled className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 dark:border-gray-700">Not Payable</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
    </label>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
    </label>
  );
}

function InlineNumber({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-10 w-28 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[][];
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
        <option value="">Select</option>
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>{labelText}</option>
        ))}
      </select>
    </label>
  );
}

function MonthForm({ title, button, onRun }: { title: string; button: string; onRun: () => void }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <form className="space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <SelectField label="Provider" value="sports" options={providerOptions.map((provider) => [provider.value, provider.label])} onChange={() => undefined} />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            From Month
            <input type="month" defaultValue="2026-07" className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          </label>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            To Month
            <input type="month" defaultValue="2026-07" className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          </label>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Runs from the first day of From Month to the last day of To Month.
        </p>
        <button type="button" onClick={onRun} className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">
          {button}
        </button>
      </form>
    </section>
  );
}

function PowerBonusTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: ReactNode[][];
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="overflow-x-auto p-5">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {rows.length ? rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{cell}</td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default withAuth(PowerBonusReportPage);
