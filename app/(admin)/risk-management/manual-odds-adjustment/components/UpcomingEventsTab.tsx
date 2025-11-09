"use client";

import { useCallback, useMemo } from "react";
import Select, { type SingleValue, type StylesConfig, type GroupBase } from "react-select";
import { DataTable } from "@/components/tables/DataTable";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import type { ColumnDef } from "@tanstack/react-table";
import SportsHierarchyTree, {
  type HierarchyCompetitionNode,
  type HierarchySportNode,
} from "../../components/SportsHierarchyTree";

import type {
  Category,
  Sport,
  Tournament,
  UpcomingEvent,
} from "../data";
import type { SelectOption } from "../types";

type CompetitionMeta = {
  categoryId: number;
  tournamentId?: string;
};

export type UpcomingEventsTabProps = {
  theme: string | null;
  sports: Sport[];
  categories: Category[];
  tournaments: Tournament[];
  events: UpcomingEvent[];
  expandedSports: Record<number, boolean>;
  expandedCategories: Record<number, boolean>;
  selectedSportId: number | null;
  selectedCategoryId: number | null;
  selectedTournamentId: string | null;
  selectedMarketFilter: string | null;
  sportOptions: SelectOption<string>[];
  categoryOptions: SelectOption<string>[];
  tournamentOptions: SelectOption<string>[];
  marketOptions: SelectOption<string>[];
  onSportToggle: (sportId: number) => void;
  onCategoryToggle: (categoryId: number) => void;
  onSportSelectChange: (
    option: SingleValue<SelectOption<string>> | null
  ) => void;
  onCategorySelectChange: (
    option: SingleValue<SelectOption<string>> | null
  ) => void;
  onTournamentSelectChange: (
    option: SingleValue<SelectOption<string>> | null
  ) => void;
  onMarketSelectChange: (
    option: SingleValue<SelectOption<string>> | null
  ) => void;
  onCompetitionSelect: (
    sportId: number,
    categoryId: number,
    tournamentId: string | null
  ) => void;
  hasActiveSport: boolean;
  visibleEvents: UpcomingEvent[];
  columns: ColumnDef<UpcomingEvent, unknown>[];
  visibleEventsCount: number;
  marketsInViewCount: number;
  averageHomeOdds: string;
};

export function UpcomingEventsTab({
  theme,
  sports,
  categories,
  tournaments,
  events,
  expandedSports,
  expandedCategories,
  selectedSportId,
  selectedCategoryId,
  selectedTournamentId,
  selectedMarketFilter,
  sportOptions,
  categoryOptions,
  tournamentOptions,
  marketOptions,
  onSportToggle,
  onCategoryToggle,
  onSportSelectChange,
  onCategorySelectChange,
  onTournamentSelectChange,
  onMarketSelectChange,
  onCompetitionSelect,
  hasActiveSport,
  visibleEvents,
  columns,
  visibleEventsCount,
  marketsInViewCount,
  averageHomeOdds,
}: UpcomingEventsTabProps) {
  const normalizedTheme: "light" | "dark" | undefined =
    theme === "light" || theme === "dark" ? theme : undefined;
  const selectStyles = useMemo<
    StylesConfig<SelectOption<string>, false, GroupBase<SelectOption<string>>>
  >(
    () =>
      reactSelectStyles<SelectOption<string>, false, GroupBase<SelectOption<string>>>(
        normalizedTheme
      ),
    [normalizedTheme]
  );

  const hierarchyData = useMemo<HierarchySportNode<CompetitionMeta>[]>(() => {
    return sports.map((sport) => {
      const regions = categories
        .filter((category) => category.sportId === sport.id)
        .map((category) => {
          const competitions: HierarchyCompetitionNode<CompetitionMeta>[] = tournaments
            .filter(
              (tournament) =>
                tournament.sportId === sport.id && tournament.categoryId === category.id
            )
            .map<HierarchyCompetitionNode<CompetitionMeta>>((tournament) => ({
              id: tournament.id,
              label: tournament.name,
              count: events.filter((event) => event.tournamentId === tournament.id).length,
              meta: {
                categoryId: category.id,
                tournamentId: tournament.id,
              } satisfies CompetitionMeta,
            }));

          if (competitions.length === 0) {
            competitions.push({
              id: `category-${category.id}`,
              label: `${category.name} (All)`,
              count: events.filter((event) => event.categoryId === category.id).length,
              meta: {
                categoryId: category.id,
              } satisfies CompetitionMeta,
            });
          }

          const regionCount = competitions.reduce(
            (total, competition) => total + (competition.count ?? 0),
            0
          );

          return {
            id: category.id.toString(),
            label: category.name,
            count: regionCount,
            competitions,
          };
        });

      const sportCount = regions.reduce(
        (total, region) => total + (region.count ?? 0),
        0
      );

      return {
        id: sport.id.toString(),
        label: sport.name,
        count: sportCount,
        regions,
      };
    });
  }, [categories, events, sports, tournaments]);

  const expandedSportMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    Object.entries(expandedSports).forEach(([id, value]) => {
      map[id] = value;
    });
    return map;
  }, [expandedSports]);

  const expandedCategoryMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    Object.entries(expandedCategories).forEach(([id, value]) => {
      map[id] = value;
    });
    return map;
  }, [expandedCategories]);

  const handleSportToggleWrapper = useCallback(
    (sportId: string) => {
      onSportToggle(Number(sportId));
    },
    [onSportToggle]
  );

  const handleCategoryToggleWrapper = useCallback(
    (categoryId: string) => {
      onCategoryToggle(Number(categoryId));
    },
    [onCategoryToggle]
  );

  const handleCompetitionSelectWrapper = useCallback(
    (
      sportId: string,
      regionId: string,
      competition: { meta?: CompetitionMeta; id: string }
    ) => {
      const categoryId = competition.meta?.categoryId ?? Number(regionId);
      const tournamentId = competition.meta?.tournamentId ?? null;
      onCompetitionSelect(Number(sportId), categoryId, tournamentId);
    },
    [onCompetitionSelect]
  );

  const selectedCompetitionKey = selectedTournamentId
    ? selectedTournamentId
    : selectedCategoryId != null
    ? `category-${selectedCategoryId}`
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <SportsHierarchyTree<CompetitionMeta>
        data={hierarchyData}
        expandedSports={expandedSportMap}
        expandedRegions={expandedCategoryMap}
        selectedSportId={selectedSportId ? selectedSportId.toString() : null}
        selectedRegionId={selectedCategoryId ? selectedCategoryId.toString() : null}
        selectedCompetitionId={selectedCompetitionKey}
        onToggleSport={handleSportToggleWrapper}
        onToggleRegion={handleCategoryToggleWrapper}
        onSelectCompetition={handleCompetitionSelectWrapper}
        headerTitle="Sports"
        headerDescription="Browse by sport and category to adjust upcoming events."
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Odds Adjustment Workspace
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tune active markets with contextual filters and inline adjustments.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Select<SelectOption<string>, false>
              options={sportOptions}
              value={
                selectedSportId != null
                  ? sportOptions.find((option) => option.value === selectedSportId.toString()) ?? null
                  : null
              }
              styles={selectStyles}
              onChange={(option) => onSportSelectChange(option)}
              placeholder="Sport"
            />

            <Select<SelectOption<string>, false>
              options={categoryOptions}
              value={
                selectedCategoryId != null
                  ? categoryOptions.find((option) => option.value === selectedCategoryId.toString()) ?? null
                  : null
              }
              styles={selectStyles}
              onChange={(option) => onCategorySelectChange(option)}
              isClearable
              isDisabled={selectedSportId == null}
              placeholder="Category"
            />

            <Select<SelectOption<string>, false>
              options={tournamentOptions}
              value={
                selectedTournamentId
                  ? tournamentOptions.find((option) => option.value === selectedTournamentId) ?? null
                  : null
              }
              styles={selectStyles}
              onChange={(option) => onTournamentSelectChange(option)}
              isClearable
              isDisabled={selectedSportId == null}
              placeholder="Tournament"
            />

            <Select<SelectOption<string>, false>
              options={marketOptions}
              value={
                selectedMarketFilter
                  ? marketOptions.find((option) => option.value === selectedMarketFilter) ?? null
                  : null
              }
              styles={selectStyles}
              onChange={(option) => onMarketSelectChange(option)}
              isClearable
              isDisabled={selectedSportId == null}
              placeholder="Markets"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Upcoming Events
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {visibleEventsCount}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Matches currently available for manual pricing.
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Markets in View
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {marketsInViewCount}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Unique market templates across filtered events.
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Average Home Odds
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {averageHomeOdds}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Benchmark of favourites in active markets.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Markets ({marketsInViewCount})
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Adjust odds inline and submit downstream for approval.
            </p>
          </div>

          {hasActiveSport ? (
            <DataTable columns={columns} data={visibleEvents} />
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              Select a sport from the list to begin adjusting odds.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpcomingEventsTab;

