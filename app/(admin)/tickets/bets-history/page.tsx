"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { createColumns, BetHistory } from "./columns";
import type { MultiValue, GroupBase } from "react-select";
import type { Range } from "react-date-range";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import BetDetailsModal from "./components/BetDetailsModal";
import { Infotext } from "@/components/common/Info";
import { betsApi, normalizeApiError } from "@/lib/api";

//  Default last 30 days range
const defaultDateRange: Range = {
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
  endDate: new Date(),
  key: "selection",
};

const searchableFields: Array<keyof BetHistory> = [
  "betslipId",
  "placedBy",
  "sport",
  "league",
];

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
        { value: "won", label: "won" },
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

const filterOptionGroupMap = operationOptions.reduce<Map<string, string>>(
  (map, group) => {
    group.options.forEach((option) => {
      map.set(option.value, group.label);
    });
    return map;
  },
  new Map()
);

function BetsHistoryPage() {
  const [rows, setRows] = useState<BetHistory[]>([]);
  const [filteredData, setFilteredData] = useState<BetHistory[]>([]);
  const [operationFilters, setOperationFilters] = useState<FilterOption[]>([]);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [appliedOperationFilters, setAppliedOperationFilters] =
    useState<FilterOption[]>([]);
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);
  const [selectedBet, setSelectedBet] = useState<BetHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const normalizeStatus = (value: unknown): BetHistory["betStatus"] => {
    const status = String(value ?? "").toLowerCase();
    if (status === "won") return "Won";
    if (status === "lost") return "Lost";
    if (status === "cancelled" || status === "canceled") return "Cancelled";
    return "Pending";
  };

  const toBetHistory = (row: Record<string, unknown>): BetHistory => {
    const stake = toNumber(row.stake);
    const returns = toNumber(
      row.returns ?? row.potentialWinnings ?? row.potential_winnings
    );
    const winLossRaw = row.winLoss ?? row.win_loss ?? row.profitLoss;
    const winLossNum = toNumber(winLossRaw);
    const winLoss =
      typeof winLossRaw === "string"
        ? winLossRaw
        : winLossNum > 0
          ? `+${winLossNum}`
          : winLossNum < 0
            ? `${winLossNum}`
            : "-";

    return {
      betslipId: String(row.betslipId ?? row.betslip_id ?? row.couponId ?? ""),
      betType: String(row.betType ?? row.type ?? row.ticketType ?? ""),
      placedOn: String(row.placedOn ?? row.createdAt ?? row.date ?? ""),
      placedBy: String(row.placedBy ?? row.username ?? row.user ?? ""),
      betStatus: normalizeStatus(row.betStatus ?? row.status),
      odds: toNumber(row.odds),
      stake,
      returns,
      winLoss,
      sport: String(row.sport ?? row.sportName ?? ""),
      league: String(row.league ?? row.tournament ?? ""),
      event: String(row.event ?? row.eventName ?? ""),
      market: String(row.market ?? row.marketName ?? ""),
      lostEvents: toNumber(row.lostEvents ?? row.lost_events),
      clientType: String(row.clientType ?? row.channel ?? "Online") as BetHistory["clientType"],
      bonus: toNumber(row.bonus),
      settledAt: String(row.settledAt ?? row.settled_at ?? "-"),
    };
  };

  const getRowsFromResponse = (res: unknown): BetHistory[] => {
    const root = (res as { data?: unknown })?.data ?? res;
    const list =
      (Array.isArray(root) && root) ||
      ((root as { data?: unknown })?.data as unknown[]) ||
      ((root as { rows?: unknown })?.rows as unknown[]) ||
      ((root as { results?: unknown })?.results as unknown[]) ||
      ((root as { tickets?: unknown })?.tickets as unknown[]) ||
      [];

    if (!Array.isArray(list)) return [];
    return list.map((row) => toBetHistory((row as Record<string, unknown>) ?? {}));
  };

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

  // ----------------------
  // Filtering logic
  // ----------------------
  const filterBets = useCallback(
    (
      value: string,
      operations: { value: string; label: string }[] = appliedOperationFilters,
      range: Range | null = appliedDateRange,
      sourceRows: BetHistory[] = rows
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
              const returns = row.returns;
              if (val === "return_low") match = match && returns < 5000;
              if (val === "return_medium")
                match = match && returns >= 5000 && returns <= 10000;
              if (val === "return_high") match = match && returns > 10000;
            }

            if (["prematch", "live"].includes(val)) {
              const text = `${row.market} ${row.event}`.toLowerCase();
              match = match && text.includes(val);
            }

            if (["pending", "won", "lost", "canceled", "cut 2"].includes(val)) {
              match = match && row.betStatus.toLowerCase() === val;
            }

            if (["paid", "unpaid"].includes(val)) {
              const paidStatus = row.winLoss.startsWith("+") ? "paid" : "unpaid";
              match = match && paidStatus === val;
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
    } as const;

    try {
      const res = await betsApi.getBetHistory(payload, 1);
      const nextRows = getRowsFromResponse(res);

      setRows(nextRows);
      setAppliedOperationFilters(nextOperations);
      setAppliedDateRange(nextDateRange);
      setFilteredData(filterBets(query, nextOperations, nextDateRange, nextRows));
    } catch (err) {
      const apiErr = normalizeApiError(err);
      setError(apiErr.message ?? "Failed to fetch bet history");
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

  // ----------------------
  // UI
  // ----------------------
  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Bets History" />
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
          containerClassName: "max-w-[24rem]",
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

      {/* Bet Details Modal */}
      <BetDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        bet={selectedBet}
      />
    </div>
  );
}

export default withAuth(BetsHistoryPage);
