"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { columns, OpenBet } from "@/app/(admin)/tickets/open_bet/column";
import { openBets } from "@/app/(admin)/tickets/open_bet/data";
import type { SingleValue } from "react-select";
import type { Range } from "react-date-range";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Info } from "lucide-react";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";

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
  const [filteredData, setFilteredData] = useState<OpenBet[]>(openBets);
  const [operationFilter, setOperationFilter] = useState<FilterOption | null>(
    null
  );
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [appliedOperationFilter, setAppliedOperationFilter] =
    useState<FilterOption | null>(null);
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);
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

  // Filter data by agent - in a real app, this would filter by agentId
  const agentFilteredData = useMemo(() => {
    // For now, we'll return all data. In production, filter by agentId
    return openBets;
  }, [agentId]);

  const filterBets = useCallback(
    (
      value: string,
      operation: { value: string; label: string } | null = appliedOperationFilter,
      range: Range | null = appliedDateRange
    ) => {
      const searchTerm = value.trim().toLowerCase();

      return agentFilteredData.filter((row) => {
        let match = true;

        if (searchTerm) {
          const matchesSearch = searchableFields.some((field) =>
            String(row[field] ?? "").toLowerCase().includes(searchTerm)
          );

          if (!matchesSearch) {
            return false;
          }
        }

        if (operation) {
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
    [appliedDateRange, appliedOperationFilter, agentFilteredData]
  );

  useEffect(() => {
    setFilteredData(filterBets(query));
  }, [filterBets, query]);

  const applyFilters = () => {
    const nextOperation = operationFilter;
    const nextDateRange = dateRange;

    setAppliedOperationFilter(nextOperation);
    setAppliedDateRange(nextDateRange);
    setFilteredData(filterBets(query, nextOperation, nextDateRange));
  };

  const clearFilters = () => {
    setOperationFilter(null);
    setDateRange(defaultDateRange);
    setAppliedOperationFilter(null);
    setAppliedDateRange(null);
    setFilteredData(agentFilteredData);
    resetQuery();
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

      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default OpenBetsTab;

