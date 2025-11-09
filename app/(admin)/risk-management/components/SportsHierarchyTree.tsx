"use client";

import React from "react";
import { ChevronDown, ChevronRight, Trophy, MapPinned, CalendarDays } from "lucide-react";

import Button from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";

export type HierarchyCompetitionNode<TMeta = unknown> = {
  id: string;
  label: string;
  count?: number;
  meta?: TMeta;
};

export type HierarchyRegionNode<TMeta = unknown> = {
  id: string;
  label: string;
  count?: number;
  competitions: HierarchyCompetitionNode<TMeta>[];
};

export type HierarchySportNode<TMeta = unknown> = {
  id: string;
  label: string;
  count?: number;
  regions: HierarchyRegionNode<TMeta>[];
};

type SportsHierarchyTreeProps<TMeta = unknown> = {
  data: HierarchySportNode<TMeta>[];
  expandedSports: Record<string, boolean>;
  expandedRegions: Record<string, boolean>;
  selectedSportId: string | null;
  selectedRegionId: string | null;
  selectedCompetitionId: string | null;
  onToggleSport: (sportId: string) => void;
  onToggleRegion: (regionId: string) => void;
  onSelectCompetition: (
    sportId: string,
    regionId: string,
    competition: HierarchyCompetitionNode<TMeta>
  ) => void;
  renderCompetitionActions?: (competition: HierarchyCompetitionNode<TMeta>) => React.ReactNode;
  headerTitle?: string;
  headerDescription?: string;
};

export function SportsHierarchyTree<TMeta = unknown>({
  data,
  expandedSports,
  expandedRegions,
  selectedSportId,
  selectedRegionId,
  selectedCompetitionId,
  onToggleSport,
  onToggleRegion,
  onSelectCompetition,
  renderCompetitionActions,
  headerTitle = "Sports",
  headerDescription = "Browse available competitions",
}: SportsHierarchyTreeProps<TMeta>) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-lg shadow-brand-900/5 dark:border-gray-700 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{headerTitle}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{headerDescription}</p>
      </div>

      <div className="space-y-3 p-4">
        {data.map((sport) => {
          const isSportActive = selectedSportId === sport.id;
          const isSportExpanded = expandedSports[sport.id] ?? false;
          const sportCount =
            sport.count ??
            sport.regions.reduce(
              (sportTotal, region) =>
                sportTotal +
                region.competitions.reduce(
                  (regionTotal, competition) => regionTotal + (competition.count ?? 0),
                  0
                ),
              0
            );

          return (
            <div key={sport.id} className="space-y-2">
              <Button
                variant="outline"
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gradient-to-r from-white to-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-brand-200 hover:from-brand-50 hover:to-white hover:text-brand-600 dark:border-gray-700 dark:from-gray-900 dark:to-gray-900 dark:text-gray-100 dark:hover:border-brand-700 dark:hover:from-brand-500/10 dark:hover:to-gray-900",
                  isSportActive &&
                    "border-brand-300 from-brand-50 to-white text-brand-600 shadow-sm dark:border-brand-700 dark:from-brand-500/20 dark:to-gray-900 dark:text-brand-200"
                )}
                onClick={() => onToggleSport(sport.id)}
              >
                <span className="flex flex-1 items-center gap-3 text-left">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-200">
                    <Trophy className="h-5 w-5" />
                  </span>
                  {isSportExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  )}
                  <span className="truncate">{sport.label}</span>
                </span>
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                  {sportCount}
                </span>
              </Button>

              {isSportExpanded && sport.regions.length > 0 && (
                <div className="space-y-2 pl-3">
                  {sport.regions.map((region) => {
                    const isRegionActive = selectedRegionId === region.id;
                    const isRegionExpanded = expandedRegions[region.id] ?? false;
                    const regionCount =
                      region.count ??
                      region.competitions.reduce(
                        (total, competition) => total + (competition.count ?? 0),
                        0
                      );

                    return (
                      <div key={region.id} className="space-y-1">
                        <button
                          type="button"
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-1.5 text-left text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                            isRegionActive &&
                              "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"
                          )}
                          onClick={() => onToggleRegion(region.id)}
                        >
                          <span className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/5 text-brand-500 dark:bg-brand-500/10 dark:text-brand-200">
                              <MapPinned className="h-4 w-4" />
                            </span>
                            {isRegionExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            )}
                            <span>{region.label}</span>
                          </span>
                          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                            {regionCount}
                          </span>
                        </button>

                        {isRegionExpanded && region.competitions.length > 0 && (
                          <div className="space-y-1 border-l border-dashed border-gray-200 pl-3 dark:border-gray-700">
                            {region.competitions.map((competition) => {
                              const isSelected = selectedCompetitionId === competition.id;
                              return (
                                <div
                                  key={competition.id}
                                  className={cn(
                                    "flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-1.5 text-sm transition dark:text-gray-300",
                                    isSelected
                                      ? "border-brand-200 bg-brand-50 text-brand-600 shadow-sm dark:border-brand-700 dark:bg-brand-500/10 dark:text-brand-200"
                                      : "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:text-gray-300"
                                  )}
                                >
                                  <button
                                    type="button"
                                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                    onClick={() =>
                                      onSelectCompetition(sport.id, region.id, competition)
                                    }
                                  >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/5 text-brand-600 dark:bg-brand-500/10 dark:text-brand-200">
                                      <CalendarDays className="h-4 w-4" />
                                    </span>
                                    <span className="truncate text-sm text-gray-700 dark:text-gray-200">
                                      {competition.label}
                                      {typeof competition.count !== "undefined" &&
                                        ` (${competition.count})`}
                                    </span>
                                  </button>

                                  {renderCompetitionActions && (
                                    <div className="flex-shrink-0">
                                      {renderCompetitionActions(competition)}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SportsHierarchyTree;

