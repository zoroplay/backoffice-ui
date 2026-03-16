"use client";

import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns, OpenBet } from "./column";
import type { MultiValue, GroupBase } from "react-select";
import type { Range } from "react-date-range";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Infotext } from "@/components/common/Info";
import { betsApi, normalizeApiError } from "@/lib/api";

//  Default last 30 days range
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

const filterOptionGroupMap = operationOptions.reduce<Map<string, string>>(
  (map, group) => {
    group.options.forEach((option) => {
      map.set(option.value, group.label);
    });
    return map;
  },
  new Map()
);

const searchableFields: Array<keyof OpenBet> = [
  "betslipId",
  "by",
  "sport",
  "league",
];

function OpenBetsPage() {
  const [rows, setRows] = useState<OpenBet[]>([]);
  const [filteredData, setFilteredData] = useState<OpenBet[]>([]);

  const [operationFilters, setOperationFilters] = useState<FilterOption[]>([]);

  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [appliedOperationFilters, setAppliedOperationFilters] =
    useState<FilterOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOperationChange = useCallback(
    (value: MultiValue<FilterOption>) => {
      if (!value || value.length === 0) {
        setOperationFilters([]);
        return;
      }

      const latestSelections = new Map<string, FilterOption>();

      value.forEach((option) => {
        const groupKey = filterOptionGroupMap.get(option.value) ?? option.value;
        latestSelections.set(groupKey, option);
      });

      const uniqueSelections: FilterOption[] = [];
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

      setOperationFilters(uniqueSelections);
    },
    []
  );

  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  const fmt = (d?: Date, endOfDay = false) => {
    if (!d) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy} ${endOfDay ? "23:59:59" : "00:00:00"}`;
  };

  const toNumber = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const toOpenBet = (row: Record<string, unknown>): OpenBet => ({
    betslipId: String(row.betslipId ?? row.betslip_id ?? row.couponId ?? ""),
    betType: String(row.betType ?? row.type ?? row.ticketType ?? ""),
    placedOn: String(row.placedOn ?? row.createdAt ?? row.date ?? ""),
    by: String(row.by ?? row.username ?? row.user ?? ""),
    odds: toNumber(row.odds),
    stake: toNumber(row.stake),
    sport: String(row.sport ?? row.sportName ?? ""),
    league: String(row.league ?? row.tournament ?? ""),
    event: String(row.event ?? row.eventName ?? ""),
    market: String(row.market ?? row.marketName ?? ""),
    selection: String(row.selection ?? row.outcome ?? ""),
    ret: toNumber(row.ret ?? row.returns ?? row.potentialWinnings),
    clientType: String(row.clientType ?? row.channel ?? ""),
    ticketType: String(row.ticketType ?? row.is_simulated ?? ""),
  });

  const getRowsFromResponse = (res: unknown): OpenBet[] => {
    const root = (res as { data?: unknown })?.data ?? res;
    const list =
      (Array.isArray(root) && root) ||
      ((root as { data?: unknown })?.data as unknown[]) ||
      ((root as { rows?: unknown })?.rows as unknown[]) ||
      ((root as { results?: unknown })?.results as unknown[]) ||
      ((root as { tickets?: unknown })?.tickets as unknown[]) ||
      [];

    if (!Array.isArray(list)) return [];
    return list.map((row) => toOpenBet((row as Record<string, unknown>) ?? {}));
  };

  useEffect(() => {
    const placeholderText = "Search by Betslip ID, Username, Sport, or League";
    setPlaceholder(placeholderText);

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  // ----------------------
  // Filtering logic
  // ----------------------
  const filterBets = useCallback(
    (
      value: string,
      operations: { value: string; label: string }[] = appliedOperationFilters,
      range: Range | null = appliedDateRange,
      sourceRows: OpenBet[] = rows
    ) => {
      const searchTerm = value.trim().toLowerCase();

      return sourceRows.filter((row) => {
        let match = true;

        if (searchTerm) {
          const matchesSearch = searchableFields.some((field) =>
            String(row[field] ?? "").toLowerCase().includes(searchTerm)
          );

          if (!matchesSearch) {
            return false;
          }
        }

        if (operations.length > 0) {
          for (const operation of operations) {
            const val = operation.value.toLowerCase();

            if (["website", "cashier", "mobile"].includes(val)) {
              match = match && row.clientType.toLowerCase() === val;
            }

            if (["real", "simulated"].includes(val)) {
              match = match && row.ticketType.toLowerCase() === val;
            }

            if (["single", "multi", "system", "split"].includes(val)) {
              match = match && row.betType.toLowerCase() === val;
            }

            if (val.startsWith("stake_")) {
              const stake = row.stake;
              if (val === "stake_low") match = match && stake < 1000;
              if (val === "stake_medium")
                match = match && stake >= 1000 && stake <= 5000;
              if (val === "stake_high") match = match && stake > 5000;
            }

            if (val.startsWith("return_")) {
              const ret = row.ret;
              if (val === "return_low") match = match && ret < 5000;
              if (val === "return_medium")
                match = match && ret >= 5000 && ret <= 10000;
              if (val === "return_high") match = match && ret > 10000;
            }

            if (["prematch", "live"].includes(val)) {
              match = match && row.market.toLowerCase().includes(val);
            }
          }
        }

        if (range && range.startDate && range.endDate) {
          const rowDate = new Date(row.placedOn);
          const start = new Date(range.startDate);
          const end = new Date(range.endDate);

          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          match = match && rowDate >= start && rowDate <= end;
        }

        return match;
      });
    },
    [appliedDateRange, appliedOperationFilters, rows]
  );

  useEffect(() => {
    setFilteredData(filterBets(query));
  }, [filterBets, query]);

  const applyFilters = async () => {
    setIsLoading(true);
    setError(null);

    const nextOperations = operationFilters;
    const nextDateRange = dateRange;
    const payload = {
      from: fmt(dateRange.startDate ?? undefined, false),
      to: fmt(dateRange.endDate ?? undefined, true),
      search: query.trim(),
      filters: nextOperations.map((option) => option.value),
      status: "open",
    } as const;

    try {
      const res = await betsApi.getOpenBets(payload, 1);
      const nextRows = getRowsFromResponse(res);

      setRows(nextRows);
      setAppliedOperationFilters(nextOperations);
      setAppliedDateRange(nextDateRange);
      setFilteredData(filterBets(query, nextOperations, nextDateRange, nextRows));
    } catch (err) {
      const apiErr = normalizeApiError(err);
      setError(apiErr.message ?? "Failed to fetch open bets");
      setRows([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setOperationFilters([]);
    setDateRange(defaultDateRange);
    setAppliedOperationFilters([]);
    setAppliedDateRange(null);
    setRows([]);
    setFilteredData([]);
    setError(null);
    resetQuery();
  };


  return (
    <div className="space-y-6 p-4">

      <PageBreadcrumb pageTitle="Open Bets" />

      <Infotext text="Use the global search to filter by Betslip ID, Username, Sport, or League, or use the filters below to narrow down the results." />
      {/* Filters */}
      <TableFilterToolbar<FilterOption, true, GroupBase<FilterOption>>
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
          value: operationFilters,
          onChange: handleOperationChange,
          isMulti: true,
        }}
      />



      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-8 text-gray-500">Loading...</div>
      ) : (
        <>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <DataTable columns={columns} data={filteredData} />
        </>
      )}
    </div>
  );
}

export default withAuth(OpenBetsPage);
