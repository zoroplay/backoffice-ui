"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { createColumns, BetHistory } from "@/app/(admin)/tickets/bets-history/columns";
import type { SingleValue } from "react-select";
import type { Range } from "react-date-range";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Info } from "lucide-react";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";
import BetDetailsModal from "@/app/(admin)/tickets/bets-history/components/BetDetailsModal";
import { betsApi, normalizeApiError } from "@/lib/api";

const defaultDateRange: Range = {
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
  endDate: new Date(),
  key: "selection",
};

type FilterOption = { value: string; label: string };

const operationOptions: Array<{
  label: string;
  options: FilterOption[];
}> = [
  {
    label: "Client Type",
    options: [
      { value: "website", label: "Website" },
      { value: "cashier", label: "Cashier" },
      { value: "mobile", label: "Mobile" },
    ],
  },
  {
    label: "Ticket Type",
    options: [
      { value: "real", label: "Real" },
      { value: "simulated", label: "Simulated" },
    ],
  },
  {
    label: "Bet Type",
    options: [
      { value: "single", label: "Single Bet" },
      { value: "multi", label: "Multiple Bet" },
      { value: "system", label: "System Bet" },
      { value: "split", label: "Split Bet" },
    ],
  },
  {
    label: "Stake Range",
    options: [
      { value: "stake_low", label: "Stake < ₦1,000" },
      { value: "stake_medium", label: "Stake ₦1,000 - ₦5,000" },
      { value: "stake_high", label: "Stake > ₦5,000" },
    ],
  },
  {
    label: "Potential Return",
    options: [
      { value: "return_low", label: "Return < ₦5,000" },
      { value: "return_medium", label: "Return ₦5,000 - ₦10,000" },
      { value: "return_high", label: "Return > ₦10,000" },
    ],
  },
  {
    label: "Pre-Match/Live",
    options: [
      { value: "prematch", label: "Pre-match" },
      { value: "live", label: "Live" },
    ],
  },
  {
    label: "Status",
    options: [
      { value: "pending", label: "Pending" },
      { value: "won", label: "Won" },
      { value: "lost", label: "Lost" },
      { value: "canceled", label: "Canceled" },
      { value: "cut 2", label: "CUT(2)" },
    ],
  },
  {
    label: "Paid Status",
    options: [
      { value: "paid", label: "Paid" },
      { value: "unpaid", label: "Unpaid" },
    ],
  },
];

const searchableFields: Array<keyof BetHistory> = [
  "betslipId",
  "placedBy",
  "sport",
  "league",
];

interface BetHistoryTabProps {
  agentId: string;
  agent: Agency;
}

function BetHistoryTab({ agentId, agent }: BetHistoryTabProps) {
  const effectiveAgentId = agentId || agent.id || agent.username;
  const [rows, setRows] = useState<BetHistory[]>([]);
  const [operationFilter, setOperationFilter] = useState<FilterOption | null>(
    null
  );
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBet, setSelectedBet] = useState<BetHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  const handleOperationChange = useCallback(
    (option: SingleValue<FilterOption>) => {
      setOperationFilter(option ?? null);
    },
    []
  );

  const handleViewBet = useCallback((bet: BetHistory) => {
    setSelectedBet(bet);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBet(null);
  }, []);

  const columns = useMemo(() => createColumns(handleViewBet), [handleViewBet]);

  useEffect(() => {
    const placeholderText =
      "Search by Betslip ID, Username, Sport, or League";
    setPlaceholder(placeholderText);

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  const toNumber = (value: unknown) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) ? num : 0;
  };

  const formatDateTime = (date: Date | undefined, endOfDay = false) => {
    const d = date ? new Date(date) : new Date();
    if (endOfDay) {
      d.setHours(23, 59, 0, 0);
    } else {
      d.setHours(0, 0, 0, 0);
    }
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const parseList = (input: unknown): Record<string, unknown>[] => {
    if (Array.isArray(input)) return input as Record<string, unknown>[];
    if (input && typeof input === "object") {
      const record = input as Record<string, unknown>;
      if (Array.isArray(record.data)) return record.data as Record<string, unknown>[];
      if (record.data && typeof record.data === "object") {
        const nested = record.data as Record<string, unknown>;
        if (Array.isArray(nested.data)) return nested.data as Record<string, unknown>[];
      }
    }
    return [];
  };

  const mapStatus = (value: unknown): BetHistory["betStatus"] => {
    const normalized = String(value ?? "").toLowerCase();
    if (normalized.includes("won")) return "Won";
    if (normalized.includes("lost")) return "Lost";
    if (normalized.includes("cancel")) return "Cancelled";
    return "Pending";
  };

  const mapRow = (row: Record<string, unknown>): BetHistory => {
    const returns = toNumber(row.returns ?? row.return ?? row.potential_winnings);
    const stake = toNumber(row.stake);
    const winLossAmount = returns - stake;

    return {
      betslipId: String(row.betslipId ?? row.betslip_id ?? row.coupon_id ?? ""),
      betType: String(row.betType ?? row.bet_type ?? ""),
      placedOn: String(row.placedOn ?? row.placed_on ?? row.created_at ?? ""),
      placedBy: String(row.placedBy ?? row.placed_by ?? row.username ?? ""),
      betStatus: mapStatus(row.betStatus ?? row.status ?? row.state),
      odds: toNumber(row.odds ?? row.total_odds),
      stake,
      returns,
      winLoss: `${winLossAmount >= 0 ? "+" : "-"}₦${Math.abs(winLossAmount).toLocaleString()}`,
      sport: String(row.sport ?? ""),
      league: String(row.league ?? ""),
      event: String(row.event ?? row.event_name ?? ""),
      market: String(row.market ?? row.market_name ?? ""),
      lostEvents: toNumber(row.lostEvents ?? row.lost_events),
      clientType: "Agent",
      bonus: toNumber(row.bonus),
      settledAt: String(row.settledAt ?? row.settled_at ?? ""),
    };
  };

  const fetchBetHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        period: "",
        username: "",
        from: formatDateTime(dateRange.startDate),
        to: formatDateTime(dateRange.endDate, true),
        bet_type: "",
        event_type: "",
        sport: "",
        league: "",
        market: "",
        state: "",
        group_type: "",
        amount_range: "",
        status: "settled",
      };
      const response = await betsApi.getAgentBetList(
        effectiveAgentId,
        payload,
        1,
        100
      );
      const list = parseList(response).map(mapRow);
      setRows(list);
    } catch (err) {
      const apiError = normalizeApiError(err);
      setError(apiError.message ?? "Failed to fetch bet history");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.endDate, dateRange.startDate, effectiveAgentId]);

  useEffect(() => {
    void fetchBetHistory();
  }, [fetchBetHistory]);

  const filteredData = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) return rows;
    return rows.filter((row) =>
      searchableFields.some((field) =>
        String(row[field] ?? "").toLowerCase().includes(searchTerm)
      )
    );
  }, [query, rows]);

  const applyFilters = () => {
    void fetchBetHistory();
  };

  const clearFilters = () => {
    setOperationFilter(null);
    setDateRange(defaultDateRange);
    resetQuery();
    void fetchBetHistory();
  };

  return (
    <div className="space-y-6">
      <span className="flex items-center gap-1 mb-2 text-gray-500 dark:text-gray-400">
        <Info className="h-4 w-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use the global search to filter by Betslip ID, Username, Sport, or
          League, or use the filters below to narrow down the results.
        </p>
      </span>

      <TableFilterToolbar<FilterOption>
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: applyFilters,
          onClear: clearFilters,
        }}
        selectProps={{
          containerClassName: "max-w-[24rem]",
          options: operationOptions,
          placeholder: "Filter Options",
          value: operationFilter,
          onChange: handleOperationChange,
        }}
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <DataTable columns={columns} data={filteredData} loading={isLoading} />

      {/* Bet Details Modal */}
      <BetDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        bet={selectedBet}
      />
    </div>
  );
}

export default BetHistoryTab;

