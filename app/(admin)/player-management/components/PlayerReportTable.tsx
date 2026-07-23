"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { formatDate, money, type Pagination } from "@/app/(admin)/tickets/components/ticketApiHelpers";

import type { PlayerReportRow, PlayerReportVariant } from "../reportsApi";

type PlayerReportTableProps = {
  variant: PlayerReportVariant;
  rows: PlayerReportRow[];
  loading: boolean;
  actingId: string;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onVerify: (row: PlayerReportRow) => void;
  onStatusChange: (row: PlayerReportRow, status: number, label: string) => void;
};

export function PlayerReportTable({
  variant,
  rows,
  loading,
  actingId,
  pagination,
  onPageChange,
  onVerify,
  onStatusChange,
}: PlayerReportTableProps) {
  const headers = useMemo(() => tableHeaders(variant), [variant]);

  return (
    <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  Loading Please wait....
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No data
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={`${variant}-${row.id}`}>
                  {renderCells(variant, row, actingId, onVerify, onStatusChange).map((cell, index) => (
                    <td key={`${row.id}-${index}`} className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar pagination={pagination} onPageChange={onPageChange} />
    </section>
  );
}

export function downloadPlayerReportCsv(
  variant: PlayerReportVariant,
  rows: PlayerReportRow[],
  fileName: string
) {
  const headers = tableHeaders(variant);
  const values = rows.map((row) =>
    csvRowForVariant(variant, row).map((value) => escapeCsv(value))
  );
  const csv = [headers.map(escapeCsv).join(","), ...values.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function tableHeaders(variant: PlayerReportVariant) {
  if (variant === "online") {
    return [
      "Username",
      "Date Joined",
      "Email",
      "Phone",
      "Balance",
      "Bonuses",
      "Lifetime Deposits",
      "Lifetime Withdrawals",
      "Open Bets",
      "Verified",
      "Status",
      "Quick Actions",
    ];
  }

  if (variant === "frozen") {
    return [
      "Username",
      "Full Name",
      "Balance",
      "Player Current Status",
      "Freeze Date",
      "Freeze Type",
      "Reason",
      "Process Status",
      "Quick Actions",
    ];
  }

  if (variant === "inactive") {
    return [
      "Username",
      "Full Name",
      "Phone Number",
      "Last Login Date",
      "Balance",
      "Process Status",
      "Quick Actions",
    ];
  }

  return [
    "Username",
    "Phone Number",
    "Registered",
    "Last Login Date",
    "Balance",
    "Bonus",
    "LifeTimeDeposit",
    "LifeTimeWithdrawal",
    "Open Bets",
    "Status",
    "Verified",
    "Quick Actions",
  ];
}

function csvRowForVariant(variant: PlayerReportVariant, row: PlayerReportRow) {
  if (variant === "online") {
    return [
      row.username,
      formatDate(row.registered),
      row.email,
      row.phoneNumber,
      money(row.balance),
      money(row.bonus),
      money(row.lifeTimeDeposit),
      money(row.lifeTimeWithdrawal),
      String(row.openBets),
      row.verified ? "Yes" : "No",
      row.statusLabel,
      "View / Verify / Status update",
    ];
  }

  if (variant === "frozen") {
    return [
      row.username,
      row.fullName,
      money(row.balance),
      row.statusLabel,
      formatDate(row.updatedAt),
      "-",
      "-",
      "-",
      "View / Verify / Status update",
    ];
  }

  if (variant === "inactive") {
    return [
      row.username,
      row.fullName,
      row.phoneNumber,
      formatDate(row.lastLogin),
      money(row.balance),
      "-",
      "View / Verify / Status update",
    ];
  }

  return [
    row.username,
    row.phoneNumber,
    formatDate(row.registered),
    formatDate(row.lastLogin),
    money(row.balance),
    money(row.bonus),
    money(row.lifeTimeDeposit),
    money(row.lifeTimeWithdrawal),
    String(row.openBets),
    row.statusLabel,
    row.verified ? "Verified" : "Not Verified",
    "View / Verify / Status update",
  ];
}

function renderCells(
  variant: PlayerReportVariant,
  row: PlayerReportRow,
  actingId: string,
  onVerify: (row: PlayerReportRow) => void,
  onStatusChange: (row: PlayerReportRow, status: number, label: string) => void
) {
  const usernameCell = (
    <Link
      href={`/player-management/player-info/${encodeURIComponent(row.id)}`}
      className="font-medium text-brand-500 hover:underline"
    >
      {row.username}
    </Link>
  );

  if (variant === "online") {
    return [
      usernameCell,
      formatDate(row.registered),
      row.email || "-",
      row.phoneNumber || "-",
      money(row.balance),
      money(row.bonus),
      money(row.lifeTimeDeposit),
      money(row.lifeTimeWithdrawal),
      String(row.openBets),
      verifiedBadge(row.verified),
      statusBadge(row.statusCode, row.statusLabel),
      <PlayerQuickActions
        key={`${row.id}-actions`}
        row={row}
        acting={actingId === row.id}
        onVerify={onVerify}
        onStatusChange={onStatusChange}
      />,
    ];
  }

  if (variant === "frozen") {
    return [
      usernameCell,
      row.fullName || "-",
      money(row.balance),
      statusBadge(row.statusCode, row.statusLabel),
      formatDate(row.updatedAt),
      "-",
      "-",
      "-",
      <PlayerQuickActions
        key={`${row.id}-actions`}
        row={row}
        acting={actingId === row.id}
        onVerify={onVerify}
        onStatusChange={onStatusChange}
      />,
    ];
  }

  if (variant === "inactive") {
    return [
      usernameCell,
      row.fullName || "-",
      row.phoneNumber || "-",
      formatDate(row.lastLogin),
      money(row.balance),
      "-",
      <PlayerQuickActions
        key={`${row.id}-actions`}
        row={row}
        acting={actingId === row.id}
        onVerify={onVerify}
        onStatusChange={onStatusChange}
      />,
    ];
  }

  return [
    usernameCell,
    row.phoneNumber || "-",
    formatDate(row.registered),
    formatDate(row.lastLogin),
    money(row.balance),
    money(row.bonus),
    money(row.lifeTimeDeposit),
    money(row.lifeTimeWithdrawal),
    String(row.openBets),
    statusBadge(row.statusCode, row.statusLabel),
    verifiedBadge(row.verified),
    <PlayerQuickActions
      key={`${row.id}-actions`}
      row={row}
      acting={actingId === row.id}
      onVerify={onVerify}
      onStatusChange={onStatusChange}
    />,
  ];
}

function verifiedBadge(verified: boolean) {
  return (
    <Badge color={verified ? "success" : "neutral"} variant="light" size="sm">
      {verified ? "Verified" : "Not Verified"}
    </Badge>
  );
}

function statusBadge(statusCode: number, label: string) {
  const color =
    statusCode === 1
      ? "success"
      : statusCode === 0
      ? "warning"
      : statusCode === 3
      ? "info"
      : statusCode === 4
      ? "error"
      : "neutral";

  return (
    <Badge color={color} variant="light" size="sm">
      {label}
    </Badge>
  );
}

function PaginationBar({
  pagination,
  onPageChange,
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}) {
  const current = Math.max(1, pagination.current_page || 1);
  const last = Math.max(1, pagination.last_page || 1);
  const pageNumbers = [];

  for (let page = Math.max(1, current - 2); page <= Math.min(last, current + 2); page += 1) {
    pageNumbers.push(page);
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing {pagination.from} to {pagination.to} of {pagination.total} entries
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
        >
          Previous
        </Button>
        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant={page === current ? "primary" : "outline"}
            size="sm"
            disabled={page === current}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={current >= last}
          onClick={() => onPageChange(current + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function PlayerQuickActions({
  row,
  acting,
  onVerify,
  onStatusChange,
}: {
  row: PlayerReportRow;
  acting: boolean;
  onVerify: (row: PlayerReportRow) => void;
  onStatusChange: (row: PlayerReportRow, status: number, label: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        className="dropdown-toggle"
        variant="outline"
        size="sm"
        disabled={acting}
        // Button does not forward refs, so the dropdown uses its default absolute positioning.
        onClick={() => setOpen((current) => !current)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      <Dropdown
        isOpen={open}
        onClose={() => setOpen(false)}
        className="w-52"
      >
        <div className="py-2">
          <DropdownItem
            tag="a"
            href={`/player-management/player-info/${encodeURIComponent(row.id)}`}
            onItemClick={() => setOpen(false)}
          >
            View Player
          </DropdownItem>
          {!row.verified ? (
            <DropdownItem
              onClick={() => {
                setOpen(false);
                onVerify(row);
              }}
            >
              Verify Account
            </DropdownItem>
          ) : null}
          {row.statusCode !== 1 ? (
            <DropdownItem
              onClick={() => {
                setOpen(false);
                onStatusChange(row, 1, "Activate");
              }}
            >
              Activate Account
            </DropdownItem>
          ) : null}
          {row.statusCode === 1 ? (
            <DropdownItem
              onClick={() => {
                setOpen(false);
                onStatusChange(row, 3, "Freeze");
              }}
            >
              Freeze Account
            </DropdownItem>
          ) : null}
          {row.statusCode === 1 ? (
            <DropdownItem
              onClick={() => {
                setOpen(false);
                onStatusChange(row, 4, "Terminate");
              }}
            >
              Terminate Account
            </DropdownItem>
          ) : null}
        </div>
      </Dropdown>
    </div>
  );
}

function escapeCsv(value: string) {
  const safeValue = value ?? "";
  if (safeValue.includes(",") || safeValue.includes("\"") || safeValue.includes("\n")) {
    return `"${safeValue.replace(/"/g, "\"\"")}"`;
  }
  return safeValue;
}
