"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { toast } from "sonner";

import Button from "@/components/ui/button/Button";
import { useAuth } from "@/context/AuthContext";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";

type SalesVariant = "coupon-sales" | "sales-overview";

type FilterData = {
  period: string;
  from: string;
  to: string;
  week: string;
  client_type: string;
  status: string;
};

type Pagination = {
  total?: number;
  per_page?: number;
  from?: number;
  to?: number;
  current_page?: number;
  last_page?: number;
};

type SalesRow = {
  id?: string | number;
  shop_id?: string | number;
  shopId?: string | number;
  username?: string;
  no_of_bets?: number | string;
  sales?: number | string;
  winnings?: number | string;
};

type TicketUser = {
  id?: string | number;
  username?: string;
  role_id?: number | string;
};

type TicketRow = {
  id?: string | number;
  coupon_no?: string;
  created_at?: string;
  user?: TicketUser | null;
  user_id?: string | number;
  stake?: number | string;
  odds?: number | string;
  pot_winnings?: number | string;
  games?: number | string;
  game_type?: string;
  status?: number | string;
  settled_at?: string;
};

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
  ["2", "Lost"],
  ["1", "Won"],
  ["3", "Cancelled"],
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateTime(date: Date, endOfDay = false) {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${
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

function currentSaturday() {
  const date = new Date();
  date.setDate(date.getDate() + (6 - date.getDay()));
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function defaultFilters(): FilterData {
  const today = new Date();

  return {
    period: "today",
    from: formatDateTime(today),
    to: formatDateTime(today, true),
    week: currentSaturday(),
    client_type: "",
    status: "",
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

function formatNumber(value: unknown, currency = true) {
  const formatted = toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: currency ? 2 : 0,
    maximumFractionDigits: 2,
  });

  return currency ? formatted : formatted.replace(/\.00$/, "");
}

function calcGgr(sales: unknown, winnings: unknown) {
  return toNumber(sales) - toNumber(winnings);
}

function calcMargin(sales: unknown, winnings: unknown) {
  const salesValue = toNumber(sales);
  if (!salesValue) return "0%";
  return `${((calcGgr(sales, winnings) / salesValue) * 100).toFixed(2)}%`;
}

function getShopId(row: SalesRow) {
  return String(row.shop_id ?? row.shopId ?? row.id ?? "");
}

function getStatus(status: unknown) {
  if (Number(status) === 1) return "Won";
  if (Number(status) === 2) return "Lost";
  if (Number(status) === 3) return "Cancelled";
  return "Pending";
}

function statusClass(status: unknown) {
  const label = getStatus(status);
  if (label === "Won") return "text-green-600 dark:text-green-400";
  if (label === "Lost" || label === "Cancelled") return "text-red-600 dark:text-red-400";
  return "text-amber-600 dark:text-amber-400";
}

function clientId() {
  return process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
}

function salesEndpoint(variant: SalesVariant, page: number) {
  return variant === "coupon-sales"
    ? `/api/admin/pools/coupon-sales?page=${page}`
    : `/api/admin/pools/sales?page=${page}`;
}

function ticketsEndpoint(variant: SalesVariant, shopId: string, page: number) {
  return variant === "coupon-sales"
    ? `/api/admin/pools/coupon-tickets/${shopId}?page=${page}`
    : `/api/admin/pools/tickets/${shopId}?page=${page}`;
}

function childColumns(variant: SalesVariant) {
  return variant === "coupon-sales"
    ? ["Coupon No", "Placed on", "By", "Stake", "Odds", "Pot. Winnings", "Status", "Bet Settled Date & Time", ""]
    : ["Coupon No", "Placed on", "By", "Stake", "Games", "Game Type", "Status", "Bet Settled Date & Time", ""];
}

export default function PoolsSalesReport({ variant }: { variant: SalesVariant }) {
  const { can, session } = useAuth();
  const [filters, setFilters] = useState<FilterData>(() => defaultFilters());
  const [paging, setPaging] = useState(true);
  const [rows, setRows] = useState<SalesRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({});
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [ticketPagination, setTicketPagination] = useState<Pagination>({});
  const [expandedShopId, setExpandedShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingChild, setLoadingChild] = useState(false);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | number | null>(null);

  const totals = useMemo(
    () => ({
      tickets: rows.reduce((sum, row) => sum + toNumber(row.no_of_bets), 0),
      stake: rows.reduce((sum, row) => sum + toNumber(row.sales), 0),
      winnings: rows.reduce((sum, row) => sum + toNumber(row.winnings), 0),
    }),
    [rows],
  );

  const canAct = (permission: string) => !session?.permissions?.length || can(permission);

  async function getSales(page = 1) {
    setLoading(true);

    const response = await POSTREQUEST<any>(salesEndpoint(variant, page), filters);
    const body = response.data ?? {};
    const data = body.bets?.data;

    if (!response.ok || !Array.isArray(data)) {
      setRows([]);
      setPagination({});
      toast.error(response.error || body.message || "An error occured");
      setLoading(false);
      return;
    }

    setRows(data);
    setPagination(body.bets ?? {});
    setExpandedShopId(null);
    setTickets([]);
    setTicketPagination({});
    setLoading(false);
  }

  async function getTickets(page: number, shopId: string) {
    setLoadingChild(true);

    const response = await POSTREQUEST<any>(ticketsEndpoint(variant, shopId, page), filters);
    const body = response.data ?? {};
    const data = body.tickets?.data;

    if (!response.ok || !Array.isArray(data)) {
      setTickets([]);
      setTicketPagination({});
      toast.error(response.error || body.message || "An error occured");
      setLoadingChild(false);
      return;
    }

    setTickets(data);
    setTicketPagination(body.tickets ?? {});
    setLoadingChild(false);
  }

  async function toggleShop(row: SalesRow) {
    const shopId = getShopId(row);
    if (!shopId) return;

    if (expandedShopId === shopId) {
      setExpandedShopId(null);
      return;
    }

    setExpandedShopId(shopId);
    await getTickets(1, shopId);
  }

  async function updateTicket(ticket: TicketRow, action: "lost" | "void" | "won") {
    if (!ticket.id) return;
    if (!window.confirm("Are you sure?")) return;

    setUpdatingTicketId(ticket.id);
    const response =
      variant === "coupon-sales"
        ? await GETREQUEST<any>(`/api/admin/pools/coupon/ticket?id=${ticket.id}&action=${action}`)
        : await POSTREQUEST<any>(`/bets/update-bet/${clientId()}`, {
            betId: ticket.id,
            status: action,
          });
    const body = response.data ?? {};
    setUpdatingTicketId(null);

    if (!response.ok || (body.status_code && Number(body.status_code) >= 400)) {
      toast.error(response.error || body.message || body.status_description || "An error occured");
      return;
    }

    toast.success(body.message || body.status_description || "Ticket updated");
    if (expandedShopId) {
      await getTickets(ticketPagination.current_page ?? 1, expandedShopId);
    }
    await getSales(pagination.current_page ?? 1);
  }

  return (
    <div className="space-y-6">
      <form
        className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950"
        onSubmit={(event) => {
          event.preventDefault();
          getSales(1);
        }}
      >
        <div className="grid gap-4 md:grid-cols-5">
          <select
            value={filters.period}
            onChange={(event) => setFilters((current) => dateRangeForPeriod(event.target.value, current))}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {periodOptions.map(([value, label]) => (
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
            value={filters.week}
            onChange={(event) => setFilters((current) => ({ ...current, week: event.target.value }))}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {weekOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={paging} onChange={(event) => setPaging(event.target.checked)} />
            Enable Paging
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Results</h2>
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : null}
              {!loading && rows.length < 1 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No record found
                  </td>
                </tr>
              ) : null}
              {!loading
                ? rows.map((row, index) => {
                    const shopId = getShopId(row);
                    const ggr = calcGgr(row.sales, row.winnings);

                    return (
                      <Fragment key={`${shopId || "shop"}-${index}`}>
                        <tr>
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">
                            <button
                              type="button"
                              onClick={() => toggleShop(row)}
                              className="mr-2 text-brand-600 dark:text-brand-400"
                              aria-label={`Toggle ${row.username ?? "shop"} tickets`}
                            >
                              {expandedShopId === shopId ? "v" : ">"}
                            </button>
                            <button type="button" onClick={() => toggleShop(row)} className="text-brand-600 dark:text-brand-400">
                              {row.username ?? "-"}
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatNumber(row.no_of_bets, false)}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatNumber(row.sales)}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatNumber(row.winnings)}</td>
                          <td className={`whitespace-nowrap px-4 py-3 ${ggr < 0 ? "text-red-600" : "text-gray-700 dark:text-gray-300"}`}>
                            {formatNumber(ggr)}
                          </td>
                          <td className={`whitespace-nowrap px-4 py-3 ${ggr < 0 ? "text-red-600" : "text-gray-700 dark:text-gray-300"}`}>
                            {calcMargin(row.sales, row.winnings)}
                          </td>
                          <td className={`whitespace-nowrap px-4 py-3 ${ggr < 0 ? "text-red-600" : "text-gray-700 dark:text-gray-300"}`}>
                            {formatNumber(ggr)}
                          </td>
                        </tr>
                        {expandedShopId === shopId ? (
                          <tr>
                            <td colSpan={7} className="bg-gray-50 p-4 dark:bg-gray-900">
                              {loadingChild ? (
                                <div className="py-8 text-center text-gray-500 dark:text-gray-400">Loading tickets...</div>
                              ) : (
                                <TicketTable
                                  canAct={canAct}
                                  onUpdateTicket={updateTicket}
                                  tickets={tickets}
                                  updatingTicketId={updatingTicketId}
                                  variant={variant}
                                />
                              )}
                              {ticketPagination.total ? (
                                <div className="mt-4 flex items-center justify-end gap-2 text-sm">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!expandedShopId || (ticketPagination.current_page ?? 1) <= 1}
                                    onClick={() => expandedShopId && getTickets((ticketPagination.current_page ?? 1) - 1, expandedShopId)}
                                  >
                                    Previous
                                  </Button>
                                  <span className="text-gray-500 dark:text-gray-400">Page {ticketPagination.current_page ?? 1}</span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={
                                      !expandedShopId ||
                                      Boolean(ticketPagination.last_page && (ticketPagination.current_page ?? 1) >= ticketPagination.last_page)
                                    }
                                    onClick={() => expandedShopId && getTickets((ticketPagination.current_page ?? 1) + 1, expandedShopId)}
                                  >
                                    Next
                                  </Button>
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })
                : null}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold dark:bg-gray-900">
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">Total</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">{formatNumber(totals.tickets, false)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">{formatNumber(totals.stake)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">{formatNumber(totals.winnings)}</td>
                <td className={`whitespace-nowrap px-4 py-3 ${calcGgr(totals.stake, totals.winnings) < 0 ? "text-red-600" : "text-gray-900 dark:text-white"}`}>
                  {formatNumber(calcGgr(totals.stake, totals.winnings))}
                </td>
                <td className={`whitespace-nowrap px-4 py-3 ${calcGgr(totals.stake, totals.winnings) < 0 ? "text-red-600" : "text-gray-900 dark:text-white"}`}>
                  {calcMargin(totals.stake, totals.winnings)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white" />
              </tr>
            </tfoot>
          </table>
          {pagination.total ? (
            <div className="mt-4 flex items-center justify-end gap-2 text-sm">
              <Button
                type="button"
                variant="outline"
                disabled={!paging || (pagination.current_page ?? 1) <= 1 || loading}
                onClick={() => getSales((pagination.current_page ?? 1) - 1)}
              >
                Previous
              </Button>
              <span className="text-gray-500 dark:text-gray-400">Page {pagination.current_page ?? 1}</span>
              <Button
                type="button"
                variant="outline"
                disabled={!paging || Boolean(pagination.last_page && (pagination.current_page ?? 1) >= pagination.last_page) || loading}
                onClick={() => getSales((pagination.current_page ?? 1) + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function TicketTable({
  canAct,
  onUpdateTicket,
  tickets,
  updatingTicketId,
  variant,
}: {
  canAct: (permission: string) => boolean;
  onUpdateTicket: (ticket: TicketRow, action: "lost" | "void" | "won") => void;
  tickets: TicketRow[];
  updatingTicketId: string | number | null;
  variant: SalesVariant;
}) {
  if (!tickets.length) {
    return <div className="py-6 text-center text-gray-500 dark:text-gray-400">No data</div>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 text-xs dark:divide-gray-800">
      <thead>
        <tr>
          {childColumns(variant).map((head, index) => (
            <th key={`${head}-${index}`} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
              {head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {tickets.map((ticket, index) => (
          <tr key={`${ticket.id ?? ticket.coupon_no ?? "ticket"}-${index}`}>
            <td className="whitespace-nowrap px-3 py-2 text-brand-600 dark:text-brand-400">{ticket.coupon_no ?? "-"}</td>
            <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{ticket.created_at ?? "-"}</td>
            <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">
              {ticket.user ? (
                <Link
                  className="text-brand-600 dark:text-brand-400"
                  href={
                    Number(ticket.user.role_id) === 4
                      ? `/network/agent/${ticket.user.id}`
                      : `/player-management/player-info/${ticket.user.id}`
                  }
                >
                  {ticket.user.username ?? ticket.user.id}
                </Link>
              ) : (
                ticket.user_id ?? "-"
              )}
            </td>
            <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{formatNumber(ticket.stake)}</td>
            {variant === "coupon-sales" ? (
              <>
                <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{ticket.odds ?? "-"}</td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{formatNumber(ticket.pot_winnings)}</td>
              </>
            ) : (
              <>
                <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{ticket.games ?? "-"}</td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{ticket.game_type ?? "-"}</td>
              </>
            )}
            <td className={`whitespace-nowrap px-3 py-2 font-medium ${statusClass(ticket.status)}`}>{getStatus(ticket.status)}</td>
            <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{ticket.settled_at ?? "-"}</td>
            <td className="whitespace-nowrap px-3 py-2">
              <div className="flex gap-1">
                {Number(ticket.status) !== 2 && canAct("Cancel Ticket") ? (
                  <button
                    type="button"
                    disabled={updatingTicketId === ticket.id}
                    onClick={() => onUpdateTicket(ticket, "lost")}
                    className="rounded border border-red-200 px-2 py-1 text-red-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                ) : null}
                {Number(ticket.status) !== 3 && canAct("Void Ticket") ? (
                  <button
                    type="button"
                    disabled={updatingTicketId === ticket.id}
                    onClick={() => onUpdateTicket(ticket, "void")}
                    className="rounded border border-red-200 px-2 py-1 text-red-600 disabled:opacity-50"
                  >
                    Void
                  </button>
                ) : null}
                {Number(ticket.status) !== 1 && canAct("Mark as won") ? (
                  <button
                    type="button"
                    disabled={updatingTicketId === ticket.id}
                    onClick={() => onUpdateTicket(ticket, "won")}
                    className="rounded border border-green-200 px-2 py-1 text-green-600 disabled:opacity-50"
                  >
                    Won
                  </button>
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
