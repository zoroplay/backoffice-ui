"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { GroupBase } from "react-select";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { columns, type TableDataTypes } from "@/app/(admin)/report/gaming-activities/column";
import { useSearch } from "@/context/SearchContext";
import type { MultiValue } from "react-select";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Info } from "lucide-react";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";
import { normalizeApiError, reportsApi } from "@/lib/api";

type FilterSelection = { value: string; label: string };

const groupedOptions = [
  {
    label: "Game",
    options: [
      { value: "Sport", label: "Sport" },
      { value: "Casino", label: "Casino" },
      { value: "Games", label: "Games" },
      { value: "Virtual Sport", label: "Virtual Sport" },
    ],
  },
  {
    label: "Match",
    options: [
      { value: "All", label: "All" },
      { value: "Pre Match", label: "Pre Match" },
      { value: "Live", label: "Live" },
    ],
  },
  {
    label: "Ticket",
    options: [
      { value: "Real", label: "Real" },
      { value: "Simulated", label: "Simulated" },
    ],
  },
  {
    label: "Bet",
    options: [
      { value: "Single", label: "Single" },
      { value: "Combo", label: "Combo" },
    ],
  },
  {
    label: "Client",
    options: [
      { value: "Website", label: "Website" },
      { value: "Mobile", label: "Mobile" },
      { value: "Cashier", label: "Cashier" },
    ],
  },
];

const filterOptionGroupMap = groupedOptions.reduce<Map<string, string>>(
  (map, group) => {
    group.options.forEach((option) => {
      map.set(option.value, group.label);
    });
    return map;
  },
  new Map()
);

interface GamingActivityTabProps {
  agentId: string;
  agent: Agency;
}

function GamingActivityTab({ agentId, agent }: GamingActivityTabProps) {
  const effectiveAgentId = agentId || agent.id || agent.username;
  void effectiveAgentId;
  void agent;
  const [filters, setFilters] = useState<FilterSelection[]>([]);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [rows, setRows] = useState<TableDataTypes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { query, setPlaceholder, resetPlaceholder } = useSearch();

  useEffect(() => {
    setPlaceholder("Search by Group");

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

  const mapRow = (row: Record<string, unknown>): TableDataTypes => ({
    group: toNumber(row.group),
    bets: toNumber(row.bets ?? row.total_bets),
    turnover: toNumber(row.turnover),
    winnings: toNumber(row.winnings),
    ggr: toNumber(row.ggr),
    margin: String(row.margin ?? "0%"),
  });

  const fetchGamingActivity = useCallback(async () => {
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
        status: "",
      };
      const response = await reportsApi.getGamingActivity(payload, 1);
      const list = parseList(response).map(mapRow);
      setRows(list);
    } catch (err) {
      const apiError = normalizeApiError(err);
      setError(apiError.message ?? "Failed to fetch gaming activity");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.endDate, dateRange.startDate]);

  useEffect(() => {
    void fetchGamingActivity();
  }, [fetchGamingActivity]);

  const filteredData = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    if (!searchTerm) {
      return rows;
    }

    return rows.filter((row) =>
      row.group.toString().toLowerCase().includes(searchTerm)
    );
  }, [query, rows]);

  const handleFilterChange = (value: MultiValue<FilterSelection>) => {
    const latestSelections = new Map<string, FilterSelection>();

    value.forEach((option) => {
      const groupKey = filterOptionGroupMap.get(option.value) ?? option.value;
      latestSelections.set(groupKey, option);
    });

    const uniqueSelections: FilterSelection[] = [];
    const seenGroups = new Set<string>();

    value.forEach((option) => {
      const groupKey = filterOptionGroupMap.get(option.value) ?? option.value;
      if (seenGroups.has(groupKey)) {
        return;
      }

      const latestOption = latestSelections.get(groupKey);
      if (latestOption?.value === option.value) {
        uniqueSelections.push(option);
        seenGroups.add(groupKey);
      }
    });

    setFilters(uniqueSelections);
  };

  return (
    <div className="space-y-6">
      <span className="flex items-center gap-1 mb-2 text-gray-500 dark:text-gray-400">
        <Info className="h-4 w-4" />
        <p className="text-sm">
          Use the global search to filter by Group, or use the filters below to
          narrow down the results.
        </p>
      </span>

      <TableFilterToolbar<FilterSelection, true, GroupBase<FilterSelection>>
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: () => {
            void fetchGamingActivity();
          },
          onClear: () => {
            setDateRange(defaultDateRange);
            void fetchGamingActivity();
          },
        }}
        selectProps={{
          containerClassName: "max-w-[26rem]",
          options: groupedOptions,
          isMulti: true,
          placeholder: "Filter by Game, Match, Ticket, Bet, Client...",
          value: filters,
          onChange: (val: MultiValue<FilterSelection>) => handleFilterChange(val),
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

export default GamingActivityTab;

