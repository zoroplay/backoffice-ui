"use client";

import React, { useState, useCallback, useEffect } from "react";
import type { Range } from "react-date-range";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { withAuth } from "@/utils/withAuth";
import { columns, PlayerBonusReport } from "./columns";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { bonusesApi, normalizeApiError } from "@/lib/api";
import { toast } from "sonner";

type FilterOption = { value: string; label: string };

type ApiPlayerBonusReportRow = {
  id?: string | number;
  username?: string;
  userName?: string;
  playerId?: string | number;
  userId?: string | number;
  bonusType?: string;
  totalWon?: string | number;
  totalWin?: string | number;
  amountWon?: string | number;
  date?: string;
  transactionDate?: string;
  createdAt?: string;
  created_at?: string;
  amountAwarded?: string | number;
  bonusAmount?: string | number;
  wageringRequirement?: string | number;
  rolloverCount?: string | number;
  wageringRequirementRemaining?: string | number;
  remainingWageringRequirement?: string | number;
  wageringRequirementAchieved?: string | number;
  achievedWageringRequirement?: string | number;
  transactionType?: string;
  referralSource?: string;
  playerAgentType?: string;
  [key: string]: unknown;
};

const filterOptions = [
  {
    label: "Bonus Type",
    options: [
      { value: "registration", label: "Registration" },
      { value: "first_deposit", label: "First Deposit" },
      { value: "deposit_bonus", label: "Deposit Bonus" },
      { value: "referral", label: "Referral" },
      { value: "cashback", label: "Cashback" },
      { value: "freebet", label: "Freebet" },
      { value: "sharebet", label: "Sharebet" },
    ],
  },
  {
    label: "Transaction Type",
    options: [
      { value: "bonus_achieved", label: "Bonus Achieved" },
      { value: "bonus_lost", label: "Bonus Lost" },
      { value: "bonus_redeemed", label: "Bonus Redeemed" },
    ],
  },
  {
    label: "Referral Source",
    options: [
      { value: "other", label: "Other" },
      { value: "facebook", label: "Facebook" },
      { value: "instagram", label: "Instagram" },
      { value: "twitter", label: "Twitter" },
      { value: "organic", label: "Organic" },
    ],
  },
  {
    label: "Player Agent Type",
    options: [
      { value: "under_agent", label: "Under Agent" },
      { value: "not_under", label: "Not Under" },
    ],
  },
];

const bonusTypeValues = [
  "registration",
  "first_deposit",
  "deposit_bonus",
  "referral",
  "cashback",
  "freebet",
  "sharebet",
];

const defaultFilter: FilterOption = { value: "registration", label: "Registration" };

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toText = (value: unknown, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const toTitle = (value: unknown, fallback = "") => {
  const source = toText(value, fallback).replace(/[-_]+/g, " ").trim();
  if (!source) return fallback;
  return source
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const formatDateParam = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toIsoDate = (value: unknown) => {
  const text = toText(value);
  if (!text) return new Date().toISOString();
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return new Date().toISOString();
};

const mapReportRow = (row: ApiPlayerBonusReportRow, index: number): PlayerBonusReport => ({
  id: toText(row.id ?? row.playerId ?? row.userId ?? index + 1),
  username: toText(row.username ?? row.userName, "N/A"),
  playerId: toText(row.playerId ?? row.userId ?? row.id, "N/A"),
  bonusType: toTitle(row.bonusType, "Registration"),
  totalWon: toNumber(row.totalWon ?? row.totalWin ?? row.amountWon),
  date: toIsoDate(row.date ?? row.transactionDate ?? row.createdAt ?? row.created_at),
  amountAwarded: toNumber(row.amountAwarded ?? row.bonusAmount),
  wageringRequirement: toNumber(row.wageringRequirement ?? row.rolloverCount),
  wageringRequirementRemaining: toNumber(
    row.wageringRequirementRemaining ?? row.remainingWageringRequirement
  ),
  wageringRequirementAchieved: toNumber(
    row.wageringRequirementAchieved ?? row.achievedWageringRequirement
  ),
  transactionType: toTitle(row.transactionType, "Bonus Achieved"),
  referralSource: toTitle(row.referralSource, "Other"),
  playerAgentType: toTitle(row.playerAgentType, "Not Under"),
});

const extractReportRows = (response: unknown): ApiPlayerBonusReportRow[] => {
  const root = (response as { data?: unknown })?.data ?? response;
  if (Array.isArray(root)) return root as ApiPlayerBonusReportRow[];

  if (root && typeof root === "object") {
    const objectRoot = root as { result?: unknown; rows?: unknown; reports?: unknown; list?: unknown; data?: unknown };
    const nested = objectRoot.result ?? objectRoot.rows ?? objectRoot.reports ?? objectRoot.list ?? objectRoot.data;

    if (Array.isArray(nested)) return nested as ApiPlayerBonusReportRow[];

    if (nested && typeof nested === "object") {
      const doubleNested = (nested as { data?: unknown }).data;
      if (Array.isArray(doubleNested)) return doubleNested as ApiPlayerBonusReportRow[];
    }
  }

  return [];
};

function PlayerBonusesReportPage() {
  const [filteredData, setFilteredData] = useState<PlayerBonusReport[]>([]);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption | null>(defaultFilter);
  const [isLoading, setIsLoading] = useState(false);

  const applyClientFilter = useCallback((data: PlayerBonusReport[], filter: FilterOption | null) => {
    if (!filter) return data;
    const val = filter.value.toLowerCase();
    let filtered = [...data];

    if (bonusTypeValues.includes(val)) {
      filtered = filtered.filter((item) => item.bonusType.toLowerCase().replace(/\s+/g, "_") === val);
    }

    if (["bonus_achieved", "bonus_lost", "bonus_redeemed"].includes(val)) {
      filtered = filtered.filter((item) => item.transactionType.toLowerCase().replace(/\s+/g, "_") === val);
    }

    if (["other", "facebook", "instagram", "twitter", "organic"].includes(val)) {
      filtered = filtered.filter((item) => item.referralSource.toLowerCase() === val);
    }

    if (["under_agent", "not_under"].includes(val)) {
      filtered = filtered.filter((item) => item.playerAgentType.toLowerCase().replace(/\s+/g, "_") === val);
    }

    return filtered;
  }, []);

  const fetchReports = useCallback(
    async (filter: FilterOption | null, range: Range | null) => {
      if (!range?.startDate || !range?.endDate) {
        setFilteredData([]);
        return;
      }

      const bonusTypeForApi = filter && bonusTypeValues.includes(filter.value)
        ? filter.value
        : "registration";

      setIsLoading(true);
      try {
        const response = await bonusesApi.getPlayerBonusesReport({
          from: formatDateParam(range.startDate),
          to: formatDateParam(range.endDate),
          bonusType: bonusTypeForApi,
        });
        const mappedData = extractReportRows(response).map(mapReportRow);
        setFilteredData(applyClientFilter(mappedData, filter));
      } catch (err) {
        const apiError = normalizeApiError(err);
        toast.error(apiError.message ?? "Failed to load player bonus report");
        setFilteredData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [applyClientFilter]
  );

  useEffect(() => {
    void fetchReports(defaultFilter, defaultDateRange);
  }, [fetchReports]);

  const handleSearch = () => {
    const nextFilter = selectedFilter;
    const nextDateRange = dateRange;

    void fetchReports(nextFilter, nextDateRange);
  };

  const handleClearFilters = () => {
    setDateRange(defaultDateRange);
    setSelectedFilter(defaultFilter);
    void fetchReports(defaultFilter, defaultDateRange);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Player Bonus Report" />

      <TableFilterToolbar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        isLoading={isLoading}
        actions={{
          onSearch: handleSearch,
          onClear: handleClearFilters,
        }}
        selectProps={{
          options: filterOptions,
          placeholder: "Filter Options",
          value: selectedFilter,
          onChange: (val) => setSelectedFilter(val ?? null),
          isClearable: true,
        }}
      />
      {/* Table */}
      <DataTable columns={columns} data={filteredData} loading={isLoading} />
    </div>
  );
}

export default withAuth(PlayerBonusesReportPage);

