"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Calendar, CheckCircle2, Gift, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal/Modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";
import { withAuth } from "@/utils/withAuth";
import {
  asRecord,
  clientId,
  paginationFrom,
  rowValue,
  toNumber,
  type AnyRecord,
  type Pagination,
} from "@/app/(admin)/tickets/components/ticketApiHelpers";

type TabKey = "weekly" | "paid" | "bonus";
type AgentType = "agent" | "super_agent";
type AgentCommissionType = "ggr_commissions" | "multiple_commissions";

type ProviderOption = {
  value: string;
  label: string;
};

type PeriodOption = {
  value: string;
  label: string;
};

type WeeklyCommissionRow = {
  userId: string;
  username: string;
  profile: string;
  profileId: string;
  totalTickets: number;
  totalSales: number;
  totalWon: number;
  net: number;
  commission: number;
  profit: number;
  isPaid: boolean;
  raw: AnyRecord;
};

type BonusCommissionRow = {
  shopId: string;
  shopName: string;
  bonusRate: ReactNode;
  grossProfit: ReactNode;
  monthlyBonus: ReactNode;
  powerBonus: ReactNode;
  rate: ReactNode;
  totalStake: number;
  totalStakeTarget: ReactNode;
  totalTickets: number;
  totalTicketsTarget: ReactNode;
  totalWeightedStake: number;
  totalWinnings: number;
  turnoverCommissions: number;
};

type Totals = {
  totalStake: number;
  totalWon: number;
  net: number;
  commission: number;
  profit: number;
};

const providerOptions: ProviderOption[] = [
  { value: "sports", label: "Sport" },
  { value: "casino", label: "Casino" },
  { value: "poker", label: "Poker" },
  { value: "virtual", label: "Virtual" },
  { value: "casino_live", label: "Casino live" },
];

const emptyPagination: Pagination = {
  total: 0,
  per_page: 10,
  from: 0,
  to: 0,
  current_page: 1,
  last_page: 1,
};

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function money(value: unknown) {
  return `NGN ${toNumber(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

function plainNumber(value: unknown) {
  return toNumber(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

function recordsFrom(value: unknown): AnyRecord[] {
  if (Array.isArray(value)) return value.map(asRecord);

  const body = asRecord(value);
  if (Array.isArray(body.items)) return body.items.map(asRecord);
  if (Array.isArray(body.data)) return body.data.map(asRecord);
  if (Array.isArray(asRecord(body.data).items)) return asRecord(body.data).items.map(asRecord);
  if (Array.isArray(asRecord(body.data).data)) return asRecord(body.data).data.map(asRecord);

  return Object.values(body).filter((item) => item && typeof item === "object" && !Array.isArray(item)).map(asRecord);
}

function responseMessage(data: unknown, fallback: string) {
  const body = asRecord(data);
  const detailed = Array.isArray(body.detailedErrors) ? asRecord(body.detailedErrors[0]) : {};
  return String(
    rowValue(detailed, ["error", "reason"], rowValue(body, ["message", "errors", "error"], fallback))
  );
}

function hasValidCommissionId(row: WeeklyCommissionRow) {
  return Number.isInteger(Number(row.profileId)) && Number(row.profileId) > 0;
}

function weeklyEndpoint(agentType: AgentType, commissionType: AgentCommissionType) {
  if (agentType === "super_agent") return "super-agent-commission";
  if (commissionType === "multiple_commissions") return "multiple-commission";
  return "ggr-commission";
}

function payoutEndpoint(agentType: AgentType, commissionType: AgentCommissionType) {
  if (agentType === "super_agent") return "pay-super-agent-commission";
  if (commissionType === "multiple_commissions") return "multiple-commission-payout";
  return "ggr-commissions-payout";
}

function selectedCommissionType(agentType: AgentType, commissionType: AgentCommissionType) {
  return agentType === "agent" ? commissionType : "super_agent";
}

function mapWeeklyCommission(value: unknown, index: number): WeeklyCommissionRow {
  const row = asRecord(value);
  const net = toNumber(row.net);
  const commission = toNumber(row.commission ?? row.turnoverCommissions);

  return {
    userId: String(rowValue(row, ["userId", "user_id"], `agent-${index}`)),
    username: String(rowValue(row, ["username", "agentUserName", "agentName"], "")),
    profile: String(rowValue(row, ["profile", "commissionProfile"], "")),
    profileId: String(rowValue(row, ["profile_id", "profileId", "commissionId", "commission_id"], "")),
    totalTickets: toNumber(rowValue(row, ["totalTickets", "no_of_tickets"], 0)),
    totalSales: toNumber(rowValue(row, ["totalSales", "totalStake", "played"], 0)),
    totalWon: toNumber(rowValue(row, ["totalWon", "totalWinnings", "won"], 0)),
    net,
    commission,
    profit: toNumber(row.profit, net - commission),
    isPaid: toNumber(row.is_paid ?? row.isPaid) === 1,
    raw: row,
  };
}

function mapBonusCommission(value: unknown, index: number): BonusCommissionRow {
  const row = asRecord(value);

  return {
    shopId: String(rowValue(row, ["shop_id", "shopId", "user_id", "userId"], `shop-${index}`)),
    shopName: rowValue(row, ["shop_name", "shopName", "username"], ""),
    bonusRate: rowValue(row, ["bonus_rate", "bonusRate"], ""),
    grossProfit: rowValue(row, ["grossProfit"], ""),
    monthlyBonus: rowValue(row, ["monthlyBonus"], ""),
    powerBonus: rowValue(row, ["powerBonus"], ""),
    rate: rowValue(row, ["rate"], ""),
    totalStake: toNumber(row.totalStake),
    totalStakeTarget: rowValue(row, ["totalStakeTarget"], ""),
    totalTickets: toNumber(row.totalTickets),
    totalTicketsTarget: rowValue(row, ["totalTicketsTarget"], ""),
    totalWeightedStake: toNumber(row.totalWeightedStake),
    totalWinnings: toNumber(row.totalWinnings),
    turnoverCommissions: toNumber(row.turnoverCommissions),
  };
}

function periodsFrom(value: unknown, mode: "weekly" | "bonus") {
  return recordsFrom(value).map((period, index) => {
    const start = String(rowValue(period, mode === "weekly" ? ["start_date", "from"] : ["from", "start_date"], ""));
    const end = String(rowValue(period, mode === "weekly" ? ["end_date", "to"] : ["to", "end_date"], ""));
    const value = start && end ? `${start} - ${end}` : String(rowValue(period, ["value"], `period-${index}`));

    return {
      value,
      label: value,
    };
  });
}

function CommissionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("weekly");
  const [provider, setProvider] = useState("sports");
  const [agentType, setAgentType] = useState<AgentType>("agent");
  const [agentCommissionType, setAgentCommissionType] = useState<AgentCommissionType>("ggr_commissions");
  const [from, setFrom] = useState(todayString());
  const [to, setTo] = useState(todayString());
  const [period, setPeriod] = useState("");
  const [periods, setPeriods] = useState<PeriodOption[]>([]);
  const [weeklyRows, setWeeklyRows] = useState<WeeklyCommissionRow[]>([]);
  const [paidRows, setPaidRows] = useState<WeeklyCommissionRow[]>([]);
  const [bonusRows, setBonusRows] = useState<BonusCommissionRow[]>([]);
  const [paidTotals, setPaidTotals] = useState<Totals>({
    totalStake: 0,
    totalWon: 0,
    net: 0,
    commission: 0,
    profit: 0,
  });
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [selectedWeeklyIds, setSelectedWeeklyIds] = useState<string[]>([]);
  const [selectedBonusIds, setSelectedBonusIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [payingKey, setPayingKey] = useState<string | null>(null);
  const [profile, setProfile] = useState<AnyRecord | null>(null);
  const [loadingProfileId, setLoadingProfileId] = useState<string | null>(null);

  const selectedWeeklyRows = useMemo(
    () => weeklyRows.filter((row) => selectedWeeklyIds.includes(row.userId)),
    [selectedWeeklyIds, weeklyRows]
  );

  const selectedBonusRows = useMemo(
    () => bonusRows.filter((row) => selectedBonusIds.includes(row.shopId)),
    [bonusRows, selectedBonusIds]
  );

  async function loadPeriods(tab: TabKey) {
    if (tab === "paid") {
      const response = await GETREQUEST<any>("/api/commissions/periods");
      if (response.ok) setPeriods(periodsFrom(response.data, "weekly"));
      return;
    }

    if (tab === "bonus") {
      const response = await GETREQUEST<any>("/api/power-bonus/get-dates");
      if (response.ok) setPeriods(periodsFrom(response.data, "bonus"));
    }
  }

  useEffect(() => {
    void loadPeriods(activeTab);
  }, [activeTab]);

  async function loadWeekly(page = 1) {
    setLoading(true);
    const response = await POSTREQUEST<any>(
      `/commission/${clientId()}/${weeklyEndpoint(agentType, agentCommissionType)}?page=${page}`,
      { provider, from, to }
    );
    setLoading(false);

    const body = asRecord(response.data);
    const data = asRecord(body.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "Unable to fetch commissions");
      return;
    }

    const rows = recordsFrom(data).map(mapWeeklyCommission);
    setWeeklyRows(rows);
    setPagination(paginationFrom(data.pagination ?? data, page, rows.length));
    setSelectedWeeklyIds([]);
  }

  async function loadPaid(page = 1) {
    setLoading(true);
    const query = new URLSearchParams({
      page: String(page),
      from,
      to,
      provider,
    });
    const response = await GETREQUEST<any>(`/commission/${clientId()}/paid?${query.toString()}`);
    setLoading(false);

    const body = asRecord(response.data);
    const data = asRecord(body.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "Unable to fetch paid commissions");
      return;
    }

    const rows = recordsFrom(data).map(mapWeeklyCommission);
    setPaidRows(rows);
    setPaidTotals({
      totalStake: toNumber(data.totalStake),
      totalWon: rows.reduce((sum, row) => sum + row.totalWon, 0),
      net: toNumber(data.totalNet),
      commission: toNumber(data.commission),
      profit: toNumber(data.profit),
    });
    setPagination(paginationFrom(data.pagination ?? data, page, rows.length));
  }

  function periodRange() {
    const [rangeFrom = "", rangeTo = ""] = period.split(" - ");
    return {
      from: rangeFrom,
      to: rangeTo,
    };
  }

  async function loadBonus(page = 1) {
    if (!period) {
      toast.error("Select Period");
      return;
    }

    const range = periodRange();
    setLoading(true);
    const response = await GETREQUEST<any>(
      `/api/admin/power-bonus?page=${page}&from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`
    );
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "Unable to fetch bonus commissions");
      return;
    }

    const rows = recordsFrom(response.data).map(mapBonusCommission);
    setBonusRows(rows);
    setPagination(paginationFrom(asRecord(response.data).pagination ?? response.data, page, rows.length));
    setSelectedBonusIds([]);
  }

  function search(page = 1) {
    if (activeTab === "weekly") void loadWeekly(page);
    if (activeTab === "paid") void loadPaid(page);
    if (activeTab === "bonus") void loadBonus(page);
  }

  async function loadProfile(profileId: string) {
    if (!profileId) return;

    setLoadingProfileId(profileId);
    const response = await GETREQUEST<any>(`/commission/${clientId()}/profile/${profileId}`);
    setLoadingProfileId(null);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "Unable to fetch record");
      return;
    }

    setProfile(asRecord(body.data));
  }

  function toggleAllWeekly(checked: boolean) {
    if (!checked) {
      setSelectedWeeklyIds([]);
      return;
    }

    setSelectedWeeklyIds(
      weeklyRows.filter((row) => !row.isPaid && hasValidCommissionId(row)).map((row) => row.userId)
    );
  }

  function toggleAllBonus(checked: boolean) {
    setSelectedBonusIds(checked ? bonusRows.map((row) => row.shopId) : []);
  }

  function toggleWeekly(row: WeeklyCommissionRow, checked: boolean) {
    setSelectedWeeklyIds((current) => {
      if (checked) return Array.from(new Set([...current, row.userId]));
      return current.filter((id) => id !== row.userId);
    });
  }

  function toggleBonus(row: BonusCommissionRow, checked: boolean) {
    setSelectedBonusIds((current) => {
      if (checked) return Array.from(new Set([...current, row.shopId]));
      return current.filter((id) => id !== row.shopId);
    });
  }

  async function payWeekly(rows: WeeklyCommissionRow[], key: string) {
    if (!rows.length) {
      toast.error("No agent was selected");
      return;
    }

    const invalidCount = rows.filter((row) => !hasValidCommissionId(row)).length;
    if (invalidCount) {
      toast.error(
        invalidCount === rows.length
          ? "No selected agents have a valid commissionId."
          : `${invalidCount} selected agent(s) have no valid commissionId and cannot be paid.`
      );
      return;
    }

    if (!window.confirm("This will credit selected agents account")) return;

    setPayingKey(key);
    const response = await POSTREQUEST<any>(
      `/commission/${clientId()}/${payoutEndpoint(agentType, agentCommissionType)}`,
      { data: rows.map((row) => row.raw) }
    );
    setPayingKey(null);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(responseMessage(response.data, "Unable to process payment"));
      return;
    }

    toast.success(String(rowValue(body, ["message"], "Payment processed")));
    await loadWeekly(pagination.current_page);
  }

  async function payBonus(rows: BonusCommissionRow[], key: string) {
    if (!rows.length) {
      toast.error("No agent was selected");
      return;
    }

    const range = periodRange();
    if (!range.from || !range.to) {
      toast.error("Select Period");
      return;
    }

    if (!window.confirm("This will credit all agents account")) return;

    setPayingKey(key);
    const response = await POSTREQUEST<any>("/api/admin/power-bonus", {
      user_ids: rows.map((row) => row.shopId),
      from: range.from,
      to: range.to,
    });
    setPayingKey(null);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "Unable to process payment");
      return;
    }

    toast.success(String(rowValue(body, ["message"], "Payment processed")));
    await loadBonus(pagination.current_page);
  }

  const selectedType = selectedCommissionType(agentType, agentCommissionType);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Commissions Report" />

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as TabKey);
          setPagination(emptyPagination);
        }}
        className="w-full"
      >
        <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-2 rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-950">
          <TabsTrigger value="weekly" className="h-10 flex-none px-4">
            <Calendar className="h-4 w-4" />
            Weekly Commissions
          </TabsTrigger>
          <TabsTrigger value="paid" className="h-10 flex-none px-4">
            <CheckCircle2 className="h-4 w-4" />
            Paid Commissions
          </TabsTrigger>
          <TabsTrigger value="bonus" className="h-10 flex-none px-4">
            <Gift className="h-4 w-4" />
            Bonus Commissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
            <div className="grid gap-3 md:grid-cols-6">
              <SelectField label="Provider" value={provider} onChange={setProvider}>
                {providerOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </SelectField>
              <SelectField label="Agent Type" value={agentType} onChange={(value) => setAgentType(value as AgentType)}>
                <option value="super_agent">Super Agent</option>
                <option value="agent">Agent</option>
              </SelectField>
              {agentType === "agent" ? (
                <SelectField label="Commission Type" value={agentCommissionType} onChange={(value) => setAgentCommissionType(value as AgentCommissionType)}>
                  <option value="ggr_commissions">GGR Commissions</option>
                  <option value="multiple_commissions">Multiple Commissions</option>
                </SelectField>
              ) : null}
              <TextField label="From" type="date" value={from} onChange={setFrom} />
              <TextField label="To" type="date" value={to} onChange={setTo} />
              <div className="flex items-end">
                <Button onClick={() => search(1)} disabled={loading} className="w-full">
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </section>

          <ResultsShell
            title="Results"
            loading={loading}
            action={
              <Button
                disabled={payingKey === "weekly-all"}
                onClick={() => void payWeekly(selectedWeeklyRows, "weekly-all")}
              >
                {payingKey === "weekly-all" ? "Paying..." : "Pay All Agents"}
              </Button>
            }
          >
            <WeeklyTable
              rows={weeklyRows}
              selectedIds={selectedWeeklyIds}
              onToggle={toggleWeekly}
              onToggleAll={toggleAllWeekly}
              onPay={(row) => void payWeekly([row], `weekly-${row.userId}`)}
              onProfile={(id) => void loadProfile(id)}
              loadingProfileId={loadingProfileId}
              payingKey={payingKey}
            />
          </ResultsShell>
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
            <div className="grid gap-3 md:grid-cols-5">
              <SelectField label="Provider" value={provider} onChange={setProvider}>
                {providerOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </SelectField>
              <SelectField label="Agent Type" value={agentType} onChange={(value) => setAgentType(value as AgentType)}>
                <option value="super_agent">Super Agent</option>
                <option value="agent">Agent</option>
              </SelectField>
              <TextField label="From" type="date" value={from} onChange={setFrom} />
              <TextField label="To" type="date" value={to} onChange={setTo} />
              <div className="flex items-end">
                <Button onClick={() => search(1)} disabled={loading} className="w-full">
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </section>

          <ResultsShell title="Results" loading={loading}>
            <PaidTable rows={paidRows} totals={paidTotals} onProfile={(id) => void loadProfile(id)} loadingProfileId={loadingProfileId} />
          </ResultsShell>
        </TabsContent>

        <TabsContent value="bonus" className="space-y-4">
          <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
            <div className="grid gap-3 md:grid-cols-3">
              <SelectField label="Provider" value={provider} onChange={setProvider}>
                {providerOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </SelectField>
              <SelectField label="Period" value={period} onChange={setPeriod}>
                <option value="">Select Period</option>
                {periods.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </SelectField>
              <div className="flex items-end">
                <Button onClick={() => search(1)} disabled={loading || !period} className="w-full">
                  {loading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </section>

          <ResultsShell
            title="Results"
            loading={loading}
            action={
              <Button
                disabled={payingKey === "bonus-all"}
                onClick={() => void payBonus(selectedBonusRows, "bonus-all")}
              >
                {payingKey === "bonus-all" ? "Paying..." : "Pay All Agents"}
              </Button>
            }
          >
            <BonusTable
              rows={bonusRows}
              selectedIds={selectedBonusIds}
              onToggle={toggleBonus}
              onToggleAll={toggleAllBonus}
              onPay={(row) => void payBonus([row], `bonus-${row.shopId}`)}
              payingKey={payingKey}
            />
          </ResultsShell>
        </TabsContent>
      </Tabs>

      <PaginationBar
        pagination={pagination}
        disabled={loading}
        onPage={(page) => search(page)}
      />

      <CommissionProfileModal profile={profile} onClose={() => setProfile(null)} />

      <p className="sr-only">Current commission type: {selectedType}</p>
    </div>
  );
}

function ResultsShell({
  title,
  loading,
  action,
  children,
}: {
  title: string;
  loading: boolean;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-brand-500 px-5 py-3 text-white dark:border-gray-800">
        <h2 className="text-base font-semibold">{title}</h2>
        {action}
      </div>
      {loading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500 dark:text-gray-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading commissions...
        </div>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </section>
  );
}

function WeeklyTable({
  rows,
  selectedIds,
  onToggle,
  onToggleAll,
  onPay,
  onProfile,
  loadingProfileId,
  payingKey,
}: {
  rows: WeeklyCommissionRow[];
  selectedIds: string[];
  onToggle: (row: WeeklyCommissionRow, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onPay: (row: WeeklyCommissionRow) => void;
  onProfile: (profileId: string) => void;
  loadingProfileId: string | null;
  payingKey: string | null;
}) {
  const payableRows = rows.filter((row) => !row.isPaid && hasValidCommissionId(row));
  const allSelected = payableRows.length > 0 && payableRows.every((row) => selectedIds.includes(row.userId));

  return (
    <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
      <thead className="bg-gray-50 dark:bg-gray-900">
        <tr>
          <Th><input type="checkbox" checked={allSelected} onChange={(event) => onToggleAll(event.target.checked)} /></Th>
          <Th>Agent</Th>
          <Th>Commission Profile</Th>
          <Th>No. of Tickets</Th>
          <Th>Amount Played</Th>
          <Th>Total Won</Th>
          <Th>Net</Th>
          <Th>Commissions</Th>
          <Th>Profit</Th>
          <Th>Action</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map((row) => (
          <tr key={row.userId}>
            <Td><input type="checkbox" disabled={row.isPaid || !hasValidCommissionId(row)} checked={selectedIds.includes(row.userId)} onChange={(event) => onToggle(row, event.target.checked)} /></Td>
            <Td><Link className="font-medium text-brand-600 hover:underline dark:text-brand-400" href={`/network/agent/${row.userId}`}>{row.username || "-"}</Link></Td>
            <Td><button type="button" className="text-brand-600 hover:underline dark:text-brand-400" onClick={() => onProfile(row.profileId)} disabled={loadingProfileId === row.profileId}>{loadingProfileId === row.profileId ? "Loading..." : row.profile || "-"}</button></Td>
            <Td>{plainNumber(row.totalTickets)}</Td>
            <Td>{money(row.totalSales)}</Td>
            <Td>{money(row.totalWon)}</Td>
            <Td>{money(row.net)}</Td>
            <Td>{money(row.commission)}</Td>
            <Td>{money(row.profit)}</Td>
            <Td>{row.isPaid ? <span className="rounded bg-success-50 px-2 py-1 text-xs font-medium text-success-700 dark:bg-success-500/10 dark:text-success-400">Paid</span> : <Button size="sm" disabled={!hasValidCommissionId(row) || payingKey === `weekly-${row.userId}`} onClick={() => onPay(row)}>{payingKey === `weekly-${row.userId}` ? "Paying..." : "Pay"}</Button>}</Td>
          </tr>
        ))}
        {!rows.length ? <EmptyRow colSpan={10}>No commissions found</EmptyRow> : null}
      </tbody>
    </table>
  );
}

function PaidTable({
  rows,
  totals,
  onProfile,
  loadingProfileId,
}: {
  rows: WeeklyCommissionRow[];
  totals: Totals;
  onProfile: (profileId: string) => void;
  loadingProfileId: string | null;
}) {
  return (
    <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
      <thead className="bg-gray-50 dark:bg-gray-900">
        <tr>
          <Th>Agent</Th>
          <Th>Commission Profile</Th>
          <Th>No. of Tickets</Th>
          <Th>Amount Played</Th>
          <Th>Total Won</Th>
          <Th>Net</Th>
          <Th>Commissions</Th>
          <Th>Profit</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map((row) => (
          <tr key={row.userId}>
            <Td><Link className="font-medium text-brand-600 hover:underline dark:text-brand-400" href={`/network/agent/${row.userId}`}>{row.username || "-"}</Link></Td>
            <Td><button type="button" className="text-brand-600 hover:underline dark:text-brand-400" onClick={() => onProfile(row.profileId)} disabled={loadingProfileId === row.profileId}>{loadingProfileId === row.profileId ? "Loading..." : row.profile || "-"}</button></Td>
            <Td>{plainNumber(row.totalTickets)}</Td>
            <Td>{money(row.totalSales)}</Td>
            <Td>{money(row.totalWon)}</Td>
            <Td>{money(row.net)}</Td>
            <Td>{money(row.commission)}</Td>
            <Td>{money(row.profit)}</Td>
          </tr>
        ))}
        {!rows.length ? <EmptyRow colSpan={8}>No commissions found</EmptyRow> : null}
        <tr className="bg-gray-50 font-semibold dark:bg-gray-900">
          <Td colSpan={3}>Total</Td>
          <Td>{money(totals.totalStake)}</Td>
          <Td>{money(totals.totalWon)}</Td>
          <Td>{money(totals.net)}</Td>
          <Td>{money(totals.commission)}</Td>
          <Td>{money(totals.net - totals.commission)}</Td>
        </tr>
      </tbody>
    </table>
  );
}

function BonusTable({
  rows,
  selectedIds,
  onToggle,
  onToggleAll,
  onPay,
  payingKey,
}: {
  rows: BonusCommissionRow[];
  selectedIds: string[];
  onToggle: (row: BonusCommissionRow, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onPay: (row: BonusCommissionRow) => void;
  payingKey: string | null;
}) {
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  return (
    <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
      <thead className="bg-gray-50 dark:bg-gray-900">
        <tr>
          <Th><input type="checkbox" checked={allSelected} onChange={(event) => onToggleAll(event.target.checked)} /></Th>
          <Th>Shop Name</Th>
          <Th>Bonus Rate</Th>
          <Th>Gross Profit</Th>
          <Th>Monthly Bonus</Th>
          <Th>Power Bonus</Th>
          <Th>Rate</Th>
          <Th>Total Stake</Th>
          <Th>Total Stake Target</Th>
          <Th>Total Tickets</Th>
          <Th>Total Tickets Target</Th>
          <Th>Total Weighted Stake</Th>
          <Th>Total Winnings</Th>
          <Th>Turnover Commission</Th>
          <Th>Action</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map((row) => (
          <tr key={row.shopId}>
            <Td><input type="checkbox" checked={selectedIds.includes(row.shopId)} onChange={(event) => onToggle(row, event.target.checked)} /></Td>
            <Td>{row.shopName || "-"}</Td>
            <Td>{row.bonusRate || "-"}</Td>
            <Td>{row.grossProfit || "-"}</Td>
            <Td>{row.monthlyBonus || "-"}</Td>
            <Td>{row.powerBonus || "-"}</Td>
            <Td>{row.rate || "-"}</Td>
            <Td>{money(row.totalStake)}</Td>
            <Td>{row.totalStakeTarget || "-"}</Td>
            <Td>{plainNumber(row.totalTickets)}</Td>
            <Td>{row.totalTicketsTarget || "-"}</Td>
            <Td>{money(row.totalWeightedStake)}</Td>
            <Td>{money(row.totalWinnings)}</Td>
            <Td>{money(row.turnoverCommissions)}</Td>
            <Td><Button size="sm" disabled={payingKey === `bonus-${row.shopId}`} onClick={() => onPay(row)}>{payingKey === `bonus-${row.shopId}` ? "Paying..." : "Pay"}</Button></Td>
          </tr>
        ))}
        {!rows.length ? <EmptyRow colSpan={15}>No commissions found</EmptyRow> : null}
      </tbody>
    </table>
  );
}

function CommissionProfileModal({
  profile,
  onClose,
}: {
  profile: AnyRecord | null;
  onClose: () => void;
}) {
  const turnovers = Array.isArray(profile?.turnovers) ? profile.turnovers.map(asRecord) : [];

  return (
    <Modal isOpen={Boolean(profile)} onClose={onClose} size="lg" closeOnBackdrop={false}>
      <ModalHeader>Commission Profile</ModalHeader>
      <ModalBody className="space-y-4">
        {profile ? (
          <>
            <table className="min-w-full text-sm">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <InfoRow label="Name" value={profile.name} />
                <InfoRow label="Provider Group" value={profile.providerGroup} />
                <InfoRow label="Period" value={profile.period} />
                <InfoRow label="Commission Type" value={`Turnover (${profile.period || "-"})`} />
                <InfoRow label="Type" value={profile.calculationType} />
                {profile.calculationType === "flat" ? <InfoRow label="Percentage" value={profile.percentage} /> : null}
              </tbody>
            </table>
            {turnovers.length ? (
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="bg-brand-500 px-4 py-2 text-sm font-semibold text-white">TURNOVER</div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {turnovers.map((turnover, index) => (
                    <div key={index} className="grid gap-2 p-3 text-sm text-gray-700 dark:text-gray-300 md:grid-cols-4">
                      <span>Events: {String(rowValue(turnover, ["event"], "-"))}</span>
                      <span>Percentage: {String(rowValue(turnover, ["percentage"], "-"))}</span>
                      {turnover.odd_set ? (
                        <>
                          <span>Odds &gt;= {String(rowValue(turnover, ["min_odd"], "-"))}</span>
                          <span>Odds &lt;= {String(rowValue(turnover, ["max_odd"], "-"))}</span>
                        </>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <tr>
      <td className="w-1/2 px-3 py-2 font-semibold text-gray-900 dark:text-white">{label}</td>
      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{value || "-"}</td>
    </tr>
  );
}

function PaginationBar({
  pagination,
  disabled,
  onPage,
}: {
  pagination: Pagination;
  disabled: boolean;
  onPage: (page: number) => void;
}) {
  if (!pagination.total && pagination.last_page === 1) return null;

  return (
    <div className="flex items-center justify-end gap-2 text-sm text-gray-600 dark:text-gray-300">
      <span>
        Page {pagination.current_page} of {pagination.last_page ?? 1}
      </span>
      <Button
        size="sm"
        variant="outline"
        disabled={disabled || pagination.current_page <= 1}
        onClick={() => onPage(pagination.current_page - 1)}
      >
        Previous
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={disabled || pagination.current_page >= (pagination.last_page ?? 1)}
        onClick={() => onPage(pagination.current_page + 1)}
      >
        Next
      </Button>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      >
        {children}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />
    </label>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">{children}</th>;
}

function Td({
  children,
  colSpan,
}: {
  children: ReactNode;
  colSpan?: number;
}) {
  return <td colSpan={colSpan} className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{children}</td>;
}

function EmptyRow({ children, colSpan }: { children: ReactNode; colSpan: number }) {
  return (
    <tr>
      <Td colSpan={colSpan}>{children}</Td>
    </tr>
  );
}

export default withAuth(CommissionsPage);
