"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Calendar, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import Button from "@/components/ui/button/Button";
import { GETREQUEST } from "@/utils/base_request";
import { withAuth } from "@/utils/withAuth";
import {
  asRecord,
  rowValue,
  toNumber,
  type AnyRecord,
} from "@/app/(admin)/tickets/components/ticketApiHelpers";

type CommissionType = "" | "sports" | "virtual" | "casino";

type BetInfo = {
  type: string;
  startDate: string;
  totalTickets: number;
  selectionsCount: ReactNode;
  stake: number;
  commissionBand: ReactNode;
  commission: number;
};

type CommissionReportRow = {
  id: string;
  channel: string;
  createdAt: string;
  totalTickets: number;
  totalSales: number;
  commissionBand: ReactNode;
  commission: number;
  betInfo: BetInfo[];
};

const commissionTypes: { name: string; id: CommissionType }[] = [
  { name: "All", id: "" },
  { name: "Sports", id: "sports" },
  { name: "Virtual", id: "virtual" },
  { name: "Casino", id: "casino" },
];

function todayDDMMYYYY() {
  const date = new Date();
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}`;
}

function recordsFrom(value: unknown): AnyRecord[] {
  if (Array.isArray(value)) return value.map(asRecord);

  const body = asRecord(value);
  if (Array.isArray(body.data)) return body.data.map(asRecord);
  if (Array.isArray(asRecord(body.data).data)) return asRecord(body.data).data.map(asRecord);

  return [];
}

function formatDate(value: unknown) {
  if (!value) return "-";

  const raw = String(value);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;
}

function formatNumber(value: unknown) {
  const parsed = toNumber(value);
  return parsed.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function mapBetInfo(value: unknown, index: number): BetInfo {
  const item = asRecord(value);

  return {
    type: String(rowValue(item, ["type"], `Item ${index + 1}`)),
    startDate: String(rowValue(item, ["start_date", "startDate"], "")),
    totalTickets: toNumber(rowValue(item, ["total_tickets", "totalTickets"], 0)),
    selectionsCount: rowValue(item, ["selections_count", "selectionsCount"], "-"),
    stake: toNumber(rowValue(item, ["stake"], 0)),
    commissionBand: rowValue(item, ["commission_band", "commissionBand"], "-"),
    commission: toNumber(rowValue(item, ["commission"], 0)),
  };
}

function mapReportRow(value: unknown, index: number): CommissionReportRow {
  const row = asRecord(value);
  const betInfo = Array.isArray(row.bet_info)
    ? row.bet_info.map(mapBetInfo)
    : Array.isArray(row.betInfo)
      ? row.betInfo.map(mapBetInfo)
      : [];

  return {
    id: String(rowValue(row, ["id"], `${rowValue(row, ["channel"], "channel")}-${index}`)),
    channel: String(rowValue(row, ["channel"], "")),
    createdAt: String(rowValue(row, ["created_at", "createdAt"], "")),
    totalTickets: toNumber(rowValue(row, ["total_tickets", "totalTickets"], 0)),
    totalSales: toNumber(rowValue(row, ["total_sales", "totalSales"], 0)),
    commissionBand: rowValue(row, ["commission_band", "commissionBand"], "-"),
    commission: toNumber(rowValue(row, ["commission"], 0)),
    betInfo,
  };
}

function CommissionReportingClient() {
  const [channel, setChannel] = useState<CommissionType>("sports");
  const [from, setFrom] = useState(todayDDMMYYYY());
  const [to, setTo] = useState(todayDDMMYYYY());
  const [rows, setRows] = useState<CommissionReportRow[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function getReports() {
    setLoading(true);
    const query = new URLSearchParams({
      from,
      to,
      type: channel,
    });
    const response = await GETREQUEST<any>(
      `https://ourbet.net/api/commissions/reports?${query.toString()}`
    );
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "Unable to fetch commission reports");
      return;
    }

    setRows(recordsFrom(response.data).map(mapReportRow));
    setExpandedRows([]);
  }

  useEffect(() => {
    void getReports();
  }, []);

  function toggleRow(rowId: string) {
    setExpandedRows((current) =>
      current.includes(rowId)
        ? current.filter((id) => id !== rowId)
        : [...current, rowId]
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <select
            value={channel}
            onChange={(event) => setChannel(event.target.value as CommissionType)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            {commissionTypes.map((type) => (
              <option key={type.id || "all"} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <DateInput value={from} onChange={setFrom} />
          <DateInput value={to} onChange={setTo} />
          <Button type="button" onClick={() => void getReports()} disabled={loading}>
            {loading ? "Filtering..." : "Filter"}
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 bg-brand-500 px-5 py-3 text-white dark:border-gray-800">
          <h2 className="text-base font-semibold">Results</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500 dark:text-gray-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading commission reports...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <Th>Channel Name</Th>
                  <Th>Settled Date</Th>
                  <Th>Coupon Count</Th>
                  <Th>No of Selections</Th>
                  <Th>Stake</Th>
                  <Th>Commission Band</Th>
                  <Th>Commission Estimate</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                {rows.map((row) => {
                  const expanded = expandedRows.includes(row.id);

                  return (
                    <Fragment key={row.id}>
                      <tr
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                        onClick={() => toggleRow(row.id)}
                      >
                        <Td>
                          <span className="inline-flex items-center gap-2 capitalize">
                            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            {row.channel || "-"}
                          </span>
                        </Td>
                        <Td>{formatDate(row.createdAt)}</Td>
                        <Td>{formatNumber(row.totalTickets)}</Td>
                        <Td>-</Td>
                        <Td>{formatNumber(row.totalSales)}</Td>
                        <Td>{row.commissionBand}</Td>
                        <Td>{formatNumber(row.commission)}</Td>
                      </tr>
                      {expanded ? (
                        <tr>
                          <td colSpan={7} className="bg-gray-50 px-4 py-3 dark:bg-white/[0.03]">
                            <table className="min-w-full text-sm">
                              <tbody>
                                {row.betInfo.map((item, index) => (
                                  <tr key={`${row.id}-${item.type}-${index}`}>
                                    <Td>{item.type}</Td>
                                    <Td>{formatDate(item.startDate)}</Td>
                                    <Td>{formatNumber(item.totalTickets)}</Td>
                                    <Td>{item.selectionsCount}</Td>
                                    <Td>{formatNumber(item.stake)}</Td>
                                    <Td>{item.commissionBand}%</Td>
                                    <Td>{formatNumber(item.commission)}</Td>
                                  </tr>
                                ))}
                                {!row.betInfo.length ? (
                                  <tr>
                                    <Td colSpan={7}>No detail rows</Td>
                                  </tr>
                                ) : null}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
                {!rows.length ? (
                  <tr>
                    <Td colSpan={7}>No commission records found</Td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
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
        className="h-10 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />
    </label>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
      {children}
    </th>
  );
}

function Td({ children, colSpan }: { children: ReactNode; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
      {children}
    </td>
  );
}

export default withAuth(CommissionReportingClient);
