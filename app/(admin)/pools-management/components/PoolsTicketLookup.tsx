"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import Button from "@/components/ui/button/Button";
import { useAuth } from "@/context/AuthContext";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";

type TicketVariant = "coupon" | "pool";

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
  current_page?: number;
  last_page?: number;
  per_page?: number;
  from?: number;
  to?: number;
};

type TicketUser = {
  id?: string | number;
  username?: string;
  role_id?: string | number;
};

type TicketRow = {
  id?: string | number;
  coupon_no?: string;
  created_at?: string;
  user?: TicketUser | null;
  user_id?: string | number;
  stake?: string | number;
  odds?: string | number;
  pot_winnings?: string | number;
  games?: string | number;
  game_type?: string;
  status?: string | number;
  settled_at?: string;
  items?: Array<Record<string, unknown>>;
  selections?: Array<Record<string, unknown>>;
  [key: string]: unknown;
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
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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

function ticketsEndpoint(variant: TicketVariant, shopId: string, page: number) {
  return variant === "coupon"
    ? `/api/admin/pools/coupon-tickets/${shopId}?page=${page}`
    : `/api/admin/pools/tickets/${shopId}?page=${page}`;
}

function actionLabel(action: "lost" | "void" | "won") {
  if (action === "lost") return "Cancel";
  if (action === "void") return "Void";
  return "Won";
}

function childColumns(variant: TicketVariant) {
  return variant === "coupon"
    ? ["Coupon No", "Placed on", "By", "Stake", "Odds", "Pot. Winnings", "Status", "Bet Settled Date & Time", ""]
    : ["Coupon No", "Placed on", "By", "Stake", "Games", "Game Type", "Status", "Bet Settled Date & Time", ""];
}

export default function PoolsTicketLookup({ variant }: { variant: TicketVariant }) {
  const { can, session } = useAuth();
  const [filters, setFilters] = useState<FilterData>(() => defaultFilters());
  const [shopId, setShopId] = useState("");
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({});
  const [expandedTicketId, setExpandedTicketId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | number | null>(null);

  const totals = useMemo(
    () => ({
      count: tickets.length,
      stake: tickets.reduce((sum, ticket) => sum + toNumber(ticket.stake), 0),
      potential: tickets.reduce((sum, ticket) => sum + toNumber(ticket.pot_winnings), 0),
      pending: tickets.filter((ticket) => ![1, 2, 3].includes(Number(ticket.status))).length,
    }),
    [tickets],
  );

  const canAct = (permission: string) => !session?.permissions?.length || can(permission);

  async function getTickets(page = 1) {
    const targetShopId = shopId.trim();
    if (!targetShopId) {
      toast.error("Enter a shop or agent ID");
      return;
    }

    setLoading(true);
    const response = await POSTREQUEST<any>(ticketsEndpoint(variant, targetShopId, page), filters);
    const body = response.data ?? {};
    const data = body.tickets?.data;

    if (!response.ok || !Array.isArray(data)) {
      setTickets([]);
      setPagination({});
      toast.error(response.error || body.message || "An error occured");
      setLoading(false);
      return;
    }

    setTickets(data);
    setPagination(body.tickets ?? {});
    setExpandedTicketId(null);
    setLoading(false);
  }

  async function updateTicket(ticket: TicketRow, action: "lost" | "void" | "won") {
    if (!ticket.id) return;
    if (!window.confirm("Are you sure?")) return;

    setUpdatingTicketId(ticket.id);
    const response =
      variant === "coupon"
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
    await getTickets(pagination.current_page ?? 1);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            getTickets(1);
          }}
        >
          <div className="grid gap-4 md:grid-cols-6">
            <input
              value={shopId}
              onChange={(event) => setShopId(event.target.value)}
              placeholder="Shop or agent ID"
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
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
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Tickets" value={totals.count.toLocaleString()} />
        <SummaryCard label="Stake" value={formatNumber(totals.stake)} />
        <SummaryCard label={variant === "coupon" ? "Potential Winnings" : "Potential"} value={formatNumber(totals.potential)} />
        <SummaryCard label="Pending" value={totals.pending.toLocaleString()} />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Results</h2>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {childColumns(variant).map((head, index) => (
                  <th key={`${head}-${index}`} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : null}
              {!loading && !tickets.length ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    No data
                  </td>
                </tr>
              ) : null}
              {!loading
                ? tickets.map((ticket, index) => (
                    <TicketRows
                      key={`${ticket.id ?? ticket.coupon_no ?? "ticket"}-${index}`}
                      canAct={canAct}
                      expanded={expandedTicketId === ticket.id}
                      onToggle={() => setExpandedTicketId(expandedTicketId === ticket.id ? null : ticket.id ?? null)}
                      onUpdateTicket={updateTicket}
                      ticket={ticket}
                      updatingTicketId={updatingTicketId}
                      variant={variant}
                    />
                  ))
                : null}
            </tbody>
          </table>
          {pagination.total ? (
            <div className="mt-4 flex items-center justify-end gap-2 text-sm">
              <Button
                type="button"
                variant="outline"
                disabled={(pagination.current_page ?? 1) <= 1 || loading}
                onClick={() => getTickets((pagination.current_page ?? 1) - 1)}
              >
                Previous
              </Button>
              <span className="text-gray-500 dark:text-gray-400">Page {pagination.current_page ?? 1}</span>
              <Button
                type="button"
                variant="outline"
                disabled={Boolean(pagination.last_page && (pagination.current_page ?? 1) >= pagination.last_page) || loading}
                onClick={() => getTickets((pagination.current_page ?? 1) + 1)}
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function TicketRows({
  canAct,
  expanded,
  onToggle,
  onUpdateTicket,
  ticket,
  updatingTicketId,
  variant,
}: {
  canAct: (permission: string) => boolean;
  expanded: boolean;
  onToggle: () => void;
  onUpdateTicket: (ticket: TicketRow, action: "lost" | "void" | "won") => void;
  ticket: TicketRow;
  updatingTicketId: string | number | null;
  variant: TicketVariant;
}) {
  const selections = Array.isArray(ticket.items) ? ticket.items : Array.isArray(ticket.selections) ? ticket.selections : [];

  return (
    <>
      <tr>
        <td className="whitespace-nowrap px-3 py-2 text-brand-600 dark:text-brand-400">
          {variant === "coupon" ? (
            <button type="button" onClick={onToggle} className="mr-2 text-brand-600 dark:text-brand-400">
              {expanded ? "v" : ">"}
            </button>
          ) : null}
          {variant === "coupon" ? (
            <button type="button" onClick={onToggle} className="text-brand-600 dark:text-brand-400">
              {ticket.coupon_no ?? "-"}
            </button>
          ) : (
            <span>{ticket.coupon_no ?? "-"}</span>
          )}
        </td>
        <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{formatDate(ticket.created_at)}</td>
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
        {variant === "coupon" ? (
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
              <TicketAction action="lost" disabled={updatingTicketId === ticket.id} onClick={() => onUpdateTicket(ticket, "lost")} />
            ) : null}
            {Number(ticket.status) !== 3 && canAct("Void Ticket") ? (
              <TicketAction action="void" disabled={updatingTicketId === ticket.id} onClick={() => onUpdateTicket(ticket, "void")} />
            ) : null}
            {Number(ticket.status) !== 1 && canAct("Mark as won") ? (
              <TicketAction action="won" disabled={updatingTicketId === ticket.id} onClick={() => onUpdateTicket(ticket, "won")} />
            ) : null}
          </div>
        </td>
      </tr>
      {variant === "coupon" && expanded ? (
        <tr>
          <td colSpan={9} className="bg-gray-50 p-4 dark:bg-gray-900">
            <div className="grid gap-3 text-sm md:grid-cols-4">
              <Detail label="Ticket ID" value={String(ticket.id ?? "-")} />
              <Detail label="Coupon No" value={String(ticket.coupon_no ?? "-")} />
              <Detail label="Stake" value={formatNumber(ticket.stake)} />
              <Detail label="Potential Winnings" value={formatNumber(ticket.pot_winnings)} />
            </div>
            {selections.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs dark:divide-gray-800">
                  <thead>
                    <tr>
                      {["Event", "Market", "Selection", "Odds", "Status"].map((head) => (
                        <th key={head} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selections.map((item, index) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{String(item.event || item.fixture || item.match || "-")}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{String(item.market || item.market_name || "-")}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{String(item.selection || item.pick || item.outcome || "-")}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{String(item.odds || "-")}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-gray-700 dark:text-gray-300">{String(item.status || "-")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </td>
        </tr>
      ) : null}
    </>
  );
}

function TicketAction({
  action,
  disabled,
  onClick,
}: {
  action: "lost" | "void" | "won";
  disabled: boolean;
  onClick: () => void;
}) {
  const isWon = action === "won";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded border px-2 py-1 disabled:opacity-50 ${
        isWon ? "border-green-200 text-green-600" : "border-red-200 text-red-600"
      }`}
    >
      {actionLabel(action)}
    </button>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
