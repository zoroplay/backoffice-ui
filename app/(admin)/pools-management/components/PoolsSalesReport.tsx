"use client";

import { Fragment, useMemo, useState } from "react";

type SalesStatus = "Won" | "Lost" | "Cancelled" | "Pending";

type PoolTicket = {
  couponNo: string;
  placedOn: string;
  by: string;
  stake: number;
  odds?: number;
  potentialWinnings?: number;
  games?: number;
  gameType?: string;
  status: SalesStatus;
  settledAt: string;
};

type SalesRow = {
  shopId: string;
  username: string;
  noOfBets: number;
  sales: number;
  winnings: number;
  tickets: PoolTicket[];
};

const salesRows: SalesRow[] = [
  {
    shopId: "shop-184",
    username: "retail-main-184",
    noOfBets: 248,
    sales: 1240000,
    winnings: 820000,
    tickets: [
      { couponNo: "POOL-10001", placedOn: "22/07/2026 12:42:10", by: "player_184", stake: 5000, odds: 8.4, potentialWinnings: 42000, games: 6, gameType: "Pool 6", status: "Won", settledAt: "22/07/2026 18:14:00" },
      { couponNo: "POOL-10002", placedOn: "22/07/2026 13:05:44", by: "agent_shop_184", stake: 10000, odds: 5.2, potentialWinnings: 52000, games: 7, gameType: "Pool 7", status: "Pending", settledAt: "-" },
    ],
  },
  {
    shopId: "shop-091",
    username: "ibadan-shop-091",
    noOfBets: 119,
    sales: 410000,
    winnings: 285000,
    tickets: [
      { couponNo: "POOL-10033", placedOn: "22/07/2026 10:20:01", by: "player_091", stake: 3000, odds: 7.1, potentialWinnings: 21300, games: 5, gameType: "Pool 5", status: "Lost", settledAt: "22/07/2026 17:10:00" },
    ],
  },
  {
    shopId: "shop-027",
    username: "lagos-kiosk-027",
    noOfBets: 87,
    sales: 295000,
    winnings: 190000,
    tickets: [
      { couponNo: "POOL-10051", placedOn: "22/07/2026 09:12:19", by: "cashier_027", stake: 2500, odds: 6.8, potentialWinnings: 17000, games: 4, gameType: "Pool 4", status: "Cancelled", settledAt: "22/07/2026 15:45:00" },
    ],
  },
];

const periodOptions = [
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["current_week", "Current Week"],
  ["last_week", "Last Week"],
  ["current_month", "Current Month"],
  ["last_month", "Last Month"],
  ["last_30_days", "Last 30 Days"],
  ["date_range", "Date Range"],
];

const weekOptions = [
  ["2022-05-21", "Week 46"],
  ["2022-05-28", "Week 47"],
  ["2022-06-04", "Week 48"],
  ["2022-06-11", "Week 49"],
  ["2022-06-18", "Week 50"],
  ["2022-06-25", "Week 51"],
  ["2022-07-02", "Week 52"],
  ["2022-07-09", "Week 53"],
  ["2022-07-16", "Week 54"],
];

const statusOptions = [
  ["", "Status"],
  ["Lost", "Lost"],
  ["Won", "Won"],
  ["Cancelled", "Cancelled"],
];

function money(value: number) {
  return `NGN ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function calcGgr(sales: number, winnings: number) {
  return sales - winnings;
}

function calcMargin(sales: number, winnings: number) {
  if (!sales) return "0.00%";
  return `${((calcGgr(sales, winnings) / sales) * 100).toFixed(2)}%`;
}

function calcNgr(row: SalesRow) {
  return calcGgr(row.sales, row.winnings);
}

export default function PoolsSalesReport({
  variant,
}: {
  variant: "coupon-sales" | "sales-overview";
}) {
  const [expandedShopId, setExpandedShopId] = useState<string | null>(salesRows[0]?.shopId ?? null);
  const [period, setPeriod] = useState("today");
  const [status, setStatus] = useState("");
  const [paging, setPaging] = useState(true);

  const filteredRows = useMemo(() => {
    if (!status) return salesRows;
    return salesRows
      .map((row) => ({
        ...row,
        tickets: row.tickets.filter((ticket) => ticket.status === status),
      }))
      .filter((row) => row.tickets.length > 0);
  }, [status]);

  const totals = useMemo(
    () =>
      filteredRows.reduce(
        (acc, row) => ({
          tickets: acc.tickets + row.noOfBets,
          stake: acc.stake + row.sales,
          winnings: acc.winnings + row.winnings,
        }),
        { tickets: 0, stake: 0, winnings: 0 },
      ),
    [filteredRows],
  );

  const childColumns =
    variant === "coupon-sales"
      ? ["Coupon No", "Placed on", "By", "Stake", "Odds", "Pot. Winnings", "Status", "Bet Settled Date & Time", "Actions"]
      : ["Coupon No", "Placed on", "By", "Stake", "Games", "Game Type", "Status", "Bet Settled Date & Time", "Actions"];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="grid gap-4 md:grid-cols-5">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {periodOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input defaultValue="22-07-2026 00:00:00" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <input defaultValue="22-07-2026 23:59:59" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
            {weekOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={paging} onChange={(event) => setPaging(event.target.checked)} />
            Enable Paging
          </label>
          <button type="button" className="rounded-md bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600">
            Search
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Results</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Expand a shop row to review the child ticket table preserved from Nuxt.
            </p>
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Excel export enabled</span>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {["Name", "# of Bets", "Turnover", "Winnings", "GGR", "Margin (%)", "NGR"].map((head) => (
                  <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {filteredRows.map((row) => (
                <Fragment key={row.shopId}>
                  <tr key={row.shopId}>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">
                      <button
                        type="button"
                        onClick={() => setExpandedShopId(expandedShopId === row.shopId ? null : row.shopId)}
                        className="mr-2 text-brand-600 dark:text-brand-400"
                        aria-label={`Toggle ${row.username} tickets`}
                      >
                        {expandedShopId === row.shopId ? "v" : ">"}
                      </button>
                      {row.username}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.noOfBets.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.sales)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.winnings)}</td>
                    <td className={`whitespace-nowrap px-4 py-3 ${calcGgr(row.sales, row.winnings) < 0 ? "text-red-600" : "text-gray-700 dark:text-gray-300"}`}>{money(calcGgr(row.sales, row.winnings))}</td>
                    <td className={`whitespace-nowrap px-4 py-3 ${calcGgr(row.sales, row.winnings) < 0 ? "text-red-600" : "text-gray-700 dark:text-gray-300"}`}>{calcMargin(row.sales, row.winnings)}</td>
                    <td className={`whitespace-nowrap px-4 py-3 ${calcNgr(row) < 0 ? "text-red-600" : "text-gray-700 dark:text-gray-300"}`}>{money(calcNgr(row))}</td>
                  </tr>
                  {expandedShopId === row.shopId ? (
                    <tr key={`${row.shopId}-tickets`}>
                      <td colSpan={7} className="bg-gray-50 p-4 dark:bg-gray-900">
                        <table className="min-w-full divide-y divide-gray-200 text-xs dark:divide-gray-800">
                          <thead>
                            <tr>
                              {childColumns.map((head) => (
                                <th key={head} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
                                  {head}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {row.tickets.map((ticket) => (
                              <tr key={ticket.couponNo}>
                                <td className="whitespace-nowrap px-3 py-2 text-brand-600 dark:text-brand-400">{ticket.couponNo}</td>
                                <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{ticket.placedOn}</td>
                                <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{ticket.by}</td>
                                <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{money(ticket.stake)}</td>
                                {variant === "coupon-sales" ? (
                                  <>
                                    <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{ticket.odds}</td>
                                    <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{money(ticket.potentialWinnings ?? 0)}</td>
                                  </>
                                ) : (
                                  <>
                                    <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{ticket.games}</td>
                                    <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{ticket.gameType}</td>
                                  </>
                                )}
                                <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{ticket.status}</td>
                                <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{ticket.settledAt}</td>
                                <td className="whitespace-nowrap px-3 py-2">
                                  <div className="flex gap-1">
                                    {ticket.status !== "Lost" ? <button type="button" className="rounded border border-red-200 px-2 py-1 text-red-600">Cancel</button> : null}
                                    {ticket.status !== "Cancelled" ? <button type="button" className="rounded border border-red-200 px-2 py-1 text-red-600">Void</button> : null}
                                    {ticket.status !== "Won" ? <button type="button" className="rounded border border-green-200 px-2 py-1 text-green-600">Won</button> : null}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold dark:bg-gray-900">
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">Total</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">{totals.tickets.toLocaleString()}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">{money(totals.stake)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">{money(totals.winnings)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">{money(totals.stake - totals.winnings)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">{calcMargin(totals.stake, totals.winnings)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white" />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
