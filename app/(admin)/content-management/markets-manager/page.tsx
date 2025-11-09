"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select, { type GroupBase, type MultiValue, type SingleValue } from "react-select";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Switch from "@/components/form/switch/Switch";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { withAuth } from "@/utils/withAuth";

import {
  MarketDefinition,
  MarketGroup,
  SelectOption,
  TournamentMarket,
  sportHierarchy,
  type SportHierarchy,
  marketDefinitions,
  marketGroups,
  sportsOptions,
} from "./data";
import {
  MarketGroupRow,
  MarketRow,
  TournamentMarketRow,
  marketColumns,
  marketGroupColumns,
  tournamentMarketColumns,
  createMarketGroupActionColumn,
  createTournamentMarketActionColumn,
} from "./columns";
import { MarketGroupingTab } from "./components/MarketGroupingTab";
import { MarketsTab } from "./components/MarketsTab";
import { MarketSettingsTab } from "./components/MarketSettingsTab";

type StatusOption = SelectOption<MarketDefinition["status"]>;
type CashoutOption = SelectOption<MarketDefinition["cashout"]>;
type MarketTypeOption = SelectOption<string>;

type MarketFormState = {
  sport: SelectOption | null;
  marketType: MarketTypeOption | null;
  group: SelectOption | null;
  name: string;
  shortName: string;
  description: string;
  specifier: string;
  status: StatusOption | null;
  cashout: CashoutOption | null;
  priority: number;
  isPopular: boolean;
};

type GroupFormState = {
  sport: SelectOption | null;
  name: string;
  description: string;
};

const statusOptions: StatusOption[] = [
  { value: "Enabled", label: "Enabled" },
  { value: "Disabled", label: "Disabled" },
];

const cashoutOptions: CashoutOption[] = [
  { value: "Enabled", label: "Enabled" },
  { value: "Disabled", label: "Disabled" },
];

const marketTypeOptions: MarketTypeOption[] = [
  { value: "BetRadar", label: "BetRadar" },
  { value: "Custom", label: "Custom" },
  { value: "In-House", label: "In-House" },
];

type MarketAssignmentState = Record<string, string[]>;

const buildInitialAssignments = (): MarketAssignmentState => {
  const initial: MarketAssignmentState = {};
  sportHierarchy.forEach((entry) => {
    entry.categories.forEach((category) => {
      category.tournaments.forEach((tournament) => {
        initial[tournament.tournament.value] = [...tournament.marketIds];
      });
    });
  });
  return initial;
};

const mapGroupToRow = (group: MarketGroup): MarketGroupRow => ({
  id: group.id,
  name: group.name,
  sport: sportsOptions.find((option) => option.value === group.sport)?.label ?? group.sport,
  marketCount: group.marketCount,
  description: group.description,
  lastUpdated: group.lastUpdated,
});

const mapMarketToRow = (market: MarketDefinition): MarketRow => ({
  id: market.id,
  name: market.name,
  marketType: market.marketType,
  shortName: market.shortName,
  description: market.description,
  status: market.status,
  cashout: market.cashout,
  priority: market.priority,
  isPopular: market.isPopular,
  lastUpdated: market.lastUpdated,
});

const mapTournamentMarketToRow = (market: TournamentMarket): TournamentMarketRow => ({
  id: market.id,
  name: market.name,
  status: market.status,
  action: market.action ?? "Assigned",
});

const MarketsManagerPage: React.FC = () => {
  const { theme } = useTheme();
  const initialSportOption = sportsOptions[0] ?? null;

  const createMarketFormState = useCallback(
    (overrides?: Partial<MarketFormState>): MarketFormState => ({
      sport: initialSportOption,
      marketType: marketTypeOptions[0],
      group: null,
      name: "",
      shortName: "",
      description: "",
      specifier: "",
      status: statusOptions[0],
      cashout: cashoutOptions[0],
      priority: 1,
      isPopular: false,
      ...overrides,
    }),
    [initialSportOption]
  );

  const [groups, setGroups] = useState<MarketGroup[]>(marketGroups);
  const [markets, setMarkets] = useState<MarketDefinition[]>(marketDefinitions);
  const [assignments, setAssignments] = useState<MarketAssignmentState>(() => buildInitialAssignments());

  const [groupFilter, setGroupFilter] = useState<SelectOption | null>(initialSportOption);
  const [marketSelections, setMarketSelections] = useState<SelectOption[]>([]);
  const [settingsSelections, setSettingsSelections] = useState<SelectOption[]>([]);
  const [hasInitializedSettings, setHasInitializedSettings] = useState(false);
  const [tournamentMarketNotes, setTournamentMarketNotes] = useState<Record<string, string>>({});
  const [editingTournamentMarket, setEditingTournamentMarket] = useState<TournamentMarketRow | null>(null);
  const [isTournamentMarketModalOpen, setIsTournamentMarketModalOpen] = useState(false);
  const [tournamentNoteDraft, setTournamentNoteDraft] = useState("");

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupForm, setGroupForm] = useState<GroupFormState>({
    sport: initialSportOption,
    name: "",
    description: "",
  });
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
  const [marketForm, setMarketForm] = useState<MarketFormState>(() => createMarketFormState());
  const [editingMarketId, setEditingMarketId] = useState<string | null>(null);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedAssignmentMarkets, setSelectedAssignmentMarkets] = useState<SelectOption[]>([]);

  const handleGroupFilterChange = useCallback(
    (option: SingleValue<SelectOption>) => {
      setGroupFilter(option ?? null);
    },
    []
  );

  const handleMarketSelectionsChange = useCallback(
    (options: MultiValue<SelectOption>) => {
      setMarketSelections(options as SelectOption[]);
    },
    []
  );

  useEffect(() => {
    if (!hasInitializedSettings && settingsSelections.length === 0 && sportsOptions.length > 0) {
      const defaultSport = sportsOptions[0];
      const sportEntry =
        sportHierarchy.find((entry) => entry.sport.value === defaultSport.value) ?? null;

      const initialSelections: SelectOption[] = [
        { value: `sport:${defaultSport.value}`, label: defaultSport.label },
      ];

      if (sportEntry?.categories[0]) {
        const category = sportEntry.categories[0];
        initialSelections.push({
          value: `category:${category.category.value}`,
          label: category.category.label,
        });

        if (category.tournaments[0]) {
          initialSelections.push({
            value: `tournament:${category.tournaments[0].tournament.value}`,
            label: category.tournaments[0].tournament.label,
          });
        }
      }

      setSettingsSelections(initialSelections);
      setHasInitializedSettings(true);
    }
  }, [hasInitializedSettings, settingsSelections.length, sportsOptions]);

  const settingsFilterState = useMemo<{
    sport: SelectOption | null;
    category: SelectOption | null;
    tournament: SelectOption | null;
  }>(() => {
    let sport: SelectOption | null = null;
    let category: SelectOption | null = null;
    let tournament: SelectOption | null = null;

    settingsSelections.forEach((option) => {
      const [prefix] = option.value.split(":");
      if (prefix === "sport") {
        sport = {
          value: option.value.slice("sport:".length),
          label: option.label,
        };
      }
      if (prefix === "category") {
        category = {
          value: option.value.slice("category:".length),
          label: option.label,
        };
      }
      if (prefix === "tournament") {
        tournament = {
          value: option.value.slice("tournament:".length),
          label: option.label,
        };
      }
    });

    return { sport, category, tournament };
  }, [settingsSelections]);

  const activeSportHierarchy = useMemo<SportHierarchy | null>(() => {
    const targetSport = settingsFilterState.sport?.value ?? null;
    if (!targetSport) return null;
    return sportHierarchy.find((item) => item.sport.value === targetSport) ?? null;
  }, [settingsFilterState.sport]);

  const settingsFilterOptions = useMemo<GroupBase<SelectOption>[]>(() => {
    const sportOptionsList = sportsOptions.map((sport) => ({
      value: `sport:${sport.value}`,
      label: sport.label,
    }));

    const sportEntry = activeSportHierarchy;
    const categoryOptionsList = sportEntry
      ? sportEntry.categories.map((categoryEntry: SportHierarchy["categories"][number]) => ({
          value: `category:${categoryEntry.category.value}`,
          label: categoryEntry.category.label,
        }))
      : [];

    const categoryEntry =
      sportEntry && settingsFilterState.category
        ? sportEntry.categories.find(
            (categoryItem: SportHierarchy["categories"][number]) =>
              categoryItem.category.value === settingsFilterState.category?.value
          )
        : null;

    const tournamentOptionsList = categoryEntry
      ? categoryEntry.tournaments.map(
          (tournamentEntry: SportHierarchy["categories"][number]["tournaments"][number]) => ({
            value: `tournament:${tournamentEntry.tournament.value}`,
            label: tournamentEntry.tournament.label,
          })
        )
      : [];

    const optionGroups = [
      { label: "Sport", options: sportOptionsList },
    ];

    if (categoryOptionsList.length > 0) {
      optionGroups.push({ label: "Category", options: categoryOptionsList });
    }

    if (tournamentOptionsList.length > 0) {
      optionGroups.push({ label: "Tournament", options: tournamentOptionsList });
    }

    return optionGroups;
  }, [activeSportHierarchy, settingsFilterState.category, sportsOptions]);

  const selectedSportValue = settingsFilterState.sport?.value ?? null;
  const selectedCategoryValue = settingsFilterState.category?.value ?? null;
  const selectedTournamentValue = settingsFilterState.tournament?.value ?? null;

  const marketFilterOptions = useMemo<Array<{ label: string; options: SelectOption[] }>>(() => {
    const sportOptionsList = sportsOptions.map((sport) => ({
      value: `sport:${sport.value}`,
      label: sport.label,
    }));
    const groupOptionsList = groups.map((group) => ({
      value: `group:${group.id}`,
      label: `${mapGroupToRow(group).sport} • ${group.name}`,
    }));
    return [
      {
        label: "Sport",
        options: sportOptionsList,
      },
      {
        label: "Market Group",
        options: groupOptionsList,
      },
    ];
  }, [groups, sportsOptions]);

  const groupedRows = useMemo(() => {
    return groups
      .filter((group) => !groupFilter || group.sport === groupFilter.value)
      .map(mapGroupToRow);
  }, [groupFilter, groups]);

  const sportSummary = useMemo(() => {
    if (!groupFilter) return { total: groups.length, markets: groups.reduce((acc, cur) => acc + cur.marketCount, 0) };
    const relevant = groups.filter((group) => group.sport === groupFilter.value);
    return {
      total: relevant.length,
      markets: relevant.reduce((acc, cur) => acc + cur.marketCount, 0),
    };
  }, [groupFilter, groups]);

  const marketFilterState = useMemo(() => {
    let selectedSport: string | null = null;
    const selectedGroupIds = new Set<string>();

    marketSelections.forEach((selection) => {
      if (selection.value.startsWith("sport:")) {
        selectedSport = selection.value.slice("sport:".length);
      } else if (selection.value.startsWith("group:")) {
        selectedGroupIds.add(selection.value.slice("group:".length));
      }
    });

    return {
      selectedSport,
      selectedGroupIds,
    };
  }, [marketSelections]);

  const filteredMarketRows = useMemo(() => {
    const { selectedSport, selectedGroupIds } = marketFilterState;

    return markets
      .filter((market) => {
        const matchesSport = selectedSport ? market.sport === selectedSport : true;
        const matchesGroup =
          selectedGroupIds.size > 0 ? selectedGroupIds.has(market.groupId) : true;
        return matchesSport && matchesGroup;
      })
      .map(mapMarketToRow);
  }, [marketFilterState, markets]);

  const groupOptionsForSport = useMemo(() => {
    const sportValue = marketForm.sport?.value ?? marketFilterState.selectedSport ?? null;
    return groups
      .filter((group) => !sportValue || group.sport === sportValue)
      .map((group) => ({ value: group.id, label: group.name }));
  }, [groups, marketFilterState.selectedSport, marketForm.sport]);

  const availableMarketsForSettings = useMemo(() => {
    const pool =
      markets.filter((market) => !selectedSportValue || market.sport === selectedSportValue) ??
      markets;

    const unique = new Map<string, MarketDefinition>();
    pool.forEach((market) => {
      if (!unique.has(market.id)) {
        unique.set(market.id, market);
      }
    });

    return Array.from(unique.values()).map((market) => ({
      value: market.id,
      label: `${market.name} (${market.shortName})`,
    }));
  }, [markets, selectedSportValue]);

  const tournamentMarketRows = useMemo(() => {
    if (!selectedTournamentValue) return [];
    const marketIds = assignments[selectedTournamentValue] ?? [];
    return marketIds
      .map((marketId) => markets.find((market) => market.id === marketId))
      .filter((market): market is MarketDefinition => Boolean(market))
      .map((market) => {
        const tournamentMarket: TournamentMarket = {
          id: market.id,
          sport: market.sport,
          category: selectedCategoryValue ?? "",
          tournament: selectedTournamentValue ?? "",
          name: market.name,
          status: market.status === "Enabled" ? "Active" : "Inactive",
          action: tournamentMarketNotes[market.id] ?? "Assigned",
        };
        return mapTournamentMarketToRow(tournamentMarket);
      });
  }, [assignments, markets, selectedCategoryValue, selectedTournamentValue, tournamentMarketNotes]);

  const summaryMarkets = useMemo(() => {
    const total = filteredMarketRows.length;
    const enabled = filteredMarketRows.filter((row) => row.status === "Enabled").length;
    const cashoutEnabled = filteredMarketRows.filter((row) => row.cashout === "Enabled").length;
    return { total, enabled, cashoutEnabled };
  }, [filteredMarketRows]);

  const handleSettingsSelectionChange = useCallback(
    (value: MultiValue<SelectOption>) => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        setSettingsSelections([]);
        setHasInitializedSettings(true);
        return;
      }

      const typeOrder: Array<"sport" | "category" | "tournament"> = [
        "sport",
        "category",
        "tournament",
      ];
      const typeMap = new Map<string, SelectOption>();

      (value as SelectOption[]).forEach((option) => {
        const [type] = option.value.split(":");
        if (typeOrder.includes(type as any)) {
          typeMap.set(type, option);
        }
      });

      let sportOption = typeMap.get("sport") ?? null;
      let categoryOption = typeMap.get("category") ?? null;
      let tournamentOption = typeMap.get("tournament") ?? null;

      if (sportOption) {
        const sportValue = sportOption.value.slice("sport:".length);
        const sportEntry = sportHierarchy.find(
          (entry) => entry.sport.value === sportValue
        );

        if (!sportEntry) {
          sportOption = null;
          categoryOption = null;
          tournamentOption = null;
        } else {
          if (categoryOption) {
            const categoryValue = categoryOption.value.slice("category:".length);
            const categoryEntry = sportEntry.categories.find(
              (category) => category.category.value === categoryValue
            );
            if (!categoryEntry) {
              categoryOption = null;
              tournamentOption = null;
            } else if (tournamentOption) {
              const tournamentValue = tournamentOption.value.slice(
                "tournament:".length
              );
              const tournamentExists = categoryEntry.tournaments.some(
                (tournament) => tournament.tournament.value === tournamentValue
              );
              if (!tournamentExists) {
                tournamentOption = null;
              }
            }
          } else {
            tournamentOption = null;
          }
        }
      } else {
        categoryOption = null;
        tournamentOption = null;
      }

      const sanitized: SelectOption[] = [];
      if (sportOption) sanitized.push(sportOption);
      if (categoryOption) sanitized.push(categoryOption);
      if (tournamentOption) sanitized.push(tournamentOption);

      setSettingsSelections(sanitized);
      setHasInitializedSettings(true);
    },
    [sportHierarchy]
  );

  const openCreateGroupModal = () => {
    setEditingGroupId(null);
    setGroupForm({
      sport: groupFilter ?? initialSportOption,
      name: "",
      description: "",
    });
    setIsGroupModalOpen(true);
  };

  const openEditGroupModal = useCallback(
    (row: MarketGroupRow) => {
      const group = groups.find((item) => item.id === row.id);
      if (!group) return;
      const sportOption = sportsOptions.find((item) => item.value === group.sport) ?? null;
      setEditingGroupId(group.id);
      setGroupForm({
        sport: sportOption,
        name: group.name,
        description: group.description,
      });
      setIsGroupModalOpen(true);
    },
    [groups, sportsOptions]
  );

  const handleGroupSubmit = () => {
    if (!groupForm.sport || !groupForm.name.trim()) {
      alert("Please provide a sport and group name.");
      return;
    }
    const now = new Date().toISOString();
    if (editingGroupId) {
      setGroups((prev) =>
        prev.map((group) =>
          group.id === editingGroupId
            ? {
                ...group,
                sport: groupForm.sport!.value,
                name: groupForm.name.trim(),
                description: groupForm.description.trim(),
                lastUpdated: now,
              }
            : group
        )
      );
      alert("Market group updated (mock).");
    } else {
      const newGroup: MarketGroup = {
        id: `grp-${Date.now()}`,
        sport: groupForm.sport.value,
        name: groupForm.name.trim(),
        description: groupForm.description.trim(),
        marketCount: 0,
        lastUpdated: now,
      };
      setGroups((prev) => [newGroup, ...prev]);
      alert("Market group created (mock).");
    }
    setIsGroupModalOpen(false);
  };

  const handleDeleteGroup = useCallback(
    (groupId: string) => {
      const group = groups.find((item) => item.id === groupId);
      if (!group) return;
      const sportLabel = sportsOptions.find((option) => option.value === group.sport)?.label ?? group.sport;
      const confirmed = window.confirm(`Remove "${group.name}" from ${sportLabel} groups?`);
      if (!confirmed) return;

      setGroups((prev) => prev.filter((item) => item.id !== groupId));
      setMarkets((prev) => prev.filter((market) => market.groupId !== groupId));
    },
    [groups, sportsOptions]
  );

  const handleEditTournamentMarket = useCallback(
    (row: TournamentMarketRow) => {
      if (row.id.startsWith("placeholder")) return;
      setEditingTournamentMarket(row);
      setTournamentNoteDraft(tournamentMarketNotes[row.id] ?? row.action ?? "");
      setIsTournamentMarketModalOpen(true);
    },
    [tournamentMarketNotes]
  );

  const groupColumns = useMemo(
    () => [
      ...marketGroupColumns,
      createMarketGroupActionColumn({ onEdit: openEditGroupModal, onDelete: handleDeleteGroup }),
    ],
    [handleDeleteGroup, openEditGroupModal]
  );

  const openCreateMarketModal = () => {
    setEditingMarketId(null);

    const defaultSportOption =
      selectedSportValue
        ? sportsOptions.find((option) => option.value === selectedSportValue) ?? initialSportOption
        : initialSportOption;

    const defaultGroupOption =
      marketFilterState.selectedGroupIds.size === 1
        ? (() => {
            const [groupId] = Array.from(marketFilterState.selectedGroupIds);
            const group = groups.find((item) => item.id === groupId);
            return group ? { value: group.id, label: group.name } : null;
          })()
        : null;

    setMarketForm(
      createMarketFormState({
        sport: defaultSportOption,
        group: defaultGroupOption,
      })
    );
    setIsMarketModalOpen(true);
  };

  const openEditMarketModal = useCallback(
    (row: MarketRow) => {
      const market = markets.find((item) => item.id === row.id);
      if (!market) return;
      setEditingMarketId(market.id);
      setMarketForm({
        sport: sportsOptions.find((option) => option.value === market.sport) ?? null,
        marketType: marketTypeOptions.find((option) => option.value === market.marketType) ?? marketTypeOptions[0],
        group: groups
          .filter((group) => group.sport === market.sport)
          .map((group) => ({ value: group.id, label: group.name }))
          .find((option) => option.value === market.groupId) ?? null,
        name: market.name,
        shortName: market.shortName,
        description: market.description,
        specifier: market.specifier,
        status: statusOptions.find((option) => option.value === market.status) ?? statusOptions[0],
        cashout: cashoutOptions.find((option) => option.value === market.cashout) ?? cashoutOptions[1],
        priority: market.priority,
        isPopular: market.isPopular,
      });
      setIsMarketModalOpen(true);
    },
    [groups, markets, sportsOptions]
  );

  const handleMarketSubmit = () => {
    if (!marketForm.sport || !marketForm.group || !marketForm.name.trim()) {
      alert("Please complete required fields: sport, group, and name.");
      return;
    }
    const now = new Date().toISOString();
    if (editingMarketId) {
      setMarkets((prev) =>
        prev.map((market) =>
          market.id === editingMarketId
            ? {
                ...market,
                sport: marketForm.sport!.value,
                marketType: marketForm.marketType!.value,
                groupId: marketForm.group!.value,
                name: marketForm.name.trim(),
                shortName: marketForm.shortName.trim(),
                description: marketForm.description.trim(),
                specifier: marketForm.specifier.trim(),
                status: marketForm.status!.value as MarketDefinition["status"],
                cashout: marketForm.cashout!.value as MarketDefinition["cashout"],
                priority: marketForm.priority,
                isPopular: marketForm.isPopular,
                lastUpdated: now,
              }
            : market
        )
      );
      alert("Market updated (mock).");
    } else {
      const newMarket: MarketDefinition = {
        id: `market-${Date.now()}`,
        sport: marketForm.sport.value,
        marketType: marketForm.marketType?.value ?? "Custom",
        groupId: marketForm.group.value,
        name: marketForm.name.trim(),
        shortName: marketForm.shortName.trim() || marketForm.name.trim().slice(0, 6),
        description: marketForm.description.trim(),
        specifier: marketForm.specifier.trim(),
        status: (marketForm.status?.value ?? "Enabled") as MarketDefinition["status"],
        cashout: (marketForm.cashout?.value ?? "Disabled") as MarketDefinition["cashout"],
        priority: marketForm.priority,
        isPopular: marketForm.isPopular,
        lastUpdated: now,
      };
      setMarkets((prev) => [newMarket, ...prev]);
      setGroups((prev) =>
        prev.map((group) =>
          group.id === newMarket.groupId
            ? { ...group, marketCount: group.marketCount + 1, lastUpdated: now }
            : group
        )
      );
      alert("Market created (mock).");
    }
    setIsMarketModalOpen(false);
  };

  const openAssignmentModal = () => {
    if (!selectedTournamentValue) {
      alert("Choose a tournament first.");
      return;
    }
    const assignedIds = assignments[selectedTournamentValue] ?? [];
    const availableOptions = availableMarketsForSettings.filter(
      (option) => !assignedIds.includes(option.value)
    );
    setSelectedAssignmentMarkets(availableOptions.slice(0, 3));
    setIsAssignmentModalOpen(true);
  };

  const handleAssignMarkets = () => {
    if (!selectedTournamentValue) return;
    if (selectedAssignmentMarkets.length === 0) {
      alert("Select at least one market to assign.");
      return;
    }
    setAssignments((prev) => {
      const existing = prev[selectedTournamentValue] ?? [];
      const next = Array.from(
        new Set([...existing, ...selectedAssignmentMarkets.map((option) => option.value)])
      );
      return {
        ...prev,
        [selectedTournamentValue]: next,
      };
    });
    setIsAssignmentModalOpen(false);
  };

  const handleRemoveTournamentMarket = (marketId: string) => {
    if (marketId.startsWith("placeholder")) return;
    if (!selectedTournamentValue) return;
    const marketName =
      tournamentMarketRows.find((row) => row.id === marketId)?.name ?? "this market";
    const confirmed = window.confirm(
      `Remove "${marketName}" from the selected tournament?`
    );
    if (!confirmed) return;
    setAssignments((prev) => {
      const updated = (prev[selectedTournamentValue] ?? []).filter((id) => id !== marketId);
      return {
        ...prev,
        [selectedTournamentValue]: updated,
      };
    });
    setTournamentMarketNotes((prev) => {
      if (!(marketId in prev)) return prev;
      const next = { ...prev };
      delete next[marketId];
      return next;
    });
  };

  const tournamentColumns = useMemo(
    () => [
      ...tournamentMarketColumns,
      createTournamentMarketActionColumn({
        onEdit: handleEditTournamentMarket,
        onDelete: handleRemoveTournamentMarket,
      }),
    ],
    [handleEditTournamentMarket, handleRemoveTournamentMarket]
  );

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Markets Manager" />

      <Tabs defaultValue="grouping" className="space-y-6">
        <TabsList className="mb-6 h-auto rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:from-gray-900/40 dark:to-gray-900/20">
          <TabsTrigger
            value="grouping"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-brand-500 data-[state=active]:border data-[state=active]:border-brand-200 data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-md dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-300 dark:data-[state=active]:border-brand-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-300"
          >
            Market Grouping
          </TabsTrigger>
          <TabsTrigger
            value="markets"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-indigo-500 data-[state=active]:border data-[state=active]:border-indigo-200 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-300 dark:data-[state=active]:border-indigo-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-indigo-300"
          >
            Markets
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-emerald-500 data-[state=active]:border data-[state=active]:border-emerald-200 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-md dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-emerald-300 dark:data-[state=active]:border-emerald-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-emerald-300"
          >
            Market Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grouping">
          <MarketGroupingTab
            theme={theme}
            sportsOptions={sportsOptions}
            groupFilter={groupFilter}
            onGroupFilterChange={handleGroupFilterChange}
            sportSummary={sportSummary}
            groupColumns={groupColumns}
            groupedRows={groupedRows}
            onRowClick={openEditGroupModal}
            onCreateGroup={openCreateGroupModal}
          />
        </TabsContent>

        <TabsContent value="markets">
          <MarketsTab
            theme={theme}
            filterOptions={marketFilterOptions}
            selections={marketSelections}
            onSelectionsChange={handleMarketSelectionsChange}
            summary={summaryMarkets}
            columns={marketColumns}
            rows={filteredMarketRows}
            onCreateMarket={openCreateMarketModal}
            onRowClick={openEditMarketModal}
          />
        </TabsContent>

        <TabsContent value="settings">
          <MarketSettingsTab
            theme={theme}
            filterOptions={settingsFilterOptions}
            selections={settingsSelections}
            onSelectionChange={handleSettingsSelectionChange}
            availableMarkets={availableMarketsForSettings}
            selectedTournament={selectedTournamentValue}
            onOpenAssignmentModal={openAssignmentModal}
            columns={tournamentColumns}
            rows={tournamentMarketRows}
          />
        </TabsContent>
      </Tabs>

      <Modal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} size="md">
        <ModalHeader>{editingGroupId ? "Edit Market Group" : "Create Market Group"}</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              handleGroupSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <Label>Sport</Label>
              <Select<SelectOption, false>
                styles={reactSelectStyles(theme)}
                options={sportsOptions}
                value={groupForm.sport}
                onChange={(option: SingleValue<SelectOption>) =>
      setGroupForm((prev) => ({ ...prev, sport: option ?? null }))
                }
              />
            </div>
            <div>
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                placeholder="e.g. Goals & Totals"
                value={groupForm.name}
                onChange={(event) =>
                  setGroupForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div>
              <Label>Summary</Label>
              <TextArea
                placeholder="Describe the markets grouped together."
                rows={3}
                value={groupForm.description}
                onChange={(value) =>
                  setGroupForm((prev) => ({
                    ...prev,
                    description: value,
                  }))
                }
              />
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsGroupModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGroupSubmit}>{editingGroupId ? "Update Group" : "Save Group"}</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isMarketModalOpen} onClose={() => setIsMarketModalOpen(false)} size="lg">
        <ModalHeader>{editingMarketId ? "Edit Market" : "Create Market"}</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              handleMarketSubmit();
            }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Sport</Label>
                <Select<SelectOption, false>
                  styles={reactSelectStyles(theme)}
                  options={sportsOptions}
                  value={marketForm.sport}
                  onChange={(option: SingleValue<SelectOption>) => {
                    setMarketForm((prev) => ({
                      ...prev,
                      sport: option ?? null,
                      group: null,
                    }));
                  }}
                />
              </div>
              <div>
                <Label>Market Type</Label>
                <Select<MarketTypeOption, false>
                  styles={reactSelectStyles(theme)}
                  options={marketTypeOptions}
                  value={marketForm.marketType}
                  onChange={(option: SingleValue<MarketTypeOption>) =>
                    setMarketForm((prev) => ({ ...prev, marketType: option ?? null }))
                  }
                />
              </div>
              <div>
                <Label>Group</Label>
                <Select<SelectOption, false>
                  styles={reactSelectStyles(theme)}
                  options={groupOptionsForSport}
                  value={marketForm.group}
                  onChange={(option: SingleValue<SelectOption>) =>
                    setMarketForm((prev) => ({ ...prev, group: option ?? null }))
                  }
                  placeholder="Select market group"
                />
              </div>
              <div>
                <Label htmlFor="marketName">Name</Label>
                <Input
                  id="marketName"
                  placeholder="e.g. Total Goals Over/Under 2.5"
                  value={marketForm.name}
                  onChange={(event) =>
                    setMarketForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="marketShortName">Short Name</Label>
                <Input
                  id="marketShortName"
                  placeholder="Short label"
                  value={marketForm.shortName}
                  onChange={(event) =>
                    setMarketForm((prev) => ({ ...prev, shortName: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="marketSpecifier">Specifier</Label>
                <Input
                  id="marketSpecifier"
                  placeholder="e.g. Match, Player, Goals"
                  value={marketForm.specifier}
                  onChange={(event) =>
                    setMarketForm((prev) => ({ ...prev, specifier: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select<StatusOption, false>
                  styles={reactSelectStyles(theme)}
                  options={statusOptions}
                  value={marketForm.status}
                  onChange={(option: SingleValue<StatusOption>) =>
                    setMarketForm((prev) => ({ ...prev, status: option ?? null }))
                  }
                />
              </div>
              <div>
                <Label>Cashout</Label>
                <Select<CashoutOption, false>
                  styles={reactSelectStyles(theme)}
                  options={cashoutOptions}
                  value={marketForm.cashout}
                  onChange={(option: SingleValue<CashoutOption>) =>
                    setMarketForm((prev) => ({ ...prev, cashout: option ?? null }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="marketPriority">Priority</Label>
                <Input
                  id="marketPriority"
                  type="number"
                  min={0}
                  value={marketForm.priority}
                  onChange={(event) =>
                    setMarketForm((prev) => ({
                      ...prev,
                      priority: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  label="Popular"
                  defaultChecked={marketForm.isPopular}
                  onChange={(checked) =>
                    setMarketForm((prev) => ({
                      ...prev,
                      isPopular: checked,
                    }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <TextArea
                  placeholder="Provide more context for traders and front-end display."
                  rows={3}
                  value={marketForm.description}
                  onChange={(value) =>
                    setMarketForm((prev) => ({
                      ...prev,
                      description: value,
                    }))
                  }
                />
              </div>
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsMarketModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleMarketSubmit}>{editingMarketId ? "Update Market" : "Save Market"}</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isAssignmentModalOpen} onClose={() => setIsAssignmentModalOpen(false)} size="md">
        <ModalHeader>Assign Markets to Tournament</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              handleAssignMarkets();
            }}
            className="space-y-4"
          >
            <div>
              <Label>Tournament</Label>
              <Input
                value={settingsFilterState.tournament?.label ?? "Select a tournament"}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>
            <div>
              <Label>Markets</Label>
              <Select<SelectOption, true>
                styles={reactSelectStyles(theme)}
                options={availableMarketsForSettings}
                value={selectedAssignmentMarkets}
                onChange={(options: MultiValue<SelectOption>) =>
                  setSelectedAssignmentMarkets(options as SelectOption[])
                }
                isMulti
                placeholder="Select markets to add"
              />
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsAssignmentModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssignMarkets}>Assign Markets</Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={isTournamentMarketModalOpen}
        onClose={() => {
          setIsTournamentMarketModalOpen(false);
          setEditingTournamentMarket(null);
          setTournamentNoteDraft("");
        }}
        size="md"
      >
        <ModalHeader>Edit Tournament Market</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              if (!editingTournamentMarket) return;
              const draft = tournamentNoteDraft.trim();
              setTournamentMarketNotes((prev) => {
                if (draft.length === 0) {
                  if (!(editingTournamentMarket.id in prev)) return prev;
                  const next = { ...prev };
                  delete next[editingTournamentMarket.id];
                  return next;
                }
                return {
                  ...prev,
                  [editingTournamentMarket.id]: draft,
                };
              });
              setIsTournamentMarketModalOpen(false);
              setEditingTournamentMarket(null);
              setTournamentNoteDraft("");
            }}
            className="space-y-4"
          >
            <div>
              <Label>Market Name</Label>
              <Input value={editingTournamentMarket?.name ?? ""} disabled />
            </div>
            <div>
              <Label>Status</Label>
              <Input value={editingTournamentMarket?.status ?? ""} disabled />
            </div>
            <div>
              <Label>Notes / Action</Label>
              <TextArea
                rows={3}
                placeholder="Add an internal note or action reminder"
                value={tournamentNoteDraft}
                onChange={(value) => setTournamentNoteDraft(value)}
              />
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsTournamentMarketModalOpen(false);
              setEditingTournamentMarket(null);
              setTournamentNoteDraft("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!editingTournamentMarket) return;
              const draft = tournamentNoteDraft.trim();
              setTournamentMarketNotes((prev) => {
                if (draft.length === 0) {
                  if (!(editingTournamentMarket.id in prev)) return prev;
                  const next = { ...prev };
                  delete next[editingTournamentMarket.id];
                  return next;
                }
                return {
                  ...prev,
                  [editingTournamentMarket.id]: draft,
                };
              });
              setIsTournamentMarketModalOpen(false);
              setEditingTournamentMarket(null);
              setTournamentNoteDraft("");
            }}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default withAuth(MarketsManagerPage);

