"use client";

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

type TransactionType = "" | "credit" | "debit";

type FilterState = {
  period: Period;
  from: string;
  to: string;
  transactionType: TransactionType;
  transactionId: string;
  keyword: string;
  username: string;
};

type SystemTransaction = {
  id: string;
  createdAt: string;
  referenceNo: string;
  fromUser: string;
  toUser: string;
  subject: string;
  description: string;
  amount: number;
  transactionType: "credit" | "debit";
  fromUserBalance: number;
};

const pageSize = 3;

const systemTransactions: SystemTransaction[] = [
  {
    id: "sys-1001",
    createdAt: "22/07/2026 09:20:12",
    referenceNo: "SYS-1001",
    fromUser: "finance@sbe",
    toUser: "john_doe",
    subject: "Manual Credit",
    description: "Wallet adjustment for verified payout reversal",
    amount: 120000,
    transactionType: "credit",
    fromUserBalance: 380000,
  },
  {
    id: "sys-1002",
    createdAt: "22/07/2026 11:05:40",
    referenceNo: "SYS-1002",
    fromUser: "risk@sbe",
    toUser: "ticket-engine",
    subject: "Ticket Void",
    description: "Risk void on duplicated bet slip",
    amount: 42500,
    transactionType: "debit",
    fromUserBalance: 157500,
  },
  {
    id: "sys-1003",
    createdAt: "22/07/2026 12:17:08",
    referenceNo: "SYS-1003",
    fromUser: "admin@sbe",
    toUser: "bonus-wallet",
    subject: "Bonus Adjustment",
    description: "Campaign bonus correction",
    amount: 15000,
    transactionType: "debit",
    fromUserBalance: 985000,
  },
  {
    id: "sys-1004",
    createdAt: "21/07/2026 18:42:55",
    referenceNo: "SYS-1004",
    fromUser: "cashier-345678-1",
    toUser: "shop-lagos-12",
    subject: "Cash Transfer",
    description: "Retail float transfer",
    amount: 75000,
    transactionType: "credit",
    fromUserBalance: 225000,
  },
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

function defaultFilters(): FilterState {
  return {
    period: "today",
    from: "22-07-2026 00:00:00",
    to: "22-07-2026 23:59:59",
    transactionType: "",
    transactionId: "",
    keyword: "",
    username: "",
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

function money(value: number, type?: TransactionType) {
  const sign = type === "debit" ? "-" : "";
  return `NGN ${sign}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function SystemTransactionsClient() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [paging, setPaging] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const rows = useMemo(() => {
    const transactionId = filters.transactionId.trim().toLowerCase();
    const keyword = filters.keyword.trim().toLowerCase();
    const username = filters.username.trim().toLowerCase();
    return systemTransactions.filter((row) => {
      const matchesType = !filters.transactionType || row.transactionType === filters.transactionType;
      const matchesId = !transactionId || row.referenceNo.toLowerCase().includes(transactionId);
      const matchesKeyword =
        !keyword ||
        row.subject.toLowerCase().includes(keyword) ||
        row.description.toLowerCase().includes(keyword);
      const matchesUsername =
        !username ||
        row.fromUser.toLowerCase().includes(username) ||
        row.toUser.toLowerCase().includes(username);
      return matchesType && matchesId && matchesKeyword && matchesUsername;
    });
  }, [filters.keyword, filters.transactionId, filters.transactionType, filters.username]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = paging ? rows.slice((currentPage - 1) * pageSize, currentPage * pageSize) : rows;
  const totalAmount = rows.reduce((sum, row) => sum + (row.transactionType === "debit" ? -row.amount : row.amount), 0);

  function updatePeriod(period: Period) {
    setFilters((current) => ({ ...current, period, ...rangeForPeriod(period) }));
    setCurrentPage(1);
  }

  function resetFilter() {
    setFilters(defaultFilters());
    setPaging(true);
    setCurrentPage(1);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={filters.period}
              onChange={(event) => updatePeriod(event.target.value as Period)}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <DateInput value={filters.from} onChange={(value) => setFilters((current) => ({ ...current, from: value, period: "date_range" }))} />
            <DateInput value={filters.to} onChange={(value) => setFilters((current) => ({ ...current, to: value, period: "date_range" }))} />
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <select
              value={filters.transactionType}
              onChange={(event) => {
                setFilters((current) => ({ ...current, transactionType: event.target.value as TransactionType }));
                setCurrentPage(1);
              }}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Transaction Type</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
            <input
              value={filters.transactionId}
              onChange={(event) => setFilters((current) => ({ ...current, transactionId: event.target.value }))}
              placeholder="Transaction ID"
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <input
              value={filters.keyword}
              onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
              placeholder="Keyword"
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <input
              value={filters.username}
              onChange={(event) => setFilters((current) => ({ ...current, username: event.target.value }))}
              placeholder="Username"
              className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={paging} onChange={(event) => setPaging(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500" />
              Enable Paging
            </label>
            <button type="button" onClick={() => setCurrentPage(1)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-info-500 px-4 text-sm font-medium text-white hover:bg-info-600">
              <Search size={16} />
              Search
            </button>
            <button type="button" onClick={resetFilter} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 text-sm font-medium dark:border-gray-700">
              <X size={16} />
              Clear all filters
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Metric label="Transactions" value={rows.length.toLocaleString()} />
            <Metric label="Net Amount" value={money(Math.abs(totalAmount), totalAmount < 0 ? "debit" : "credit")} />
            <Metric label="Debits" value={rows.filter((row) => row.transactionType === "debit").length.toLocaleString()} />
          </div>

          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
            Reports.getSystemTransactions(filterData, page) with period, from, to, transaction_type, transaction_id, keyword, and username.
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Results</h2>
          <span className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:text-gray-300">
            Excel export
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {["Date", "Transaction ID", "From", "To", "Operation Type", "Description", "Amount", "Prev. Balance", "Balance"].map((head) => (
                  <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {visibleRows.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.createdAt}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.referenceNo}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">{row.fromUser}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">{row.toUser}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.subject}</td>
                  <td className="min-w-72 px-4 py-3 text-gray-700 dark:text-gray-300">{row.description}</td>
                  <td className={`whitespace-nowrap px-4 py-3 font-medium ${row.transactionType === "debit" ? "text-red-600 dark:text-red-300" : "text-gray-700 dark:text-gray-300"}`}>
                    {money(row.amount, row.transactionType)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                    {money(row.fromUserBalance + row.amount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.fromUserBalance)}</td>
                </tr>
              ))}
              {!visibleRows.length ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No record found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {paging ? (
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-800">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-700"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">Page {currentPage} of {pageCount}</span>
            <button
              type="button"
              disabled={currentPage === pageCount}
              onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-700"
            >
              Next
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function DateInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="relative block">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="font-semibold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}
