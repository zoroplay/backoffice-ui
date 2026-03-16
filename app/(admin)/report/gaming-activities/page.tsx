"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { GroupBase } from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import type { Range } from "react-date-range";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { columns } from "./column";
import { tableData as defaultTableData } from "./data";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import type { MultiValue } from "react-select";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Infotext } from "@/components/common/Info";
import { reportsApi, normalizeApiError, apiEnv } from "@/lib/api";
import type { TableDataTypes } from "./data";


// ----------------------
// Select Options
// ----------------------
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

type FilterSelection = { value: string; label: string };

const filterOptionGroupMap = groupedOptions.reduce<Map<string, string>>(
  (map, group) => {
    group.options.forEach((option) => {
      map.set(option.value, group.label);
    });
    return map;
  },
  new Map()
);


// ----------------------
// Component
// ----------------------
function GamingActivities() {
  const [filters, setFilters] = useState<FilterSelection[]>([]);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [tableData, setTableData] = useState<TableDataTypes[]>(defaultTableData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();
  const [appliedFilters, setAppliedFilters] = useState<FilterSelection[]>([]);
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);

  useEffect(() => {
    setPlaceholder("Search by Group");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  // Fetch gaming activity data from API (extract so it can be called by actions)
  const fetchGamingActivity = async (
    range: Range | null,
    filtersParam: FilterSelection[] | null,
    page = 1
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const fmt = (d?: Date, endOfDay = false) => {
        if (!d) return "";
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy} ${endOfDay ? "23:59:59" : "00:00:00"}`;
      };

      const payload: Record<string, unknown> = {
        period: "custom",
        username: "",
        from: fmt(range?.startDate ?? undefined, false),
        to: fmt(range?.endDate ?? undefined, true),
        betType: "",
        eventType: "",
        displayType: "real",
        sport: "",
        league: "",
        market: "",
        state: "",
        productType: "sports",
        source: "",
        // default grouping - backend expects values like 'day'
        groupBy: "day",
        clientID: Number(apiEnv.clientId),
        ticketType: 0,
      };

      // if filters present, set filters and try to derive groupBy from UI group
      if (filtersParam && filtersParam.length > 0) {
        payload.filters = filtersParam.map((f) => f.value);
        const firstFilter = filtersParam[0];
        const filterGroupLabel = filterOptionGroupMap.get(firstFilter.value) ?? "";
        const groupByMap: Record<string, string> = {
          Game: "game",
          Match: "match",
          Ticket: "ticket",
          Bet: "bet",
          Client: "client",
        };
        const derived = groupByMap[filterGroupLabel];
        if (derived) payload.groupBy = derived;
      }

      const result = await reportsApi.getGamingActivity(payload, page);

      if (Array.isArray(result)) {
        setTableData(result as TableDataTypes[]);
      } else if (result && typeof result === "object" && "data" in result) {
        const data = (result as { data: unknown }).data;
        setTableData(Array.isArray(data) ? (data as TableDataTypes[]) : defaultTableData);
      } else {
        setTableData(defaultTableData);
      }
    } catch (err) {
      const apiError = normalizeApiError(err);
      setError(apiError.message ?? "Failed to fetch gaming activity data");
      setTableData(defaultTableData);
    } finally {
      setIsLoading(false);
    }
  };

  // initial fetch on mount
  useEffect(() => {
    fetchGamingActivity(defaultDateRange, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

  // ----------------------
  // Filter & Search logic placeholder
  // ----------------------
  const filteredData = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    if (!searchTerm) {
      return tableData;
    }

    return tableData.filter((row) =>
      row.group.toString().toLowerCase().includes(searchTerm)
    );
  }, [query]);

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

  const applyFilters = () => {
    const nextAppliedFilters = filters;
    const nextAppliedDateRange = dateRange;

    setAppliedFilters(nextAppliedFilters);
    setAppliedDateRange(nextAppliedDateRange);

    fetchGamingActivity(nextAppliedDateRange, nextAppliedFilters);
  };

  const clearFilters = () => {
    setFilters([]);
    setDateRange(defaultDateRange);
    setAppliedFilters([]);
    setAppliedDateRange(null);
    setTableData(defaultTableData);
    resetQuery();
    // refetch default data
    fetchGamingActivity(defaultDateRange, []);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Gaming Activities" />
      <Infotext text="Use the global search to filter by Group, or use the filters below to narrow down the results." />
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <TableFilterToolbar<FilterSelection, true, GroupBase<FilterSelection>>
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
         actions={{
          onSearch: applyFilters,
          onClear: clearFilters,
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
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading gaming activity data...</div>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredData}
        />
      )}
    </div>
  );
}

export default withAuth(GamingActivities);
