"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Calendar, Eye, Search, Wallet, X } from "lucide-react";

import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";

type Tab = "weekly" | "paid" | "bonus";
type Provider = "sports" | "casino" | "poker" | "virtual" | "casino_live";
type AgentType = "agent" | "super_agent";
type AgentCommissionType = "ggr_commissions" | "multiple_commissions";

type Pagination = {
  total: number;
  per_page: number;
  from: number;
  to: number;
  current_page: number;
  last_page?: number;
};

type CommissionProfile = {
  id?: number;
  name?: string;
  providerGroup?: string;
  period?: string;
  commissionType?: number;
  calculationType?: string;
  percentage?: string | number;
  turnovers?: Array<{
    event?: number | string;
    percentage?: string | number;
    odd_set?: boolean;
    oddSet?: boolean;
    min_odd?: string | number;
    minOdd?: string | number;
    max_odd?: string | number;
    maxOdd?: string | number;
  }>;
};

type WeeklyCommissionRow = {
  userId: number | string;
  username: string;
  profileId: number | null;
  profile: string;
  totalTickets: number;
  totalSales: number;
  totalWon: number;
  net: number;
  commission: number;
  profit: number;
  isPaid: boolean;
  raw: Record<string, unknown>;
};

type PaidCommissionRow = {
  userId: number | string;
  agentUserName: string;
  profileId: number | null;
  commissionProfile: string;
  totalTickets: number;
  totalStake: number;
  totalWon: number;
  net: number;
  commission: number;
  profit: number;
};

type BonusCommissionRow = {
  shopId: number | string;
  shopName: string;
  bonusRate: string;
  grossProfit: number;
  monthlyBonus: number;
  powerBonus: number;
  rate: string;
  totalStake: number;
  totalStakeTarget: number;
  totalTickets: number;
  totalTicketsTarget: number;
  totalWeightedStake: number;
  totalWinnings: number;
  turnoverCommissions: number;
};

const providers: { value: Provider; label: string }[] = [
  { value: "sports", label: "Sport" },
  { value: "casino", label: "Casino" },
  { value: "poker", label: "Poker" },
  { value: "virtual", label: "Virtual" },
  { value: "casino_live", label: "Casino live" },
];

const emptyPagination: Pagination = {
  total: 0,
  per_page: 2,
  from: 1,
  to: 0,
  current_page: 1,
};

function clientId() {
  return process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
}

function money(value: number) {
  return `NGN ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {};
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function selectedCommissionType(agentType: AgentType, commissionType: AgentCommissionType) {
  return agentType === "agent" ? commissionType : "super_agent";
}

function commissionEndpoint(type: string) {
  const endpointMap: Record<string, string> = {
    agent: "ggr-commission",
    super_agent: "super-agent-commission",
    ggr_commissions: "ggr-commission",
    multiple_commissions: "multiple-commission",
  };
  return endpointMap[type] ?? endpointMap.agent;
}

function payoutEndpoint(type: string) {
  const endpointMap: Record<string, string> = {
    agent: "ggr-commissions-payout",
    super_agent: "pay-super-agent-commission",
    ggr_commissions: "ggr-commissions-payout",
    multiple_commissions: "multiple-commission-payout",
  };
  return endpointMap[type] ?? endpointMap.agent;
}

function hasValidCommissionId(row: { profileId: number | null }) {
  return Number.isInteger(row.profileId) && Number(row.profileId) > 0;
}

function getCommissionItems(data: unknown) {
  const payload = asRecord(data);
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(data)) return data;
  return Object.values(payload).filter((item) => item && typeof item === "object" && !Array.isArray(item));
}

function normalizeWeeklyAgent(agentValue: unknown): WeeklyCommissionRow {
  const agent = asRecord(agentValue);
  const net = toNumber(agent.net);
  const commission = toNumber(agent.commission ?? agent.turnoverCommissions);
  const rawId = agent.commissionId ?? agent.commission_id ?? agent.profile_id ?? agent.profileId ?? null;
  const profileId = Number.isInteger(Number(rawId)) && Number(rawId) > 0 ? Number(rawId) : null;

  return {
    userId: agent.userId ?? agent.user_id ?? agent.id ?? "",
    username: agent.username ?? agent.agentUserName ?? agent.agentName ?? "-",
    profile: agent.profile ?? agent.commissionProfile ?? "-",
    profileId,
    totalTickets: toNumber(agent.totalTickets ?? agent.no_of_tickets),
    totalSales: toNumber(agent.totalSales ?? agent.totalStake ?? agent.played),
    totalWon: toNumber(agent.totalWon ?? agent.totalWinnings ?? agent.won),
    net,
    commission,
    profit: toNumber(agent.profit, net - commission),
    isPaid: Number(agent.is_paid ?? agent.isPaid ?? 0) === 1,
    raw: agent,
  };
}

function normalizePaidAgent(agentValue: unknown): PaidCommissionRow {
  const agent = asRecord(agentValue);
  const net = toNumber(agent.net);
  const commission = toNumber(agent.commission);
  const rawId = agent.profileId ?? agent.profile_id ?? agent.commissionId ?? agent.commission_id ?? null;

  return {
    userId: agent.userId ?? agent.user_id ?? agent.id ?? "",
    agentUserName: agent.agentUserName ?? agent.username ?? agent.agentName ?? "-",
    profileId: Number.isInteger(Number(rawId)) && Number(rawId) > 0 ? Number(rawId) : null,
    commissionProfile: agent.commissionProfile ?? agent.profile ?? "-",
    totalTickets: toNumber(agent.totalTickets ?? agent.no_of_tickets),
    totalStake: toNumber(agent.totalStake ?? agent.totalSales ?? agent.played),
    totalWon: toNumber(agent.totalWon ?? agent.totalWinnings ?? agent.won),
    net,
    commission,
    profit: toNumber(agent.profit, net - commission),
  };
}

function normalizeBonusAgent(agentValue: unknown): BonusCommissionRow {
  const agent = asRecord(agentValue);
  return {
    shopId: agent.shop_id ?? agent.shopId ?? agent.user_id ?? agent.userId ?? "",
    shopName: agent.shop_name ?? agent.shopName ?? agent.username ?? "-",
    bonusRate: String(agent.bonus_rate ?? agent.bonusRate ?? "-"),
    grossProfit: toNumber(agent.grossProfit),
    monthlyBonus: toNumber(agent.monthlyBonus),
    powerBonus: toNumber(agent.powerBonus),
    rate: String(agent.rate ?? "-"),
    totalStake: toNumber(agent.totalStake),
    totalStakeTarget: toNumber(agent.totalStakeTarget),
    totalTickets: toNumber(agent.totalTickets),
    totalTicketsTarget: toNumber(agent.totalTicketsTarget),
    totalWeightedStake: toNumber(agent.totalWeightedStake),
    totalWinnings: toNumber(agent.totalWinnings),
    turnoverCommissions: toNumber(agent.turnoverCommissions),
  };
}

function paginationFrom(data: unknown, page: number, count: number): Pagination {
  const payload = asRecord(data);
  const direct = asRecord(payload.pagination);
  if (Object.keys(direct).length) return direct as Pagination;

  const perPage = toNumber(payload.per_page ?? payload.perPage ?? emptyPagination.per_page, count || emptyPagination.per_page);
  const total = toNumber(payload.count ?? payload.total, count);
  const currentPage = toNumber(payload.current_page ?? payload.currentPage, page);

  return {
    total,
    per_page: perPage,
    from: total ? (currentPage - 1) * perPage + 1 : 0,
    to: Math.min(currentPage * perPage, total),
    current_page: currentPage,
    last_page: perPage ? Math.max(1, Math.ceil(total / perPage)) : 1,
  };
}

export default function CommissionReportClient() {
  const [activeTab, setActiveTab] = useState<Tab>("weekly");
  const [selectedProfile, setSelectedProfile] = useState<CommissionProfile | null>(null);

  async function loadProfile(profileId: number | null) {
    if (!profileId) {
      toast.error("Unable to fetch record");
      return;
    }

    const response = await GETREQUEST<any>(`/commission/${clientId()}/profile/${profileId}`);
    const body = asRecord(response.data);

    if (response.ok && body.success !== false) {
      setSelectedProfile(body.data ?? body);
    } else {
      toast.error(response.error || body.message || "Unable to fetch record");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="grid gap-1 md:grid-cols-3">
          <TabButton active={activeTab === "weekly"} onClick={() => setActiveTab("weekly")}>Weekly Commissions</TabButton>
          <TabButton active={activeTab === "paid"} onClick={() => setActiveTab("paid")}>Paid Commissions</TabButton>
          <TabButton active={activeTab === "bonus"} onClick={() => setActiveTab("bonus")}>Bonus Commissions</TabButton>
        </div>
      </div>

      {activeTab === "weekly" ? <WeeklyCommissions onProfile={loadProfile} /> : null}
      {activeTab === "paid" ? <PaidCommissions onProfile={loadProfile} /> : null}
      {activeTab === "bonus" ? <BonusCommissions /> : null}
      {selectedProfile ? <CommissionProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} /> : null}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`h-11 rounded-md px-3 text-sm font-medium ${active ? "bg-brand-500 text-white" : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.04]"}`}>
      {children}
    </button>
  );
}

function WeeklyCommissions({ onProfile }: { onProfile: (profileId: number | null) => void }) {
  const [provider, setProvider] = useState<Provider>("sports");
  const [agentType, setAgentType] = useState<AgentType>("agent");
  const [agentCommissionType, setAgentCommissionType] = useState<AgentCommissionType>("ggr_commissions");
  const [from, setFrom] = useState("2026-07-21");
  const [to, setTo] = useState("2026-07-27");
  const [rows, setRows] = useState<WeeklyCommissionRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Array<number | string>>([]);
  const commissionType = selectedCommissionType(agentType, agentCommissionType);

  const validPayableRows = rows.filter((row) => !row.isPaid && hasValidCommissionId(row));
  const allSelected = validPayableRows.length > 0 && validPayableRows.every((row) => selectedIds.includes(row.userId));
  const selectedRows = rows.filter((row) => selectedIds.includes(row.userId));
  const overview = rows.reduce((sum, row) => ({
    tickets: sum.tickets + row.totalTickets,
    played: sum.played + row.totalSales,
    won: sum.won + row.totalWon,
    net: sum.net + row.net,
    commission: sum.commission + row.commission,
  }), { tickets: 0, played: 0, won: 0, net: 0, commission: 0 });

  async function calculate(page = 1) {
    setLoading(true);
    setSelectedIds([]);
    const response = await POSTREQUEST<any>(`/commission/${clientId()}/${commissionEndpoint(commissionType)}?page=${page}`, { provider, from, to });
    setLoading(false);

    const body = asRecord(response.data);
    const data = body.data && typeof body.data === "object" ? body.data : body;

    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const mapped = getCommissionItems(data).map(normalizeWeeklyAgent);
    setRows(mapped);
    setPagination(paginationFrom(data, page, mapped.length));
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : validPayableRows.map((row) => row.userId));
  }

  function toggleRow(row: WeeklyCommissionRow) {
    if (row.isPaid || !hasValidCommissionId(row)) return;
    setSelectedIds((current) => current.includes(row.userId) ? current.filter((id) => id !== row.userId) : [...current, row.userId]);
  }

  async function pay(rowsToPay: WeeklyCommissionRow[]) {
    if (!rowsToPay.length) {
      toast.error("No agent was selected");
      return;
    }
    const invalidCount = rowsToPay.filter((row) => !hasValidCommissionId(row)).length;
    if (invalidCount) {
      toast.error(`${invalidCount} selected agent(s) have no valid commissionId and cannot be paid.`);
      return;
    }
    if (!window.confirm(rowsToPay.length === 1 ? "This will credit the agent account" : "This will credit selected agents account")) return;

    const response = await POSTREQUEST<any>(`/commission/${clientId()}/${payoutEndpoint(commissionType)}`, { data: rowsToPay.map((row) => row.raw) });
    const body = asRecord(response.data);
    if (response.ok && body.success !== false) {
      toast.success(body.message || "Commission payment submitted");
      await calculate(pagination.current_page);
    } else {
      const detailed = body.data?.detailedErrors?.[0]?.error || body.data?.detailedErrors?.[0]?.reason;
      toast.error(response.error || detailed || body.message || "Unable to process payment");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void calculate(1); }}>
          <div className="grid gap-3 lg:grid-cols-6">
            <ProviderSelect value={provider} onChange={setProvider} />
            <select value={agentType} onChange={(event) => setAgentType(event.target.value as AgentType)} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="super_agent">Super Agent</option>
              <option value="agent">Agent</option>
            </select>
            {agentType === "agent" ? (
              <select value={agentCommissionType} onChange={(event) => setAgentCommissionType(event.target.value as AgentCommissionType)} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                <option value="ggr_commissions">GGR Commissions</option>
                <option value="multiple_commissions">Multiple Commissions</option>
              </select>
            ) : null}
            <DateInput value={from} onChange={setFrom} />
            <DateInput value={to} onChange={setTo} />
            <button type="submit" disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-info-500 px-4 text-sm font-medium text-white hover:bg-info-600 disabled:opacity-60">
              <Search size={16} />
              {loading ? "Searching" : "Search"}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Calls `POST /commission/{clientId()}/{commissionEndpoint(commissionType)}?page=1`; payout uses `POST /commission/{clientId()}/{payoutEndpoint(commissionType)}`.
          </p>
        </form>
      </section>

      <CommissionOverview rows={rows} overview={overview} />

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Results</h2>
          <button type="button" onClick={() => void pay(selectedRows)} className="inline-flex h-9 items-center gap-2 rounded-md bg-green-600 px-3 text-sm font-medium text-white hover:bg-green-700">
            <Wallet size={16} />
            Pay All Agents
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-gray-300 text-brand-500" /></th>
                {["Agent", "Commission Profile", "No. of Tickets", "Amount Played", "Total Won", "Net", "Commissions", "Profit", ""].map((head) => <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {rows.map((row) => (
                <tr key={String(row.userId)}>
                  <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(row.userId)} disabled={row.isPaid || !hasValidCommissionId(row)} onChange={() => toggleRow(row)} className="h-4 w-4 rounded border-gray-300 text-brand-500 disabled:opacity-40" /></td>
                  <td className="whitespace-nowrap px-4 py-3"><Link href={`/network/agent/${row.userId}`} className="font-medium text-brand-600 dark:text-brand-300">{row.username}</Link></td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {row.profileId ? <button type="button" onClick={() => onProfile(row.profileId)} className="inline-flex items-center gap-2 font-medium text-brand-600 dark:text-brand-300"><Eye size={14} />{row.profile}</button> : <span className="text-red-600 dark:text-red-400">{row.profile}</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.totalTickets.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.totalSales)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.totalWon)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.net)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.commission)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.profit)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{row.isPaid ? <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-500/15 dark:text-green-300">Paid</span> : <button type="button" disabled={!hasValidCommissionId(row)} onClick={() => void pay([row])} className="h-8 rounded-md bg-brand-500 px-3 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300">Pay</button>}</td>
                </tr>
              ))}
              {!rows.length ? <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">{loading ? "Loading commissions" : "No commissions found"}</td></tr> : null}
            </tbody>
          </table>
        </div>
        <PaginationSummary pagination={pagination} onPage={(page) => void calculate(page)} />
      </section>
    </div>
  );
}

function CommissionOverview({ rows, overview }: { rows: WeeklyCommissionRow[]; overview: { tickets: number; played: number; won: number; net: number; commission: number } }) {
  if (!rows.length) return null;
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Commission Overview</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>{["Time", "No. of Tickets", "Amount Played", "Total Won", "Net", "Commissions", "Profit", ""].map((head) => <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            <tr>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Week</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{overview.tickets.toLocaleString()}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(overview.played)}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(overview.won)}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(overview.net)}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(overview.commission)}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(overview.net - overview.commission)}</td>
              <td className="px-4 py-3"><button type="button" className="h-8 rounded-md bg-brand-500 px-3 text-xs font-medium text-white">Pay</button></td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Month</td>
              <td colSpan={7} className="px-4 py-3 text-gray-400">Monthly summary row preserved from Nuxt.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PaidCommissions({ onProfile }: { onProfile: (profileId: number | null) => void }) {
  const [provider, setProvider] = useState<Provider>("sports");
  const [agentType, setAgentType] = useState<AgentType>("agent");
  const [from, setFrom] = useState("2026-07-21");
  const [to, setTo] = useState("2026-07-27");
  const [rows, setRows] = useState<PaidCommissionRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [loading, setLoading] = useState(false);
  const totals = useMemo(() => rows.reduce((sum, row) => ({ stake: sum.stake + row.totalStake, won: sum.won + row.totalWon, net: sum.net + row.net, commission: sum.commission + row.commission }), { stake: 0, won: 0, net: 0, commission: 0 }), [rows]);

  async function calculate(page = 1) {
    setLoading(true);
    const query = `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&provider=${encodeURIComponent(provider)}`;
    const response = await GETREQUEST<any>(`/commission/${clientId()}/paid?page=${page}${query}`);
    setLoading(false);

    const body = asRecord(response.data);
    const data = asRecord(body.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const items = Array.isArray(data.items) ? data.items : [];
    const mapped = items.map(normalizePaidAgent);
    setRows(mapped);
    setPagination(paginationFrom(data.pagination ? { pagination: data.pagination } : data, page, mapped.length));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void calculate(1); }}>
          <div className="grid gap-3 md:grid-cols-5">
            <ProviderSelect value={provider} onChange={setProvider} />
            <select value={agentType} onChange={(event) => setAgentType(event.target.value as AgentType)} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="super_agent">Super Agent</option>
              <option value="agent">Agent</option>
            </select>
            <DateInput value={from} onChange={setFrom} />
            <DateInput value={to} onChange={setTo} />
            <button type="submit" disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-info-500 px-4 text-sm font-medium text-white hover:bg-info-600 disabled:opacity-60"><Search size={16} />{loading ? "Searching" : "Search"}</button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Calls `GET /commission/{clientId()}/paid?page=1&from={from}&to={to}&provider={provider}`.
          </p>
        </form>
      </section>

      <CommissionTableShell title="Results">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>{["Agent", "Commission Profile", "No. of Tickets", "Amount Played", "Total Won", "Net", "Commissions", "Profit"].map((head) => <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {rows.map((row) => (
              <tr key={String(row.userId)}>
                <td className="whitespace-nowrap px-4 py-3"><Link href={`/network/agent/${row.userId}`} className="font-medium text-brand-600 dark:text-brand-300">{row.agentUserName}</Link></td>
                <td className="whitespace-nowrap px-4 py-3"><button type="button" onClick={() => onProfile(row.profileId)} className="inline-flex items-center gap-2 font-medium text-brand-600 dark:text-brand-300"><Eye size={14} />{row.commissionProfile}</button></td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.totalTickets.toLocaleString()}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.totalStake)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.totalWon)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.net)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.commission)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.profit)}</td>
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">{loading ? "Loading commissions" : "No commissions found"}</td></tr> : null}
            <tr className="bg-gray-50 font-semibold dark:bg-gray-900">
              <td colSpan={3} className="px-4 py-3 text-gray-700 dark:text-gray-300">Total</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totals.stake)}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totals.won)}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totals.net)}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totals.commission)}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(totals.net - totals.commission)}</td>
            </tr>
          </tbody>
        </table>
        <PaginationSummary pagination={pagination} onPage={(page) => void calculate(page)} />
      </CommissionTableShell>
    </div>
  );
}

function BonusCommissions() {
  const [provider, setProvider] = useState<Provider>("sports");
  const [period, setPeriod] = useState("");
  const [periods, setPeriods] = useState<{ text: string; value: string }[]>([]);
  const [rows, setRows] = useState<BonusCommissionRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Array<number | string>>([]);
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.shopId));
  const [from, to] = period ? period.split(" - ") : ["", ""];

  useEffect(() => {
    let mounted = true;
    async function loadPeriods() {
      const response = await GETREQUEST<any>("/api/power-bonus/get-dates");
      const body = asRecord(response.data);
      const items = Array.isArray(body.data) ? body.data : [];
      if (mounted) {
        setPeriods(items.map((item: any) => ({ text: `${item.from} - ${item.to}`, value: `${item.from} - ${item.to}` })));
      }
    }
    void loadPeriods();
    return () => {
      mounted = false;
    };
  }, []);

  async function calculate(page = 1) {
    if (!period) {
      toast.error("Select Period");
      return;
    }
    setLoading(true);
    setSelectedIds([]);
    const response = await GETREQUEST<any>(`/api/admin/power-bonus?page=${page}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const data = Array.isArray(body.data) ? body.data : Array.isArray(response.data) ? response.data : [];
    const mapped = data.map(normalizeBonusAgent);
    setRows(mapped);
    setPagination(paginationFrom(body, page, mapped.length));
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : rows.map((row) => row.shopId));
  }

  async function pay(userIds: Array<number | string>) {
    if (!userIds.length) {
      toast.error("No agent was selected");
      return;
    }
    if (!window.confirm(userIds.length === 1 ? "This will credit the agent account" : "This will credit all agents account")) return;
    const response = await POSTREQUEST<any>("/api/admin/power-bonus", { user_ids: userIds, from, to });
    const body = asRecord(response.data);
    if (response.ok && body.success !== false) {
      toast.success(body.message || "Power bonus payment submitted");
      await calculate(pagination.current_page);
    } else {
      toast.error(response.error || body.message || "Unable to process payment");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void calculate(1); }}>
          <div className="grid gap-3 md:grid-cols-3">
            <ProviderSelect value={provider} onChange={setProvider} />
            <select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="">Select Period</option>
              {periods.map((option) => <option key={option.value} value={option.value}>{option.text}</option>)}
            </select>
            <button type="submit" disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-info-500 px-4 text-sm font-medium text-white hover:bg-info-600 disabled:opacity-60"><Search size={16} />{loading ? "Searching" : "Search"}</button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Loads periods from `GET /api/power-bonus/get-dates`, searches `GET /api/admin/power-bonus?page=1&from={from}&to={to}`, and pays with `POST /api/admin/power-bonus`.
          </p>
        </form>
      </section>

      <CommissionTableShell title="Results" action={<button type="button" onClick={() => void pay(selectedIds)} className="inline-flex h-9 items-center gap-2 rounded-md bg-green-600 px-3 text-sm font-medium text-white hover:bg-green-700"><Wallet size={16} />Pay All Agents</button>}>
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-gray-300 text-brand-500" /></th>
              {["Shop Name", "Bonus Rate", "Gross Profit", "Monthly Bonus", "Power Bonus", "Rate", "Total Stake", "Total Stake Target", "Total Tickets", "Total Tickets Target", "Total Weighted Stake", "Total Winnings", "Turnover Commission", ""].map((head) => <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {rows.map((row) => (
              <tr key={String(row.shopId)}>
                <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(row.shopId)} onChange={() => setSelectedIds((current) => current.includes(row.shopId) ? current.filter((id) => id !== row.shopId) : [...current, row.shopId])} className="h-4 w-4 rounded border-gray-300 text-brand-500" /></td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{row.shopName}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.bonusRate}</td>
                {[row.grossProfit, row.monthlyBonus, row.powerBonus].map((value, index) => <td key={index} className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(value)}</td>)}
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.rate}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.totalStake)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.totalStakeTarget)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.totalTickets.toLocaleString()}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.totalTicketsTarget.toLocaleString()}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.totalWeightedStake)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.totalWinnings)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.turnoverCommissions)}</td>
                <td className="whitespace-nowrap px-4 py-3"><button type="button" onClick={() => void pay([row.shopId])} className="h-8 rounded-md bg-brand-500 px-3 text-xs font-medium text-white">Pay</button></td>
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={15} className="px-4 py-8 text-center text-sm text-gray-500">{loading ? "Loading commissions" : "No commissions found"}</td></tr> : null}
          </tbody>
        </table>
        <PaginationSummary pagination={pagination} onPage={(page) => void calculate(page)} />
      </CommissionTableShell>
    </div>
  );
}

function ProviderSelect({ value, onChange }: { value: Provider; onChange: (value: Provider) => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value as Provider)} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
      {providers.map((provider) => <option key={provider.value} value={provider.value}>{provider.label}</option>)}
    </select>
  );
}

function DateInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="relative block">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
    </label>
  );
}

function CommissionTableShell({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
        {action}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function PaginationSummary({ pagination, onPage }: { pagination: Pagination; onPage: (page: number) => void }) {
  const lastPage = pagination.last_page ?? Math.max(1, Math.ceil((pagination.total || 0) / (pagination.per_page || 1)));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
      <span>Showing {pagination.total ? `${pagination.from} to ${pagination.to} of ${pagination.total}` : "0"} entries</span>
      <div className="flex gap-2">
        <button type="button" disabled={pagination.current_page <= 1} onClick={() => onPage(pagination.current_page - 1)} className="h-8 rounded-md border border-gray-300 px-3 disabled:opacity-40 dark:border-gray-700">Prev</button>
        <button type="button" disabled={pagination.current_page >= lastPage} onClick={() => onPage(pagination.current_page + 1)} className="h-8 rounded-md border border-gray-300 px-3 disabled:opacity-40 dark:border-gray-700">Next</button>
      </div>
    </div>
  );
}

function CommissionProfileModal({ profile, onClose }: { profile: CommissionProfile; onClose: () => void }) {
  const turnovers = profile.turnovers ?? [];
  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-950">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Commission Profile</h2>
          <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 dark:border-gray-700"><X size={16} /></button>
        </div>
        <div className="space-y-4 p-5">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              <ProfileRow label="Name" value={String(profile.name ?? "-")} />
              <ProfileRow label="Provider Group" value={String(profile.providerGroup ?? "-")} />
              <ProfileRow label="Period" value={String(profile.period ?? "-")} />
              <ProfileRow label="Commission Type" value={`Turnover (${profile.period ?? "-"})`} />
              <ProfileRow label="Type" value={String(profile.calculationType ?? "-")} />
              {profile.calculationType === "flat" ? <ProfileRow label="Percentage" value={String(profile.percentage ?? "-")} /> : null}
            </tbody>
          </table>
          {turnovers.length ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="border-b border-gray-200 bg-brand-500 px-4 py-3 text-sm font-semibold text-white dark:border-gray-800">TURNOVER</div>
              <div className="space-y-3 p-4">
                {turnovers.map((turnover, index) => {
                  const oddSet = turnover.odd_set ?? turnover.oddSet;
                  return (
                    <div key={index} className="grid gap-2 rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800 md:grid-cols-4">
                      <ReadOnlyField label="Events" value={String(turnover.event ?? "-")} />
                      <ReadOnlyField label="Percentage" value={String(turnover.percentage ?? "-")} />
                      {oddSet ? <ReadOnlyField label="Odds >=" value={String(turnover.min_odd ?? turnover.minOdd ?? "0.00")} /> : null}
                      {oddSet ? <ReadOnlyField label="Odds <=" value={String(turnover.max_odd ?? turnover.maxOdd ?? "0.00")} /> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="w-1/3 px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{label}</td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{value}</td>
    </tr>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{label}</span>
      <input readOnly value={value} className="mt-1 h-9 w-full rounded-md border border-gray-300 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
    </label>
  );
}
