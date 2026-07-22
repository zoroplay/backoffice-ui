"use client";

import { useMemo, useState } from "react";
import { Fragment } from "react";
import { Calendar, ChevronDown, ChevronRight, Search } from "lucide-react";

type CommissionType = "" | "sports" | "virtual" | "casino";

type BetInfo = {
  type: string;
  startDate: string;
  totalTickets: number;
  selectionsCount: number;
  stake: number;
  commissionBand: number;
  commission: number;
};

type CommissionReportRow = {
  id: string;
  channel: CommissionType;
  channelName: string;
  settledDate: string;
  totalTickets: number;
  totalSales: number;
  commissionBand: number;
  commission: number;
  betInfo: BetInfo[];
};

const commissionTypes: { name: string; id: CommissionType }[] = [
  { name: "All", id: "" },
  { name: "Sports", id: "sports" },
  { name: "Virtual", id: "virtual" },
  { name: "Casino", id: "casino" },
];

const reportRows: CommissionReportRow[] = [
  {
    id: "sports-20260722",
    channel: "sports",
    channelName: "Sports",
    settledDate: "22/07/2026",
    totalTickets: 842,
    totalSales: 2800000,
    commissionBand: 7.5,
    commission: 210000,
    betInfo: [
      { type: "Single", startDate: "22/07/2026", totalTickets: 312, selectionsCount: 1, stake: 820000, commissionBand: 5, commission: 41000 },
      { type: "Multiple", startDate: "22/07/2026", totalTickets: 530, selectionsCount: 4, stake: 1980000, commissionBand: 8.5, commission: 168300 },
    ],
  },
  {
    id: "virtual-20260722",
    channel: "virtual",
    channelName: "Virtual",
    settledDate: "22/07/2026",
    totalTickets: 420,
    totalSales: 950000,
    commissionBand: 4,
    commission: 38000,
    betInfo: [
      { type: "Virtual Football", startDate: "22/07/2026", totalTickets: 240, selectionsCount: 1, stake: 580000, commissionBand: 4, commission: 23200 },
      { type: "Virtual Racing", startDate: "22/07/2026", totalTickets: 180, selectionsCount: 1, stake: 370000, commissionBand: 4, commission: 14800 },
    ],
  },
  {
    id: "casino-20260721",
    channel: "casino",
    channelName: "Casino",
    settledDate: "21/07/2026",
    totalTickets: 95,
    totalSales: 625000,
    commissionBand: 3,
    commission: 18750,
    betInfo: [
      { type: "Slots", startDate: "21/07/2026", totalTickets: 80, selectionsCount: 1, stake: 510000, commissionBand: 3, commission: 15300 },
      { type: "Live Casino", startDate: "21/07/2026", totalTickets: 15, selectionsCount: 1, stake: 115000, commissionBand: 3, commission: 3450 },
    ],
  },
];

function money(value: number) {
  return `NGN ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function CommissionReportingClient() {
  const [channel, setChannel] = useState<CommissionType>("sports");
  const [from, setFrom] = useState("22-07-2026");
  const [to, setTo] = useState("22-07-2026");
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(true);

  const filteredRows = useMemo(
    () => reportRows.filter((row) => !channel || row.channel === channel),
    [channel],
  );

  const totalCommission = filteredRows.reduce((sum, row) => sum + row.commission, 0);
  const totalStake = filteredRows.reduce((sum, row) => sum + row.totalSales, 0);

  function toggleRow(rowId: string) {
    setExpandedRows((current) =>
      current.includes(rowId) ? current.filter((id) => id !== rowId) : [...current, rowId],
    );
  }

  function filterReports() {
    setHasSearched(true);
    setExpandedRows([]);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <select
            value={channel}
            onChange={(event) => setChannel(event.target.value as CommissionType)}
            className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            {commissionTypes.map((type) => (
              <option key={type.id || "all"} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <DateInput value={from} onChange={setFrom} />
          <DateInput value={to} onChange={setTo} />
          <button
            type="button"
            onClick={filterReports}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Search size={16} />
            Filter
          </button>
        </div>
        <div className="mt-4 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
          GET https://ourbet.net/api/commissions/reports?from={from}&to={to}&type={channel || "all"}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Results</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Click a channel row to review the underlying commission calculation lines.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
              <div className="text-xs text-gray-500 dark:text-gray-400">Stake</div>
              <div className="font-semibold text-gray-900 dark:text-white">{money(totalStake)}</div>
            </div>
            <div className="rounded-md bg-gray-50 px-3 py-2 dark:bg-white/[0.03]">
              <div className="text-xs text-gray-500 dark:text-gray-400">Commission</div>
              <div className="font-semibold text-gray-900 dark:text-white">{money(totalCommission)}</div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {["Channel Name", "Settled Date", "Coupon Count", "No of Selections", "Stake", "Commission Band", "Commission Estimate"].map((head) => (
                  <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {filteredRows.map((row) => {
                const expanded = expandedRows.includes(row.id);
                return (
                  <Fragment key={row.id}>
                    <tr className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03]" onClick={() => toggleRow(row.id)}>
                      <td className="px-4 py-3 font-medium capitalize text-gray-900 dark:text-white">
                        <span className="inline-flex items-center gap-2">
                          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          {row.channelName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.settledDate}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.totalTickets}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">-</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.totalSales)}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.commissionBand}%</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.commission)}</td>
                    </tr>
                    {expanded ? (
                      <tr>
                        <td colSpan={7} className="bg-gray-50 px-4 py-3 dark:bg-white/[0.03]">
                          <table className="min-w-full text-sm">
                            <tbody>
                              {row.betInfo.map((item, index) => (
                                <tr key={`${row.id}-${item.type}-${index}`}>
                                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.type}</td>
                                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.startDate}</td>
                                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.totalTickets}</td>
                                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.selectionsCount}</td>
                                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{money(item.stake)}</td>
                                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.commissionBand}%</td>
                                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{money(item.commission)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
              {!filteredRows.length && hasSearched ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No commission records found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
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
        placeholder="DD-MM-YYYY"
        className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />
    </label>
  );
}
