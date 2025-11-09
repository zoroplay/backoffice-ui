"use client";

import React, { useCallback, useMemo, useState } from "react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { withAuth } from "@/utils/withAuth";
import { Settings } from "lucide-react";

import { combinabilityOptions, sportsHierarchy } from "./data";
import CompetitionSettingsModal from "./components/CompetitionSettingsModal";
import EventsTable from "./components/EventsTable";
import SportsHierarchyTree, {
  type HierarchyCompetitionNode,
  type HierarchySportNode,
} from "../components/SportsHierarchyTree";
import type {
  Competition,
  CompetitionSettings,
  EventItem,
  SportsHierarchy,
} from "./types";

type CompetitionPath = {
  sportId: string;
  regionId: string;
  competition: Competition;
};

function findCompetition(
  data: SportsHierarchy,
  competitionId: string
): CompetitionPath | null {
  for (const sport of data) {
    for (const region of sport.regions) {
      const competition = region.competitions.find(
        (item) => item.id === competitionId
      );
      if (competition) {
        return {
          sportId: sport.id,
          regionId: region.id,
          competition,
        };
      }
    }
  }
  return null;
}

function EventOddsMarginsPage() {
  const [sportsData, setSportsData] = useState<SportsHierarchy>(
    sportsHierarchy
  );
  const [expandedSports, setExpandedSports] = useState<Record<string, boolean>>(
    {}
  );
  const [expandedRegions, setExpandedRegions] = useState<
    Record<string, boolean>
  >({});
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<
    string | null
  >(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsCompetitionId, setSettingsCompetitionId] = useState<
    string | null
  >(null);
  const [settingsForm, setSettingsForm] = useState<CompetitionSettings>({
    margin: 0,
    combinability: "all",
    status: "enabled",
    cashOut: "enabled",
  });

  const toggleSport = useCallback((sportId: string) => {
    setExpandedSports((prev) => ({
      ...prev,
      [sportId]: !prev[sportId],
    }));
  }, []);

  const toggleRegion = useCallback((regionId: string) => {
    setExpandedRegions((prev) => ({
      ...prev,
      [regionId]: !prev[regionId],
    }));
  }, []);

  const handleSelectCompetition = useCallback(
    (
      sportId: string,
      regionId: string,
      competition: HierarchyCompetitionNode<{ competitionId: string }>
    ) => {
      const competitionId = competition.meta?.competitionId ?? competition.id;
      setExpandedSports((prev) => ({ ...prev, [sportId]: true }));
      setExpandedRegions((prev) => ({ ...prev, [regionId]: true }));
      setSelectedSportId(sportId);
      setSelectedRegionId(regionId);
      setSelectedCompetitionId(competitionId);
    },
    []
  );

  const sportsTreeData = useMemo<HierarchySportNode<{ competitionId: string }>[]>(() =>
    sportsData.map((sport) => {
      const regions = sport.regions.map((region) => {
        const competitions = region.competitions.map((competition) => ({
          id: competition.id,
          label: competition.name,
          count: competition.events.length,
          meta: { competitionId: competition.id },
        }));

        const regionCount = competitions.reduce(
          (total, competition) => total + (competition.count ?? 0),
          0
        );

        return {
          id: region.id,
          label: region.name,
          count: regionCount,
          competitions,
        };
      });

      const sportCount = regions.reduce(
        (total, region) => total + (region.count ?? 0),
        0
      );

      return {
        id: sport.id,
        label: sport.name,
        count: sportCount,
        regions,
      };
    }),
  [sportsData]);

  const updateCompetition = useCallback(
    (
      competitionId: string,
      updater: (competition: Competition) => Competition
    ) => {
      setSportsData((prev) =>
        prev.map((sport) => ({
          ...sport,
          regions: sport.regions.map((region) => ({
            ...region,
            competitions: region.competitions.map((competition) =>
              competition.id === competitionId
                ? updater(competition)
                : competition
            ),
          })),
        }))
      );
    },
    []
  );

  const selectedCompetition = useMemo(() => {
    if (!selectedCompetitionId) {
      return null;
    }
    const match = findCompetition(sportsData, selectedCompetitionId);
    return match?.competition ?? null;
  }, [selectedCompetitionId, sportsData]);

  const settingsCompetition = useMemo(() => {
    if (!settingsCompetitionId) {
      return null;
    }
    const match = findCompetition(sportsData, settingsCompetitionId);
    return match?.competition ?? null;
  }, [settingsCompetitionId, sportsData]);

  const visibleEvents: EventItem[] = selectedCompetition?.events ?? [];

  const totalEvents = visibleEvents.length;
  const highlightedCount = visibleEvents.filter(
    (event) => event.highlighted
  ).length;
  const activeCount = visibleEvents.filter(
    (event) => event.status === "active"
  ).length;

  const handleToggleHighlight = useCallback(
    (eventId: string, value: boolean) => {
      if (!selectedCompetitionId) {
        return;
      }
      updateCompetition(selectedCompetitionId, (competition) => ({
        ...competition,
        events: competition.events.map((event) =>
          event.id === eventId ? { ...event, highlighted: value } : event
        ),
      }));
    },
    [selectedCompetitionId, updateCompetition]
  );

  const handleToggleStatus = useCallback(
    (eventId: string) => {
      if (!selectedCompetitionId) {
        return;
      }
      updateCompetition(selectedCompetitionId, (competition) => ({
        ...competition,
        events: competition.events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                status: event.status === "active" ? "inactive" : "active",
              }
            : event
        ),
      }));
    },
    [selectedCompetitionId, updateCompetition]
  );

  const openSettingsModal = useCallback(
    (competitionId: string) => {
      const match = findCompetition(sportsData, competitionId);
      if (!match) {
        return;
      }
      setSettingsCompetitionId(competitionId);
      setSettingsForm(match.competition.settings);
      setIsSettingsModalOpen(true);
    },
    [sportsData]
  );

  const handleSettingsChange = useCallback(
    (
      field: keyof CompetitionSettings,
      value: CompetitionSettings[keyof CompetitionSettings]
    ) => {
      setSettingsForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSettingsSave = useCallback(() => {
    if (!settingsCompetitionId) {
      return;
    }
    updateCompetition(settingsCompetitionId, (competition) => ({
      ...competition,
      settings: settingsForm,
    }));
    setIsSettingsModalOpen(false);
  }, [settingsCompetitionId, settingsForm, updateCompetition]);

  const settingsCompetitionName = settingsCompetition?.name ?? "Competition";

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Event & Odds Margins" />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <SportsHierarchyTree<{ competitionId: string }>
          data={sportsTreeData}
          expandedSports={expandedSports}
          expandedRegions={expandedRegions}
          selectedSportId={selectedSportId}
          selectedRegionId={selectedRegionId}
          selectedCompetitionId={selectedCompetitionId}
          onToggleSport={toggleSport}
          onToggleRegion={toggleRegion}
          onSelectCompetition={handleSelectCompetition}
          headerTitle="Event & Odds Margins"
          headerDescription="Browse sports, regions, and competitions to manage margins."
          renderCompetitionActions={(competition) => (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openSettingsModal(competition.id);
              }}
              className="ml-3 text-gray-400 transition hover:text-brand-500"
            >
              <Settings size={16} />
            </button>
          )}
        />

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Total Events
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {totalEvents}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Events currently loaded for the selected competition.
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Highlighted
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {highlightedCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Events currently flagged for promotion.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Active Events
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {activeCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Events available for trading at the moment.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            {selectedCompetition ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedCompetition.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCompetition.events.length} scheduled events
                  </p>
                </div>

                <EventsTable
                  events={visibleEvents}
                  onToggleHighlight={handleToggleHighlight}
                  onToggleStatus={handleToggleStatus}
                />
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                Select a competition to manage its events.
              </div>
            )}
          </div>
        </div>
      </div>

      <CompetitionSettingsModal
        isOpen={isSettingsModalOpen}
        competitionName={settingsCompetitionName}
        form={settingsForm}
        combinabilityOptions={combinabilityOptions}
        onChange={handleSettingsChange}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSettingsSave}
      />
    </div>
  );
}

export default withAuth(EventOddsMarginsPage);

