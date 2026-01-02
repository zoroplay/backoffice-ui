"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { ActionMeta, MultiValue, SingleValue } from "react-select";
import type { ColumnDef } from "@tanstack/react-table";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeContext";
import { useSearch } from "@/context/SearchContext";
import { withAuth } from "@/utils/withAuth";

import {
  categories,
  customOddsOverrides,
  marketFilterOptions,
  sports,
  sportFilterOptions,
  statusFilterOptions,
  tournaments,
  upcomingEvents,
  type CustomOddsOverride,
  type MarketSelection,
  type UpcomingEvent,
} from "./data";
import type { CustomFilterOption, FilterGroupKey, SelectOption } from "./types";
import UpcomingEventsTab from "./components/UpcomingEventsTab";
import CustomOddsTab from "./components/CustomOddsTab";

const defaultSelectionTemplate: MarketSelection[] = [
  { key: "home", label: "1", odds: 0 },
  { key: "draw", label: "X", odds: 0 },
  { key: "away", label: "2", odds: 0 },
];

const formatKickoff = (isoString: string) =>
  new Date(isoString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getTournamentLabel = (tournamentId: string) =>
  tournaments.find((item) => item.id === tournamentId)?.name ?? "—";

function ManualOddsAdjustmentPage() {
  const { theme } = useTheme();
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();
  const [activeTab, setActiveTab] = useState<"upcoming" | "custom">("upcoming");

  const [expandedSports, setExpandedSports] = useState<Record<number, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  const [events, setEvents] = useState<UpcomingEvent[]>(() =>
    upcomingEvents.map((event) => ({
      ...event,
      markets: event.markets.map((market) => ({
        ...market,
        selections: market.selections.map((selection) => ({ ...selection })),
      })),
    }))
  );

  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [selectedMarketFilter, setSelectedMarketFilter] = useState<string | null>(null);

  const [overrideFilters, setOverrideFilters] = useState({
    sport: "all",
    status: "all",
    market: "all",
  });

  const [appliedOverrideFilters, setAppliedOverrideFilters] = useState(overrideFilters);

  useEffect(() => {
    if (activeTab === "custom") {
      setPlaceholder("Search by Match ID or Event Name");
      return () => {
        resetPlaceholder();
        resetQuery();
      };
    }

    return undefined;
  }, [activeTab, resetPlaceholder, resetQuery, setPlaceholder]);

  const handleSelectSport = useCallback(
    (sportId: number) => {
      const isCurrentlySelected = selectedSportId === sportId;
      const isExpanded = !!expandedSports[sportId];

      if (isCurrentlySelected && isExpanded) {
        setExpandedSports({});
        setExpandedCategories({});
        setSelectedSportId(null);
        setSelectedCategoryId(null);
        setSelectedTournamentId(null);
        setSelectedMarketFilter(null);
        return;
      }

      setExpandedSports({ [sportId]: true });
      setExpandedCategories({});
      setSelectedSportId(sportId);
      setSelectedMarketFilter(null);
      setSelectedCategoryId(null);
      setSelectedTournamentId(null);
    },
    [categories, expandedSports, selectedSportId]
  );

  const handleSelectCategory = useCallback((sportId: number, categoryId: number) => {
    setSelectedSportId(sportId);
    setExpandedSports((prev) => ({ ...prev, [sportId]: true }));
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: true }));
    setSelectedCategoryId(categoryId);

    const defaultTournament =
      tournaments.find((tournament) => tournament.categoryId === categoryId) ?? null;
    setSelectedTournamentId(defaultTournament?.id ?? null);
  }, []);

  const handleSportSelectOption = useCallback(
    (option: SingleValue<SelectOption<string>> | null) => {
      if (option && option.value) {
        handleSelectSport(Number(option.value));
      } else {
        setExpandedSports({});
        setExpandedCategories({});
        setSelectedSportId(null);
        setSelectedCategoryId(null);
        setSelectedTournamentId(null);
        setSelectedMarketFilter(null);
      }
    },
    [handleSelectSport]
  );

  const handleCategorySelectOption = useCallback(
    (option: SingleValue<SelectOption<string>> | null) => {
      if (option && selectedSportId != null) {
        handleSelectCategory(selectedSportId, Number(option.value));
      } else {
        setSelectedCategoryId(null);
        setSelectedTournamentId(null);
      }
    },
    [handleSelectCategory, selectedSportId]
  );

  const handleTournamentSelectOption = useCallback(
    (option: SingleValue<SelectOption<string>> | null) => {
      setSelectedTournamentId(option?.value ?? null);
    },
    []
  );

  const handleMarketSelectOption = useCallback(
    (option: SingleValue<SelectOption<string>> | null) => {
      setSelectedMarketFilter(option?.value ?? null);
    },
    []
  );

  const handleOddsChange = useCallback(
    (eventId: string, marketId: string, key: MarketSelection["key"], nextValue: number) => {
      setEvents((prev) =>
        prev.map((event) => {
          if (event.id !== eventId) {
            return event;
          }

          return {
            ...event,
            markets: event.markets.map((market) => {
              if (market.id !== marketId) {
                return market;
              }

              return {
                ...market,
                selections: market.selections.map((selection) =>
                  selection.key === key ? { ...selection, odds: nextValue } : selection
                ),
              };
            }),
          };
        })
      );
    },
    []
  );

  const resolveMarketForEvent = useCallback(
    (event: UpcomingEvent) => {
      if (selectedMarketFilter) {
        return event.markets.find((market) => market.id === selectedMarketFilter);
      }

      return event.markets[0];
    },
    [selectedMarketFilter]
  );

  const categoryOptions = useMemo<SelectOption<string>[]>(() => {
    return categories
      .filter((category) => category.sportId === selectedSportId)
      .map((category) => ({
        value: category.id.toString(),
        label: category.name,
      }));
  }, [selectedSportId]);

  const tournamentOptions = useMemo<SelectOption<string>[]>(() => {
    if (selectedSportId == null) {
      return [];
    }

    return tournaments
      .filter((tournament) => {
        if (selectedCategoryId != null) {
          return tournament.categoryId === selectedCategoryId;
        }
        return tournament.sportId === selectedSportId;
      })
      .map((tournament) => ({
        value: tournament.id,
        label: tournament.name,
      }));
  }, [selectedCategoryId, selectedSportId]);

  const hasActiveSport = selectedSportId != null;

  const eventsForMarketOptions = useMemo(() => {
    if (!hasActiveSport) {
      return events;
    }

    return events.filter((event) => event.sportId === selectedSportId);
  }, [events, hasActiveSport, selectedSportId]);

  const uniqueMarkets = useMemo(() => {
    const markets = new Map<string, string>();

    eventsForMarketOptions.forEach((event) => {
      event.markets.forEach((market) => {
        if (!markets.has(market.id)) {
          markets.set(market.id, market.name);
        }
      });
    });

    return Array.from(markets.entries()).map<SelectOption<string>>(([value, label]) => ({
      value,
      label,
    }));
  }, [eventsForMarketOptions]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (selectedSportId && event.sportId !== selectedSportId) {
        return false;
      }

      if (selectedCategoryId && event.categoryId !== selectedCategoryId) {
        return false;
      }

      if (selectedTournamentId && event.tournamentId !== selectedTournamentId) {
        return false;
      }

      if (selectedMarketFilter) {
        const hasMarket = event.markets.some((market) => market.id === selectedMarketFilter);
        if (!hasMarket) {
          return false;
        }
      }

      return true;
    });
  }, [events, selectedCategoryId, selectedMarketFilter, selectedSportId, selectedTournamentId]);

  const visibleEvents = useMemo(
    () => (hasActiveSport ? filteredEvents : []),
    [filteredEvents, hasActiveSport]
  );

  const uniqueMarketNamesInView = useMemo(() => {
    const names = new Set<string>();
    visibleEvents.forEach((event) => {
      event.markets.forEach((market) => names.add(market.name));
    });
    return names;
  }, [visibleEvents]);

  const activeMarketTemplate = useMemo(() => {
    if (visibleEvents.length === 0) {
      return null;
    }

    const market = resolveMarketForEvent(visibleEvents[0]);
    return market?.selections ?? null;
  }, [resolveMarketForEvent, visibleEvents]);

  const averageHomeOdds = useMemo(() => {
    let total = 0;
    let count = 0;

    visibleEvents.forEach((event) => {
      const market = resolveMarketForEvent(event);

      if (!market) {
        return;
      }

      const homeOdds = market.selections.find((selection) => selection.key === "home");
      if (homeOdds) {
        total += homeOdds.odds;
        count += 1;
      }
    });

    if (count === 0) {
      return "0.00";
    }

    return (total / count).toFixed(2);
  }, [resolveMarketForEvent, visibleEvents]);

  const upcomingColumns = useMemo<ColumnDef<UpcomingEvent, unknown>[]>(() => {
    const template = activeMarketTemplate ?? defaultSelectionTemplate;

    const baseColumns = [
      {
        header: "Kick-Off",
        meta: {
          cellClassName: "text-left",
        },
        cell: ({ row }: { row: { original: UpcomingEvent } }) => (
          <div className="text-left text-sm font-medium text-gray-700 dark:text-gray-200">
            {formatKickoff(row.original.kickoff)}
          </div>
        ),
      },
      {
        header: "Event",
        meta: {
          cellClassName: "whitespace-normal text-left align-top",
        },
        cell: ({ row }: { row: { original: UpcomingEvent } }) => (
          <div className="flex max-w-[240px] flex-col text-left">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {row.original.homeTeam} vs. {row.original.awayTeam}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getTournamentLabel(row.original.tournamentId)}
            </span>
          </div>
        ),
      },
    ];

    const selectionColumns = template.map((selection) => ({
      id: selection.key,
      meta: {
        cellClassName: "text-center",
      },
      header: selection.label,
      cell: ({ row }: { row: { original: UpcomingEvent } }) => {
        const market = resolveMarketForEvent(row.original);
        const targetSelection = market?.selections.find((item) => item.key === selection.key);

        return (
          <input
            type="number"
            value={targetSelection ? targetSelection.odds.toFixed(2) : ""}
            onChange={(event) => {
              if (!market || !targetSelection) return;
              handleOddsChange(
                row.original.id,
                market.id,
                selection.key,
                Number(event.target.value)
              );
            }}
            className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            step="0.01"
            min="1"
            disabled={!market || !targetSelection}
          />
        );
      },
    }));

    return [...baseColumns, ...selectionColumns];
  }, [activeMarketTemplate, handleOddsChange, resolveMarketForEvent]);

  const sportOptions = useMemo<SelectOption<string>[]>(() => {
    return sports.map((sport) => ({
      value: sport.id.toString(),
      label: sport.name,
    }));
  }, []);

  type FilterGroupKey = "sport" | "status" | "market";

  type CustomFilterOption = SelectOption<string> & {
    group: FilterGroupKey;
  };

  const customFilterOptions = useMemo(
    () => [
      {
        label: "Sport",
        options: [{ value: "all", label: "All Sports" }, ...sportFilterOptions].map((option) => ({
          ...option,
          group: "sport" as const,
        })),
      },
      {
        label: "Status",
        options: statusFilterOptions.map((option) => ({
          ...option,
          group: "status" as const,
        })),
      },
      {
        label: "Market",
        options: [{ value: "all", label: "All Markets" }, ...marketFilterOptions].map((option) => ({
          ...option,
          group: "market" as const,
        })),
      },
    ],
    []
  );

  const flatCustomFilterOptions = useMemo(() => {
    const options: CustomFilterOption[] = [];
    customFilterOptions.forEach((group) => {
      group.options.forEach((option) => options.push(option));
    });
    return options;
  }, [customFilterOptions]);

  const filteredOverrides = useMemo(() => {
    return customOddsOverrides.filter((override) => {
      if (appliedOverrideFilters.sport !== "all" && override.sport !== appliedOverrideFilters.sport) {
        return false;
      }

      if (
        appliedOverrideFilters.status !== "all" &&
        override.status !== appliedOverrideFilters.status
      ) {
        return false;
      }

      if (
        appliedOverrideFilters.market !== "all" &&
        override.market !== appliedOverrideFilters.market
      ) {
        return false;
      }

      const searchTerm = query.trim().toLowerCase();
      if (searchTerm.length > 0) {
        const matches =
          override.matchId.toLowerCase().includes(searchTerm) ||
          override.eventName.toLowerCase().includes(searchTerm);
        return matches;
      }

      return true;
    });
  }, [appliedOverrideFilters, query]);

  const selectedCustomFilterOptions = useMemo(() => {
    const selections: CustomFilterOption[] = [];

    if (overrideFilters.sport !== "all") {
      const option = flatCustomFilterOptions.find(
        (candidate) => candidate.group === "sport" && candidate.value === overrideFilters.sport
      );
      if (option) selections.push(option);
    }

    if (overrideFilters.status !== "all") {
      const option = flatCustomFilterOptions.find(
        (candidate) => candidate.group === "status" && candidate.value === overrideFilters.status
      );
      if (option) selections.push(option);
    }

    if (overrideFilters.market !== "all") {
      const option = flatCustomFilterOptions.find(
        (candidate) => candidate.group === "market" && candidate.value === overrideFilters.market
      );
      if (option) selections.push(option);
    }

    return selections;
  }, [flatCustomFilterOptions, overrideFilters.market, overrideFilters.sport, overrideFilters.status]);

  const handleCustomFilterSelect = useCallback(
    (newValue: MultiValue<CustomFilterOption>, actionMeta: ActionMeta<CustomFilterOption>) => {
      const nextSelections: Record<FilterGroupKey, string> = {
        sport: "all",
        status: "all",
        market: "all",
      };

      newValue.forEach((option) => {
        nextSelections[option.group] = option.value;
      });

      if (actionMeta.action === "select-option" && actionMeta.option) {
        nextSelections[actionMeta.option.group] = actionMeta.option.value;
      }

      if (
        (actionMeta.action === "remove-value" || actionMeta.action === "pop-value") &&
        actionMeta.removedValue
      ) {
        nextSelections[actionMeta.removedValue.group] = "all";
      }

      setOverrideFilters(nextSelections);
    },
    []
  );

  const applyOverrideFilters = useCallback(() => {
    setAppliedOverrideFilters(overrideFilters);
  }, [overrideFilters]);

  const clearOverrideFilters = useCallback(() => {
    const defaults = {
      sport: "all",
      status: "all",
      market: "all",
    };

    setOverrideFilters(defaults);
    setAppliedOverrideFilters(defaults);
    resetQuery();
  }, [resetQuery]);

  const customColumns = useMemo<ColumnDef<CustomOddsOverride, unknown>[]>(() => {
    return [
      {
        header: "Match ID",
        cell: ({ row }: { row: { original: CustomOddsOverride } }) => (
          <span className="font-medium text-gray-900 dark:text-gray-100">{row.original.matchId}</span>
        ),
      },
      {
        header: "Event Name",
        cell: ({ row }: { row: { original: CustomOddsOverride } }) => (
          <div className="flex flex-col text-left">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {row.original.eventName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{row.original.tournament}</span>
          </div>
        ),
      },
      {
        header: "Sport",
        cell: ({ row }: { row: { original: CustomOddsOverride } }) => (
          <span className="text-sm text-gray-600 dark:text-gray-300">{row.original.sport}</span>
        ),
      },
      {
        header: "Market",
        cell: ({ row }: { row: { original: CustomOddsOverride } }) => (
          <span className="text-sm text-gray-600 dark:text-gray-300">{row.original.market}</span>
        ),
      },
      {
        header: "Outcome",
        cell: ({ row }: { row: { original: CustomOddsOverride } }) => (
          <span className="text-sm text-gray-700 dark:text-gray-200">{row.original.outcome}</span>
        ),
      },
      {
        header: "Custom Odds",
        cell: ({ row }: { row: { original: CustomOddsOverride } }) => (
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {row.original.customOdds.toFixed(2)}
          </span>
        ),
      },
      {
        header: "Specifier",
        cell: ({ row }: { row: { original: CustomOddsOverride } }) => (
          <span className="text-sm text-gray-600 dark:text-gray-300">{row.original.specifier}</span>
        ),
      },
      {
        header: "Status",
        cell: ({ row }: { row: { original: CustomOddsOverride } }) => {
          const color =
            row.original.status === "Approved"
              ? "success"
              : row.original.status === "Rejected"
              ? "error"
              : "warning";

          return (
            <Badge variant="light" color={color}>
              {row.original.status}
            </Badge>
          );
        },
      },
      {
        header: "Requested",
        cell: ({ row }: { row: { original: CustomOddsOverride } }) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(row.original.createdAt).toLocaleString()}
          </span>
        ),
      },
    ];
  }, []);

  const handleCategoryToggle = useCallback((categoryId: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }, []);

  const handleTreeCompetitionSelect = useCallback(
    (sportId: number, categoryId: number, tournamentId: string | null) => {
      setExpandedSports({ [sportId]: true });
      setExpandedCategories((prev) => ({ ...prev, [categoryId]: true }));
      setSelectedSportId(sportId);
      setSelectedCategoryId(categoryId);
      setSelectedTournamentId(tournamentId);
    },
    []
  );

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Manual Odds Adjustment" />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
        className="w-full"
      >
        <TabsList className="mb-6 h-auto rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:from-gray-800/60 dark:to-gray-800/30">
          <TabsTrigger
            value="upcoming"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-50 data-[state=active]:border data-[state=active]:border-brand-200 data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-md dark:hover:bg-gray-800 dark:data-[state=active]:border-brand-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-300"
          >
            Upcoming Events
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-50 data-[state=active]:border data-[state=active]:border-indigo-200 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md dark:hover:bg-gray-800 dark:data-[state=active]:border-indigo-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-indigo-300"
          >
            Custom Odds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-0 space-y-6">
          <UpcomingEventsTab
            theme={theme}
            sports={sports}
            categories={categories}
            tournaments={tournaments}
            events={events}
            expandedSports={expandedSports}
            expandedCategories={expandedCategories}
            selectedSportId={selectedSportId}
            selectedCategoryId={selectedCategoryId}
            selectedTournamentId={selectedTournamentId}
            selectedMarketFilter={selectedMarketFilter}
            sportOptions={sportOptions}
            categoryOptions={categoryOptions}
            tournamentOptions={tournamentOptions}
            marketOptions={uniqueMarkets}
            onSportToggle={handleSelectSport}
            onCategoryToggle={handleCategoryToggle}
            onSportSelectChange={handleSportSelectOption}
            onCategorySelectChange={handleCategorySelectOption}
            onTournamentSelectChange={handleTournamentSelectOption}
            onMarketSelectChange={handleMarketSelectOption}
            onCompetitionSelect={handleTreeCompetitionSelect}
            hasActiveSport={hasActiveSport}
            visibleEvents={visibleEvents}
            columns={upcomingColumns}
            visibleEventsCount={visibleEvents.length}
            marketsInViewCount={uniqueMarketNamesInView.size}
            averageHomeOdds={averageHomeOdds}
          />
        </TabsContent>

        <TabsContent value="custom" className="mt-0 space-y-6">
          <CustomOddsTab
            theme={theme}
            filterOptions={customFilterOptions}
            selectedOptions={selectedCustomFilterOptions}
            onFilterChange={handleCustomFilterSelect}
            onApplyFilters={applyOverrideFilters}
            onClearFilters={clearOverrideFilters}
            filteredOverrides={filteredOverrides}
            columns={customColumns}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default withAuth(ManualOddsAdjustmentPage);

