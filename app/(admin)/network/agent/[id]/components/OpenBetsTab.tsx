"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { columns, OpenBet } from "@/app/(admin)/tickets/open-bet/column";
import type { SingleValue } from "react-select";
import type { Range } from "react-date-range";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Info } from "lucide-react";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";
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
];

const searchableFields: Array<keyof OpenBet> = [
  "betslipId",
  "by",
  "sport",
  "league",
];

interface OpenBetsTabProps {
  agentId: string;
  agent: Agency;
}

function OpenBetsTab({ agentId, agent }: OpenBetsTabProps) {
  const effectiveAgentId = agentId || agent.id || agent.username;
  void agent;
  const [rows, setRows] = useState<OpenBet[]>([]);
  const [operationFilter, setOperationFilter] = useState<FilterOption | null>(
    null
  );
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  const handleOperationChange = useCallback(
    (option: SingleValue<FilterOption>) => {
      setOperationFilter(option ?? null);
    },
    []
  );

  useEffect(() => {
    const placeholderText = "Search by Betslip ID, Username, Sport, or League";
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

  const mapRow = (row: Record<string, unknown>): OpenBet => ({
    betslipId: String(row.betslipId ?? row.betslip_id ?? row.coupon_id ?? ""),
    betType: String(row.betType ?? row.bet_type ?? ""),
    placedOn: String(row.placedOn ?? row.placed_on ?? row.created_at ?? ""),
    by: String(row.by ?? row.username ?? row.player ?? ""),
    odds: toNumber(row.odds ?? row.total_odds),
    stake: toNumber(row.stake),
    sport: String(row.sport ?? ""),
    league: String(row.league ?? ""),
    event: String(row.event ?? row.event_name ?? ""),
    market: String(row.market ?? row.market_name ?? ""),
    selection: String(row.selection ?? ""),
    ret: toNumber(row.ret ?? row.return ?? row.potential_winnings),
    clientType: String(row.clientType ?? row.client_type ?? ""),
    ticketType: String(row.ticketType ?? row.ticket_type ?? ""),
  });

  const fetchOpenBets = useCallback(async (betslipId?: string) => {
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
        group_type: "",
        amount_range: "",
        betslipId: betslipId ?? query.trim(),
        status: 0,
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
      setError(apiError.message ?? "Failed to fetch open bets");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.endDate, dateRange.startDate, effectiveAgentId, query]);

  useEffect(() => {
    void fetchOpenBets();
  }, [fetchOpenBets]);

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
    void fetchOpenBets();
  };

  const clearFilters = () => {
    setOperationFilter(null);
    setDateRange(defaultDateRange);
    resetQuery();
    void fetchOpenBets("");
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
          containerClassName: "max-w-[22rem]",
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
    </div>
  );
}

export default OpenBetsTab;

