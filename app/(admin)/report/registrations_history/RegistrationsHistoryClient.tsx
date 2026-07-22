"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar, Search, X } from "lucide-react";

type Period =
  | "today"
  | "yesterday"
  | "current_week"
  | "last_week"
  | "current_month"
  | "last_month"
  | "last_30_days"
  | "date_range";

type GroupBy = "day" | "month" | "state" | "player" | "product" | "client_type";

type FilterState = {
  period: Period;
  state: string;
  productType: string;
  from: string;
  to: string;
  clientType: string;
  deposited: string;
  verified: string;
  groupBy: GroupBy;
};

type RegistrationRow = {
  id: string;
  playerId: string;
  username: string;
  date: string;
  month: string;
  state: string;
  productType: "sports" | "casino" | "games" | "Virtual";
  clientType: "website" | "mobile" | "cashier";
  deposited: "yes" | "no";
  verified: "email_verified" | "email_not_verified" | "mobile_verified" | "mobile_not_verified";
  count: number;
};

const registrations: RegistrationRow[] = [
  { id: "reg-1", playerId: "USR-2024001", username: "john_doe", date: "22/07/2026", month: "July 2026", state: "Lagos", productType: "sports", clientType: "website", deposited: "yes", verified: "email_verified", count: 1 },
  { id: "reg-2", playerId: "USR-2024002", username: "mary_j", date: "22/07/2026", month: "July 2026", state: "Abuja", productType: "casino", clientType: "mobile", deposited: "no", verified: "mobile_not_verified", count: 1 },
  { id: "reg-3", playerId: "USR-2024003", username: "retail_user_09", date: "21/07/2026", month: "July 2026", state: "Rivers", productType: "games", clientType: "cashier", deposited: "yes", verified: "mobile_verified", count: 1 },
  { id: "reg-4", playerId: "USR-2024004", username: "virtualfan", date: "20/07/2026", month: "July 2026", state: "Lagos", productType: "Virtual", clientType: "website", deposited: "no", verified: "email_not_verified", count: 1 },
];

const periodOptions: { value: Period; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "current_week", label: "Current Week" },
  { value: "last_week", label: "Last Week" },
  { value: "current_month", label: "Current Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "date_range", label: "Date Range" },
];

const groupOptions: { value: GroupBy; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "month", label: "Month" },
  { value: "state", label: "State" },
  { value: "player", label: "Player" },
  { value: "product", label: "Product" },
  { value: "client_type", label: "Client Type" },
];

function defaultFilters(): FilterState {
  return {
    period: "today",
    state: "",
    productType: "",
    from: "22-07-2026 00:00:00",
    to: "22-07-2026 23:59:59",
    clientType: "",
    deposited: "",
    verified: "",
    groupBy: "day",
  };
}

function rangeForPeriod(period: Period): Pick<FilterState, "from" | "to"> {
  switch (period) {
    case "yesterday":
      return { from: "21-07-2026 00:00:00", to: "21-07-2026 23:59:59" };
    case "current_week":
      return { from: "20-07-2026 00:00:00", to: "26-07-2026 23:59:59" };
    case "last_week":
      return { from: "13-07-2026 00:00:00", to: "19-07-2026 23:59:59" };
    case "current_month":
      return { from: "01-07-2026 00:00:00", to: "31-07-2026 23:59:59" };
    case "last_month":
      return { from: "01-06-2026 00:00:00", to: "30-06-2026 23:59:59" };
    case "last_30_days":
      return { from: "22-06-2026 00:00:00", to: "22-07-2026 23:59:59" };
    case "today":
    case "date_range":
    default:
      return { from: "22-07-2026 00:00:00", to: "22-07-2026 23:59:59" };
  }
}

function groupLabel(row: RegistrationRow, groupBy: GroupBy) {
  switch (groupBy) {
    case "month":
      return row.month;
    case "state":
      return row.state;
    case "product":
      return row.productType;
    case "client_type":
      return row.clientType;
    case "day":
    default:
      return row.date;
  }
}

export default function RegistrationsHistoryClient() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [paging, setPaging] = useState(true);
  const [activeGroupBy, setActiveGroupBy] = useState<GroupBy>("day");

  const filteredRows = useMemo(
    () =>
      registrations.filter((row) => {
        const matchesState = !filters.state || row.state === filters.state;
        const matchesProduct = !filters.productType || row.productType === filters.productType;
        const matchesClient = !filters.clientType || row.clientType === filters.clientType;
        const matchesDeposit = !filters.deposited || row.deposited === filters.deposited;
        const matchesVerification = !filters.verified || row.verified === filters.verified;
        return matchesState && matchesProduct && matchesClient && matchesDeposit && matchesVerification;
      }),
    [filters.clientType, filters.deposited, filters.productType, filters.state, filters.verified],
  );

  const groupedRows = useMemo(() => {
    if (activeGroupBy === "player") return [];
    const groups = new Map<string, number>();
    filteredRows.forEach((row) => {
      const key = groupLabel(row, activeGroupBy);
      groups.set(key, (groups.get(key) ?? 0) + row.count);
    });
    return [...groups.entries()].map(([label, count]) => ({ label, count }));
  }, [activeGroupBy, filteredRows]);

  function updatePeriod(period: Period) {
    setFilters((current) => ({ ...current, period, ...rangeForPeriod(period) }));
  }

  function search() {
    setActiveGroupBy(filters.groupBy);
  }

  function resetFilter() {
    setFilters(defaultFilters());
    setPaging(true);
    setActiveGroupBy("day");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <select value={filters.period} onChange={(event) => updatePeriod(event.target.value as Period)} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              {periodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <DateInput value={filters.from} onChange={(value) => setFilters((current) => ({ ...current, from: value, period: "date_range" }))} />
            <DateInput value={filters.to} onChange={(value) => setFilters((current) => ({ ...current, to: value, period: "date_range" }))} />
            <select value={filters.state} onChange={(event) => setFilters((current) => ({ ...current, state: event.target.value }))} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="">State</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Rivers">Rivers</option>
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <select value={filters.deposited} onChange={(event) => setFilters((current) => ({ ...current, deposited: event.target.value }))} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="">Deposited / Didn't Deposit</option>
              <option value="yes">Deposited</option>
              <option value="no">Didn't Deposit</option>
            </select>
            <select value={filters.productType} onChange={(event) => setFilters((current) => ({ ...current, productType: event.target.value }))} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="">Product Type</option>
              <option value="sports">Sports</option>
              <option value="casino">Casino</option>
              <option value="games">Games</option>
              <option value="Virtual">Virtual Sport</option>
            </select>
            <select value={filters.clientType} onChange={(event) => setFilters((current) => ({ ...current, clientType: event.target.value }))} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="">Client Type</option>
              <option value="website">Website</option>
              <option value="mobile">Mobile</option>
              <option value="cashier">Cashier</option>
            </select>
            <select value={filters.verified} onChange={(event) => setFilters((current) => ({ ...current, verified: event.target.value }))} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              <option value="">Email / Mobile Verification</option>
              <option value="email_verified">Email Verified</option>
              <option value="email_not_verified">Email Not Verified</option>
              <option value="mobile_verified">Mobile Phone Verified</option>
              <option value="mobile_not_verified">Mobile Phone Not Verified</option>
            </select>
          </div>

          <div className="space-y-3 rounded-md border border-gray-200 p-3 dark:border-gray-800">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Group By</div>
            <div className="flex flex-wrap gap-3">
              {groupOptions.map((option) => (
                <label key={option.value} className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    checked={filters.groupBy === option.value}
                    onChange={() => setFilters((current) => ({ ...current, groupBy: option.value }))}
                    className="h-4 w-4 border-gray-300 text-brand-500"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={paging} onChange={(event) => setPaging(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500" />
              Enable Paging
            </label>
            <button type="button" onClick={search} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-info-500 px-4 text-sm font-medium text-white hover:bg-info-600">
              <Search size={16} />
              Search
            </button>
            <button type="button" onClick={resetFilter} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-medium dark:border-gray-700">
              <X size={16} />
              Clear all filters
            </button>
            <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
              Users.getRegistrationHistory(filterData, page)
            </div>
          </div>
        </form>
      </section>

      {activeGroupBy === "player" ? (
        <PlayerResults rows={filteredRows} paging={paging} />
      ) : (
        <GroupedResults groupBy={activeGroupBy} rows={groupedRows} total={filteredRows.length} paging={paging} />
      )}
    </div>
  );
}

function GroupedResults({ groupBy, rows, total, paging }: { groupBy: GroupBy; rows: { label: string; count: number }[]; total: number; paging: boolean }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Results grouped by {groupBy.replace("_", " ")}</h2>
        <span className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:text-gray-300">Excel export</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Group</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Registrations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.label}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.count.toLocaleString()}</td>
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={2} className="px-4 py-8 text-center text-sm text-gray-500">No record found</td></tr> : null}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold dark:bg-gray-900">
            <tr>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Total</td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {paging ? <div className="border-t border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">Showing {rows.length} grouped rows</div> : null}
    </section>
  );
}

function PlayerResults({ rows, paging }: { rows: RegistrationRow[]; paging: boolean }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Player Registrations</h2>
        <span className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:text-gray-300">Excel export</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {["Registered At", "Player", "State", "Product", "Client Type", "Deposited", "Verification"].map((head) => (
                <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.date}</td>
                <td className="whitespace-nowrap px-4 py-3"><Link href={`/player-management/player-info/${row.playerId}`} className="font-medium text-brand-600 dark:text-brand-300">{row.username}</Link></td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.state}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.productType}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.clientType}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.deposited === "yes" ? "Deposited" : "Didn't Deposit"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.verified.replaceAll("_", " ")}</td>
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No record found</td></tr> : null}
          </tbody>
        </table>
      </div>
      {paging ? <div className="border-t border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">Showing 1 to {rows.length} of {rows.length} entries</div> : null}
    </section>
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
