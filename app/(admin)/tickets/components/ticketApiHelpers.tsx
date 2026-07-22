import type { ReactNode } from "react";

export type AnyRecord = Record<string, any>;

export type Pagination = {
  total: number;
  per_page: number;
  from: number;
  to: number;
  current_page: number;
  last_page?: number;
};

export const emptyPagination: Pagination = {
  total: 0,
  per_page: 10,
  from: 0,
  to: 0,
  current_page: 1,
  last_page: 1,
};

export function clientId() {
  return process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
}

export function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as AnyRecord)
    : {};
}

export function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function money(value: unknown) {
  return `NGN ${toNumber(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value: unknown) {
  if (!value) return "-";

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()} ${String(date.getHours()).padStart(
    2,
    "0"
  )}:${String(date.getMinutes()).padStart(2, "0")}:${String(
    date.getSeconds()
  ).padStart(2, "0")}`;
}

export function paginationFrom(
  source: unknown,
  page: number,
  count: number
): Pagination {
  const record = asRecord(source);
  const perPage = toNumber(record.per_page ?? record.perPage, count || 10);
  const total = toNumber(record.total, count);
  const currentPage = toNumber(record.current_page ?? record.currentPage, page);

  return {
    total,
    per_page: perPage,
    from: toNumber(record.from, total ? (currentPage - 1) * perPage + 1 : 0),
    to: toNumber(record.to, Math.min(currentPage * perPage, total)),
    current_page: currentPage,
    last_page: toNumber(
      record.last_page ?? record.lastPage,
      perPage ? Math.max(1, Math.ceil(total / perPage)) : 1
    ),
  };
}

export function getPaginatedRows(value: unknown, key?: string) {
  const body = asRecord(value);
  const source = key ? asRecord(body[key]) : body;

  if (Array.isArray(source.data)) return source.data;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(value)) return value;

  return [];
}

export function rowValue(
  record: AnyRecord,
  keys: string[],
  fallback: ReactNode = "-"
) {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }

  return fallback;
}

export function BetDetailsPanel({ bet }: { bet: AnyRecord }) {
  const selections =
    Array.isArray(bet.selections)
      ? bet.selections
      : Array.isArray(bet.items)
        ? bet.items
        : Array.isArray(bet.bet_items)
          ? bet.bet_items
          : [];

  if (!selections.length) {
    return (
      <pre className="max-h-72 overflow-auto rounded-md bg-white p-3 text-xs text-gray-700 dark:bg-gray-950 dark:text-gray-300">
        {JSON.stringify(bet, null, 2)}
      </pre>
    );
  }

  return (
    <div className="space-y-2">
      {selections.map((selection: unknown, index: number) => {
        const item = asRecord(selection);
        return (
          <div
            key={String(item.id ?? index)}
            className="grid gap-2 rounded-md border border-gray-200 bg-white p-3 text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 md:grid-cols-5"
          >
            <span>{String(rowValue(item, ["sport", "sport_name"]))}</span>
            <span>{String(rowValue(item, ["event", "event_name", "match"]))}</span>
            <span>{String(rowValue(item, ["market", "market_name"]))}</span>
            <span>{String(rowValue(item, ["selection", "selection_name", "name"]))}</span>
            <span>{String(rowValue(item, ["odds", "odd", "price"]))}</span>
          </div>
        );
      })}
    </div>
  );
}
