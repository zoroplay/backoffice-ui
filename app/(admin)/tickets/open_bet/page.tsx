"use client";

import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns, OpenBet } from "./column";
import { openBets } from "./data";
import type { MultiValue, GroupBase } from "react-select";
import type { Range } from "react-date-range";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Infotext } from "@/components/common/Info";

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
  const [filteredData, setFilteredData] = useState<OpenBet[]>(openBets);

  const [operationFilters, setOperationFilters] = useState<FilterOption[]>([]);

  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [appliedOperationFilters, setAppliedOperationFilters] =
    useState<FilterOption[]>([]);

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
      range: Range | null = appliedDateRange
    ) => {
      const searchTerm = value.trim().toLowerCase();

      return openBets.filter((row) => {
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
    [appliedDateRange, appliedOperationFilters]
  );

  useEffect(() => {
    setFilteredData(filterBets(query));
  }, [filterBets, query]);

  const applyFilters = () => {
    const nextOperations = operationFilters;
    const nextDateRange = dateRange;

    setAppliedOperationFilters(nextOperations);
    setAppliedDateRange(nextDateRange);
    setFilteredData(filterBets(query, nextOperations, nextDateRange));
  };

  const clearFilters = () => {
    setOperationFilters([]);
    setDateRange(defaultDateRange);
    setAppliedOperationFilters([]);
    setAppliedDateRange(null);
    setFilteredData(openBets);
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
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(OpenBetsPage);
