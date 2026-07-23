"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";
import { withAuth } from "@/utils/withAuth";

type FilterData = {
  period: string;
  from: string;
  to: string;
  filterType: string;
  betType: string;
  clientId: string;
  minAmount: string;
  maxAmount: string;
  depositCount: string;
};

type Segment = {
  id?: string | number;
  segmentId?: string | number;
  title?: string;
  name?: string;
  segmentName?: string;
};

type Bonus = {
  id?: string | number;
  name?: string;
  bonusAmount?: string | number;
  amount?: string | number;
};

type Player = {
  id: string | number;
  username?: string;
  registered?: string;
  email?: string;
  phoneNumber?: string;
  deposits?: string | number;
  depositCount?: string | number;
  bonus?: string | number;
  bets?: string | number;
  stake?: string | number;
  balance?: string | number;
  verified?: string | number;
  status?: string | number;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateTime(date: Date, endOfDay = false) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${
    endOfDay ? "23:59:59" : "00:00:00"
  }`;
}

function startOfIsoWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  return copy;
}

function endOfIsoWeek(date: Date) {
  const copy = startOfIsoWeek(date);
  copy.setDate(copy.getDate() + 6);
  return copy;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function clientId() {
  return process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
}

function defaultFilters(): FilterData {
  const today = new Date();

  return {
    period: "today",
    from: formatDateTime(today),
    to: formatDateTime(today, true),
    filterType: "",
    betType: "",
    clientId: clientId(),
    minAmount: "",
    maxAmount: "",
    depositCount: "",
  };
}

function dateRangeForPeriod(period: string, current: FilterData): FilterData {
  const today = new Date();
  const next = { ...current, period };

  switch (period) {
    case "today":
      next.from = formatDateTime(today);
      next.to = formatDateTime(today, true);
      break;
    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      next.from = formatDateTime(yesterday);
      next.to = formatDateTime(yesterday, true);
      break;
    }
    case "current_week":
      next.from = formatDateTime(startOfIsoWeek(today));
      next.to = formatDateTime(endOfIsoWeek(today), true);
      break;
    case "last_week": {
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      next.from = formatDateTime(startOfIsoWeek(lastWeek));
      next.to = formatDateTime(endOfIsoWeek(lastWeek), true);
      break;
    }
    case "current_month":
      next.from = formatDateTime(startOfMonth(today));
      next.to = formatDateTime(endOfMonth(today), true);
      break;
    case "last_month": {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      next.from = formatDateTime(startOfMonth(lastMonth));
      next.to = formatDateTime(endOfMonth(lastMonth), true);
      break;
    }
    case "last_30_days": {
      const from = new Date(today);
      from.setDate(from.getDate() - 30);
      next.from = formatDateTime(from);
      next.to = formatDateTime(today, true);
      break;
    }
    default:
      break;
  }

  return next;
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: unknown) {
  return toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function verifiedLabel(value: unknown) {
  return Number(value) === 1 ? "Yes" : "No";
}

function statusLabel(value: unknown) {
  if (Number(value) === 0) return "Pending";
  if (Number(value) === 1) return "Active";
  if (Number(value) === 2) return "Frozen";
  if (Number(value) === 3) return "Terminated";
  return "-";
}

function normalizeList(value: any) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function GrantMassBonusesPage() {
  const [filters, setFilters] = useState<FilterData>(() => defaultFilters());
  const [savedSegments, setSavedSegments] = useState<Segment[]>([]);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [selectedBonusId, setSelectedBonusId] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [granting, setGranting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const selectedBonus = useMemo(
    () => bonuses.find((bonus) => String(bonus.id) === selectedBonusId) ?? null,
    [bonuses, selectedBonusId],
  );
  const selectAll = players.length > 0 && selectedIds.length === players.length;

  async function getBonuses() {
    const response = await GETREQUEST<any>(`/admin/bonus/list?clientId=${clientId()}`);
    const body = response.data ?? {};

    if (!response.ok) {
      toast.error(response.error || body.message || "Unable to fetch bonuses");
      setBonuses([]);
      return;
    }

    setBonuses(Array.isArray(body.bonus) ? body.bonus : normalizeList(body));
  }

  async function fetchSavedSegments() {
    setSegmentsLoading(true);
    const response = await GETREQUEST<any>(`/admin/player-management/segments?clientId=${clientId()}`);
    const body = response.data ?? {};
    setSegmentsLoading(false);

    if (!response.ok) {
      toast.error(response.error || body.message || "Unable to fetch saved segments");
      setSavedSegments([]);
      return;
    }

    setSavedSegments(normalizeList(body?.data ?? body));
  }

  async function getResults(page = 1) {
    setLoading(true);
    setPlayers([]);
    setSelectedIds([]);
    setSelectedUsernames([]);

    const query = new URLSearchParams({
      clientId: filters.clientId,
      filterType: filters.filterType,
      startDate: filters.from,
      endDate: filters.to,
      minAmount: filters.minAmount,
      maxAmount: filters.maxAmount,
      depositCount: filters.depositCount,
      page: String(page),
    });
    const response = await GETREQUEST<any>(`/admin/players/filter?${query.toString()}`);
    const body = response.data ?? {};
    setLoading(false);

    if (!response.ok) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    setPlayers(Array.isArray(body.data) ? body.data : normalizeList(body));
    setCurrentPage(page);
  }

  function resetFilter() {
    setFilters(defaultFilters());
    setSelectedIds([]);
    setSelectedUsernames([]);
    setPlayers([]);
  }

  function toggleAll(checked: boolean) {
    if (!checked) {
      setSelectedIds([]);
      setSelectedUsernames([]);
      return;
    }

    setSelectedIds(players.map((player) => player.id));
    setSelectedUsernames(players.map((player) => player.username).filter(Boolean) as string[]);
  }

  function togglePlayer(checked: boolean, player: Player) {
    if (checked) {
      setSelectedIds((current) => [...current, player.id]);
      if (player.username) setSelectedUsernames((current) => [...current, player.username as string]);
      return;
    }

    setSelectedIds((current) => current.filter((id) => id !== player.id));
    setSelectedUsernames((current) => current.filter((username) => username !== player.username));
  }

  async function grantMassBonus() {
    if (!selectedBonus) {
      toast.error("Please select a bonus");
      return;
    }

    if (!selectedIds.length) {
      toast.error("Please select at least one player");
      return;
    }

    setGranting(true);
    const response = await POSTREQUEST<any>(`/admin/bonus/award?client_id=${clientId()}`, {
      username: selectedUsernames.toString(),
      userId: selectedIds.toString(),
      bonusId: selectedBonus.id,
      amount: selectedBonus.bonusAmount ?? selectedBonus.amount,
    });
    const body = response.data ?? {};
    setGranting(false);

    if (!response.ok || ![200, 201].includes(Number(body.status))) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    toast.success(body.message || "Bonus granted");
    setSelectedIds([]);
    setSelectedUsernames([]);
  }

  useEffect(() => {
    getBonuses();
    fetchSavedSegments();
  }, []);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Grant Mass Bonuses" />

      <form
        className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950"
        onSubmit={(event) => {
          event.preventDefault();
          getResults(1);
        }}
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr_1.4fr_1.5fr]">
          <select
            value={filters.period}
            onChange={(event) => setFilters((current) => dateRangeForPeriod(event.target.value, current))}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {[
              ["today", "Today"],
              ["yesterday", "Yesterday"],
              ["current_week", "Current Week"],
              ["last_week", "Last Week"],
              ["current_month", "Current Month"],
              ["last_month", "Last Month"],
              ["last_30_days", "Last 30 Days"],
              ["date_range", "Date Range"],
            ].map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            value={filters.from}
            onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <input
            value={filters.to}
            onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <select
            value={filters.filterType}
            disabled={segmentsLoading}
            onChange={(event) => setFilters((current) => ({ ...current, filterType: event.target.value }))}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">Segment Type</option>
            {savedSegments.map((segment, index) => (
              <option key={segment.id ?? segment.segmentId ?? index} value={String(index + 1)}>
                {segment.title || segment.name || segment.segmentName || "Unnamed segment"}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {filters.filterType === "5" ? (
            <select
              value={filters.betType}
              onChange={(event) => setFilters((current) => ({ ...current, betType: event.target.value }))}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">Bet Type</option>
              <option value="Single">Single Bet</option>
              <option value="Multiple">Multiple Bet</option>
              <option value="Combo">System Bet</option>
              <option value="Split">Split Bet</option>
            </select>
          ) : null}
          {["2", "4", "5"].includes(filters.filterType) ? (
            <>
              <input
                value={filters.minAmount}
                onChange={(event) => setFilters((current) => ({ ...current, minAmount: event.target.value }))}
                placeholder="From"
                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              />
              <input
                value={filters.maxAmount}
                onChange={(event) => setFilters((current) => ({ ...current, maxAmount: event.target.value }))}
                placeholder="To"
                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              />
            </>
          ) : null}
          {filters.filterType === "3" ? (
            <input
              value={filters.depositCount}
              onChange={(event) => setFilters((current) => ({ ...current, depositCount: event.target.value }))}
              placeholder="Deposit count"
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" />
            Enable Paging
          </label>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
            <Button type="button" variant="outline" onClick={resetFilter}>
              clear all filters
            </Button>
          </div>
        </div>
      </form>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Results</h2>
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedBonusId}
              onChange={(event) => setSelectedBonusId(event.target.value)}
              className="h-10 min-w-60 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-950"
            >
              <option value="">Select Bonus</option>
              {bonuses.map((bonus) => (
                <option key={bonus.id} value={String(bonus.id)}>
                  {bonus.name}
                </option>
              ))}
            </select>
            <Button type="button" onClick={grantMassBonus} disabled={granting || !selectedBonusId || !selectedIds.length}>
              {granting ? "Granting..." : "Grant Bonus"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto p-5">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2 text-center">
                  <input type="checkbox" checked={selectAll} onChange={(event) => toggleAll(event.target.checked)} />
                </th>
                <Header>Username</Header>
                <Header>Date Joined</Header>
                <Header>Email</Header>
                <Header>Phone</Header>
                {filters.filterType === "4" ? <Header>Total Bet</Header> : null}
                {filters.filterType === "4" ? <Header>Total Stake</Header> : null}
                {filters.filterType === "2" ? <Header>Total Deposit</Header> : null}
                {filters.filterType === "3" ? <Header>Deposit Count</Header> : null}
                <Header>Balance</Header>
                {filters.filterType === "1" ? <Header>Bonuses</Header> : null}
                <Header>Verified</Header>
                <Header>Status</Header>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {loading ? (
                <tr>
                  <td colSpan={13} className="px-3 py-10 text-center text-gray-500 dark:text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : null}
              {!loading && !players.length ? (
                <tr>
                  <td colSpan={13} className="px-3 py-10 text-center text-gray-500 dark:text-gray-400">
                    No data
                  </td>
                </tr>
              ) : null}
              {!loading
                ? players.map((player) => (
                    <tr key={player.id}>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(player.id)}
                          onChange={(event) => togglePlayer(event.target.checked, player)}
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <Link href={`/player-management/player-info/${player.id}`} className="text-brand-600 dark:text-brand-400">
                          {player.username ?? "-"}
                        </Link>
                      </td>
                      <Cell>{formatDate(player.registered)}</Cell>
                      <Cell>{player.email ?? "-"}</Cell>
                      <Cell>{player.phoneNumber ?? "-"}</Cell>
                      {filters.filterType === "2" ? <Cell>{formatNumber(player.deposits)}</Cell> : null}
                      {filters.filterType === "3" ? <Cell>{player.depositCount ?? "-"}</Cell> : null}
                      {filters.filterType === "1" ? <Cell>{formatNumber(player.bonus)}</Cell> : null}
                      {filters.filterType === "4" ? <Cell>{player.bets ?? "-"}</Cell> : null}
                      {filters.filterType === "4" ? <Cell>{formatNumber(player.stake)}</Cell> : null}
                      <Cell>{formatNumber(player.balance)}</Cell>
                      <td className={`whitespace-nowrap px-3 py-2 ${Number(player.verified) === 1 ? "text-green-600" : "text-red-600"}`}>
                        {verifiedLabel(player.verified)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{statusLabel(player.status)}</td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={currentPage <= 1 || loading} onClick={() => getResults(currentPage - 1)}>
              Previous
            </Button>
            <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">Page {currentPage}</span>
            <Button type="button" variant="outline" disabled={!players.length || loading} onClick={() => getResults(currentPage + 1)}>
              Next
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">{children}</th>;
}

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{children}</td>;
}

export default withAuth(GrantMassBonusesPage);
