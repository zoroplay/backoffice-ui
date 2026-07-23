"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAuth } from "@/utils/withAuth";

import {
  addTournamentMarkets,
  emptyOutcome,
  fetchBetradarMarkets,
  fetchFixtureSports,
  fetchMarketGroups,
  fetchMarkets,
  fetchMarketSettingsMenu,
  fetchMarketSettingsSports,
  fetchTournamentMarkets,
  findMenuCategory,
  findMenuSport,
  marketGroupLabel,
  removeTournamentMarkets,
  saveMarket,
  saveMarketOutcomes,
  toggleTournamentMarketCashout,
  toggleTournamentMarketStatus,
  type FixtureSport,
  type MarketGroup,
  type MarketOutcome,
  type MarketRecord,
  type MarketSavePayload,
  type MarketType,
  type SettingsSport,
  type SportNode,
  type TournamentMarket,
} from "./api";

type ActiveTab = "markets" | "settings";

type MarketFormState = {
  id: string;
  sportId: string;
  marketTypeId: string;
  groupId: string;
  name: string;
  displayName: string;
  description: string;
  specifier: string;
  status: string;
  enableCashout: string;
  priority: string;
  isDefault: boolean;
};

const blankMarketForm: MarketFormState = {
  id: "",
  sportId: "",
  marketTypeId: "",
  groupId: "",
  name: "",
  displayName: "",
  description: "",
  specifier: "",
  status: "0",
  enableCashout: "0",
  priority: "0",
  isDefault: false,
};

function selectClassName() {
  return "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800";
}

function cardClassName() {
  return "rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900";
}

function tableHeadClassName() {
  return "border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400";
}

function tableCellClassName() {
  return "border-b border-gray-200 px-4 py-3 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-200";
}

function findGroup(groups: MarketGroup[], groupId: string) {
  return groups.find((group) => group.id === groupId || group.marketGroupId === groupId) ?? null;
}

function findSport(sports: FixtureSport[], sportId: string) {
  return sports.find((sport) => sport.sportId === sportId || sport.id === sportId) ?? null;
}

function findMarketType(types: MarketType[], marketTypeId: string, market?: MarketRecord | null) {
  return (
    types.find(
      (type) =>
        type.providerId === marketTypeId ||
        type.marketId === marketTypeId ||
        (market &&
          (type.providerId === String(market.raw.market_type_id ?? "") ||
            type.marketId === String(market.raw.marketID ?? "")))
    ) ?? null
  );
}

function normalizeOutcomeRows(rows: MarketOutcome[]) {
  return rows.length > 0 ? rows : [emptyOutcome()];
}

function MarketsManagerPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("markets");
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [sports, setSports] = useState<FixtureSport[]>([]);
  const [marketTypes, setMarketTypes] = useState<MarketType[]>([]);
  const [settingsSports, setSettingsSports] = useState<SettingsSport[]>([]);
  const [sportsMenu, setSportsMenu] = useState<SportNode[]>([]);

  const [selectedListSportId, setSelectedListSportId] = useState("");
  const [selectedListGroupId, setSelectedListGroupId] = useState("0");
  const [listGroups, setListGroups] = useState<MarketGroup[]>([]);
  const [marketRows, setMarketRows] = useState<MarketRecord[]>([]);
  const [marketListLoading, setMarketListLoading] = useState(false);

  const [marketForm, setMarketForm] = useState<MarketFormState>(blankMarketForm);
  const [formGroups, setFormGroups] = useState<MarketGroup[]>([]);
  const [savingMarket, setSavingMarket] = useState(false);

  const [editingOutcomesMarket, setEditingOutcomesMarket] = useState<MarketRecord | null>(null);
  const [outcomeRows, setOutcomeRows] = useState<MarketOutcome[]>([emptyOutcome()]);
  const [savingOutcomes, setSavingOutcomes] = useState(false);

  const [selectedSettingsSportId, setSelectedSettingsSportId] = useState("");
  const [selectedSettingsCategoryId, setSelectedSettingsCategoryId] = useState("");
  const [selectedSettingsTournamentId, setSelectedSettingsTournamentId] = useState("");
  const [selectedSettingsMarketIds, setSelectedSettingsMarketIds] = useState<string[]>([]);
  const [tournamentMarkets, setTournamentMarkets] = useState<TournamentMarket[]>([]);
  const [tournamentMarketsLoading, setTournamentMarketsLoading] = useState(false);
  const [settingsActionLoading, setSettingsActionLoading] = useState(false);

  const selectedSettingsSport = useMemo(
    () =>
      settingsSports.find(
        (sport) => sport.id === selectedSettingsSportId || sport.providerId === selectedSettingsSportId
      ) ?? null,
    [selectedSettingsSportId, settingsSports]
  );
  const selectedMenuSport = useMemo(
    () => findMenuSport(sportsMenu, selectedSettingsSport),
    [selectedSettingsSport, sportsMenu]
  );
  const settingsCategories = useMemo(
    () => selectedMenuSport?.categories ?? [],
    [selectedMenuSport]
  );
  const selectedMenuCategory = useMemo(
    () => findMenuCategory(selectedMenuSport, selectedSettingsCategoryId),
    [selectedMenuSport, selectedSettingsCategoryId]
  );
  const settingsTournaments = useMemo(
    () => selectedMenuCategory?.tournaments ?? [],
    [selectedMenuCategory]
  );
  const selectedListGroup = useMemo(
    () => findGroup(listGroups, selectedListGroupId),
    [listGroups, selectedListGroupId]
  );
  const availableSettingsMarkets = useMemo(
    () => selectedSettingsSport?.markets ?? [],
    [selectedSettingsSport]
  );

  useEffect(() => {
    void initializePage();
  }, []);

  async function initializePage() {
    setInitialLoading(true);
    try {
      const [nextSports, nextMarketTypes, nextSettingsSports, nextSportsMenu] = await Promise.all([
        fetchFixtureSports(),
        fetchBetradarMarkets(),
        fetchMarketSettingsSports(),
        fetchMarketSettingsMenu(),
      ]);

      setSports(nextSports);
      setMarketTypes(nextMarketTypes);
      setSettingsSports(nextSettingsSports);
      setSportsMenu(nextSportsMenu);

      const defaultListSportId = nextSports[0]?.sportId ?? "";
      const defaultSettingsSportId = nextSettingsSports[0]?.id ?? "";

      setSelectedListSportId(defaultListSportId);
      setSelectedListGroupId("0");
      setSelectedSettingsSportId(defaultSettingsSportId);
      setMarketForm({
        ...blankMarketForm,
        sportId: defaultListSportId,
      });

      await Promise.all([
        defaultListSportId ? loadMarketList(defaultListSportId, null) : Promise.resolve(),
        defaultListSportId ? loadFormGroups(defaultListSportId) : Promise.resolve(),
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load markets manager");
    } finally {
      setInitialLoading(false);
    }
  }

  async function refreshCurrentState() {
    setRefreshing(true);
    try {
      const currentTournamentId = selectedSettingsTournamentId;
      await initializePage();
      if (currentTournamentId) {
        setSelectedSettingsTournamentId(currentTournamentId);
        await loadTournamentMarketsForSelection(currentTournamentId);
      }
    } finally {
      setRefreshing(false);
    }
  }

  async function loadMarketList(sportId: string, groupId: string | null) {
    setMarketListLoading(true);
    try {
      const [groups, markets] = await Promise.all([fetchMarketGroups(sportId), fetchMarkets(sportId, groupId)]);
      setListGroups(groups);
      setMarketRows(markets);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load markets");
      setListGroups([]);
      setMarketRows([]);
    } finally {
      setMarketListLoading(false);
    }
  }

  async function loadFormGroups(sportId: string) {
    try {
      const groups = await fetchMarketGroups(sportId);
      setFormGroups(groups);
      return groups;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load market groups");
      setFormGroups([]);
      return [];
    }
  }

  async function loadTournamentMarketsForSelection(tournamentId: string) {
    setTournamentMarketsLoading(true);
    try {
      const markets = await fetchTournamentMarkets(tournamentId);
      setTournamentMarkets(markets);
      setSelectedSettingsMarketIds(markets.map((market) => market.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load tournament markets");
      setTournamentMarkets([]);
      setSelectedSettingsMarketIds([]);
    } finally {
      setTournamentMarketsLoading(false);
    }
  }

  function resetMarketForm(nextSportId = selectedListSportId) {
    setMarketForm({
      ...blankMarketForm,
      sportId: nextSportId,
    });
  }

  async function handleListSportChange(nextSportId: string) {
    setSelectedListSportId(nextSportId);
    setSelectedListGroupId("0");
    resetMarketForm(nextSportId);
    if (!nextSportId) {
      setListGroups([]);
      setMarketRows([]);
      setFormGroups([]);
      return;
    }
    await Promise.all([loadMarketList(nextSportId, null), loadFormGroups(nextSportId)]);
  }

  async function handleListGroupChange(nextGroupId: string) {
    setSelectedListGroupId(nextGroupId);
    if (!selectedListSportId) return;
    await loadMarketList(selectedListSportId, nextGroupId === "0" ? null : nextGroupId);
  }

  async function handleFormSportChange(nextSportId: string) {
    setMarketForm((current) => ({
      ...current,
      sportId: nextSportId,
      groupId: "",
    }));
    if (!nextSportId) {
      setFormGroups([]);
      return;
    }
    await loadFormGroups(nextSportId);
  }

  async function handleEditMarket(market: MarketRecord) {
    const nextSportId = market.sportId;
    const groups = await loadFormGroups(nextSportId);
    const matchedGroup = findGroup(groups, market.groupId);
    const matchedType = findMarketType(marketTypes, market.marketTypeId, market);

    setSelectedListSportId(nextSportId);
    setSelectedListGroupId(matchedGroup?.marketGroupId || matchedGroup?.id || "0");
    await loadMarketList(nextSportId, matchedGroup?.marketGroupId || matchedGroup?.id || null);

    setMarketForm({
      id: market.id,
      sportId: nextSportId,
      marketTypeId: matchedType?.providerId || matchedType?.marketId || market.marketTypeId,
      groupId: matchedGroup?.id || matchedGroup?.marketGroupId || "",
      name: market.name,
      displayName: market.displayName,
      description: market.description,
      specifier: market.specifier,
      status: String(market.status),
      enableCashout: String(market.enableCashout),
      priority: market.priority,
      isDefault: market.isDefault === 1,
    });
    setActiveTab("markets");
  }

  function handleManageOutcomes(market: MarketRecord) {
    setEditingOutcomesMarket(market);
    setOutcomeRows(normalizeOutcomeRows(market.outcomes));
  }

  function handleOutcomeChange(index: number, field: keyof MarketOutcome, value: string | number) {
    setOutcomeRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: field === "status" ? Number(value) : String(value),
            }
          : row
      )
    );
  }

  function addOutcomeRow() {
    setOutcomeRows((current) => [...current, emptyOutcome()]);
  }

  async function submitMarket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const sport = findSport(sports, marketForm.sportId);
    const group = findGroup(formGroups, marketForm.groupId);
    const marketType = findMarketType(marketTypes, marketForm.marketTypeId, null);

    if (!sport) {
      toast.error("Select Sports");
      return;
    }
    if (!marketType) {
      toast.error("Select Market");
      return;
    }
    if (!group) {
      toast.error("Select Market Group");
      return;
    }
    if (!marketForm.name.trim()) {
      toast.error("Please enter the market name");
      return;
    }

    const payload: MarketSavePayload = {
      sportID: sport.sportId,
      marketID: marketType.marketId,
      groupID: group.marketGroupId,
      name: marketForm.name.trim(),
      displayName: marketForm.displayName.trim(),
      description: marketForm.description.trim(),
      isDefault: marketForm.isDefault ? 1 : 0,
      enableCashout: Number(marketForm.enableCashout || 0),
      status: Number(marketForm.status || 0),
      specifier: marketForm.specifier.trim(),
      priority: Number(marketForm.priority || 0),
      id: marketForm.id,
      sport_id: sport.id,
      market_group_id: group.id,
      market_type_id: marketType.providerId,
    };

    setSavingMarket(true);
    try {
      await saveMarket(payload);
      toast.success("Market has been saved successfully.");
      resetMarketForm(sport.sportId);
      setSelectedListSportId(sport.sportId);
      setSelectedListGroupId("0");
      await Promise.all([loadMarketList(sport.sportId, null), loadFormGroups(sport.sportId)]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save market");
    } finally {
      setSavingMarket(false);
    }
  }

  async function submitOutcomes() {
    if (!editingOutcomesMarket) return;

    setSavingOutcomes(true);
    try {
      await saveMarketOutcomes({
        outcomes: outcomeRows,
        marketID: editingOutcomesMarket.marketId,
        marketName: editingOutcomesMarket.displayName || editingOutcomesMarket.name,
        internalMarketID: editingOutcomesMarket.id,
      });
      toast.success("Outcomes have been updated.");
      setEditingOutcomesMarket(null);
      if (selectedListSportId) {
        await loadMarketList(selectedListSportId, selectedListGroupId === "0" ? null : selectedListGroupId);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save outcomes");
    } finally {
      setSavingOutcomes(false);
    }
  }

  function toggleSettingsMarketSelection(marketId: string, checked: boolean) {
    setSelectedSettingsMarketIds((current) => {
      if (checked) return Array.from(new Set([...current, marketId]));
      return current.filter((id) => id !== marketId);
    });
  }

  function handleSettingsSportChange(nextSportId: string) {
    setSelectedSettingsSportId(nextSportId);
    setSelectedSettingsCategoryId("");
    setSelectedSettingsTournamentId("");
    setSelectedSettingsMarketIds([]);
    setTournamentMarkets([]);
  }

  function handleSettingsCategoryChange(nextCategoryId: string) {
    setSelectedSettingsCategoryId(nextCategoryId);
    setSelectedSettingsTournamentId("");
    setSelectedSettingsMarketIds([]);
    setTournamentMarkets([]);
  }

  async function handleSettingsTournamentChange(nextTournamentId: string) {
    setSelectedSettingsTournamentId(nextTournamentId);
    setSelectedSettingsMarketIds([]);
    setTournamentMarkets([]);
    if (!nextTournamentId) return;
    await loadTournamentMarketsForSelection(nextTournamentId);
  }

  async function handleAddMarkets() {
    if (!selectedSettingsTournamentId) {
      toast.error("Select Tournament");
      return;
    }

    setSettingsActionLoading(true);
    try {
      await addTournamentMarkets(selectedSettingsTournamentId, selectedSettingsMarketIds);
      toast.success("Markets added");
      await loadTournamentMarketsForSelection(selectedSettingsTournamentId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add markets");
    } finally {
      setSettingsActionLoading(false);
    }
  }

  async function handleRemoveMarket(marketId: string) {
    if (!selectedSettingsTournamentId) return;
    if (!window.confirm("You will not be able to recover this market")) return;

    setSettingsActionLoading(true);
    try {
      await removeTournamentMarkets(selectedSettingsTournamentId, [marketId]);
      toast.success("Market has been removed");
      await loadTournamentMarketsForSelection(selectedSettingsTournamentId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove market");
    } finally {
      setSettingsActionLoading(false);
    }
  }

  async function handleToggleCashout(marketId: string) {
    if (!selectedSettingsTournamentId) return;
    if (!window.confirm("You want to toggle cashout for this market")) return;

    setSettingsActionLoading(true);
    try {
      await toggleTournamentMarketCashout(selectedSettingsTournamentId, marketId);
      toast.success("Cashout has been toggled");
      await loadTournamentMarketsForSelection(selectedSettingsTournamentId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to toggle cashout");
    } finally {
      setSettingsActionLoading(false);
    }
  }

  async function handleToggleStatus(marketId: string) {
    if (!selectedSettingsTournamentId) return;

    setSettingsActionLoading(true);
    try {
      await toggleTournamentMarketStatus(selectedSettingsTournamentId, marketId);
      await loadTournamentMarketsForSelection(selectedSettingsTournamentId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to toggle market status");
    } finally {
      setSettingsActionLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Markets Manager" />
        <div className={`${cardClassName()} p-6`}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading markets manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageBreadcrumb pageTitle="Markets Manager" />
        <Button
          size="sm"
          variant="outline"
          onClick={() => void refreshCurrentState()}
          startIcon={<RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTab)}>
        <TabsList>
          <TabsTrigger value="markets">Markets</TabsTrigger>
          <TabsTrigger value="settings">Market Setting</TabsTrigger>
        </TabsList>

        <TabsContent value="markets" className="space-y-6">
          <div className={`${cardClassName()} p-6`}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="market-list-sport">Sports</Label>
                <select
                  id="market-list-sport"
                  className={selectClassName()}
                  value={selectedListSportId}
                  onChange={(event) => void handleListSportChange(event.target.value)}
                >
                  <option value="">Select Sports</option>
                  {sports.map((sport) => (
                    <option key={sport.sportId} value={sport.sportId}>
                      {sport.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="market-list-group">Market Group</Label>
                <select
                  id="market-list-group"
                  className={selectClassName()}
                  value={selectedListGroupId}
                  onChange={(event) => void handleListGroupChange(event.target.value)}
                  disabled={!selectedListSportId}
                >
                  <option value="0">None</option>
                  {listGroups.map((group) => (
                    <option key={group.id} value={group.marketGroupId}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
            <section className={cardClassName()}>
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                  Available Markets in {marketGroupLabel(selectedListGroup)}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <thead className={tableHeadClassName()}>
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketListLoading ? (
                      <tr>
                        <td className={tableCellClassName()} colSpan={3}>
                          Please wait...
                        </td>
                      </tr>
                    ) : marketRows.length === 0 ? (
                      <tr>
                        <td className={tableCellClassName()} colSpan={3}>
                          Please select a sport to display markets
                        </td>
                      </tr>
                    ) : (
                      marketRows.map((market) => (
                        <tr key={market.id}>
                          <td className={tableCellClassName()}>{market.name}</td>
                          <td className={tableCellClassName()}>{market.description || "-"}</td>
                          <td className={tableCellClassName()}>
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                                onClick={() => void handleEditMarket(market)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                                onClick={() => handleManageOutcomes(market)}
                              >
                                Manage Outcomes
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={cardClassName()}>
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                  {marketForm.id ? "Edit Market" : "Add/Edit Market"}
                </h3>
              </div>

              <form className="space-y-4 p-6" onSubmit={(event) => void submitMarket(event)}>
                <div>
                  <Label htmlFor="market-form-sport">Sports</Label>
                  <select
                    id="market-form-sport"
                    className={selectClassName()}
                    value={marketForm.sportId}
                    onChange={(event) => void handleFormSportChange(event.target.value)}
                  >
                    <option value="">Select Sports</option>
                    {sports.map((sport) => (
                      <option key={sport.sportId} value={sport.sportId}>
                        {sport.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="market-form-type">Market Type (Betradar Markets)</Label>
                  <select
                    id="market-form-type"
                    className={selectClassName()}
                    value={marketForm.marketTypeId}
                    onChange={(event) =>
                      setMarketForm((current) => ({ ...current, marketTypeId: event.target.value }))
                    }
                  >
                    <option value="">Select Market</option>
                    {marketTypes.map((marketType) => (
                      <option key={marketType.id} value={marketType.providerId}>
                        {marketType.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="market-form-group">Group</Label>
                  <select
                    id="market-form-group"
                    className={selectClassName()}
                    value={marketForm.groupId}
                    onChange={(event) =>
                      setMarketForm((current) => ({ ...current, groupId: event.target.value }))
                    }
                  >
                    <option value="">Select Market Group</option>
                    {formGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="market-form-name">Name</Label>
                  <Input
                    id="market-form-name"
                    value={marketForm.name}
                    onChange={(event) =>
                      setMarketForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="market-form-display-name">Short Name</Label>
                  <Input
                    id="market-form-display-name"
                    value={marketForm.displayName}
                    onChange={(event) =>
                      setMarketForm((current) => ({ ...current, displayName: event.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="market-form-description">Description</Label>
                  <TextArea
                    value={marketForm.description}
                    onChange={(value) => setMarketForm((current) => ({ ...current, description: value }))}
                    className="text-gray-800 dark:text-white/90"
                  />
                </div>

                <div>
                  <Label htmlFor="market-form-specifier">Specifier</Label>
                  <Input
                    id="market-form-specifier"
                    value={marketForm.specifier}
                    onChange={(event) =>
                      setMarketForm((current) => ({ ...current, specifier: event.target.value }))
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="market-form-status">Status</Label>
                    <select
                      id="market-form-status"
                      className={selectClassName()}
                      value={marketForm.status}
                      onChange={(event) =>
                        setMarketForm((current) => ({ ...current, status: event.target.value }))
                      }
                    >
                      <option value="1">Enabled</option>
                      <option value="0">Disabled</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="market-form-cashout">Cashout</Label>
                    <select
                      id="market-form-cashout"
                      className={selectClassName()}
                      value={marketForm.enableCashout}
                      onChange={(event) =>
                        setMarketForm((current) => ({ ...current, enableCashout: event.target.value }))
                      }
                    >
                      <option value="1">Enabled</option>
                      <option value="0">Disabled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="market-form-priority">Priority</Label>
                  <Input
                    id="market-form-priority"
                    type="number"
                    value={marketForm.priority}
                    onChange={(event) =>
                      setMarketForm((current) => ({ ...current, priority: event.target.value }))
                    }
                  />
                </div>

                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={marketForm.isDefault}
                    onChange={(event) =>
                      setMarketForm((current) => ({ ...current, isDefault: event.target.checked }))
                    }
                  />
                  Is Popular
                </label>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resetMarketForm(marketForm.sportId || selectedListSportId)}
                  >
                    Reset
                  </Button>
                  <Button type="submit" disabled={savingMarket}>
                    {savingMarket ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className={`${cardClassName()} p-6`}>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="settings-sport">Sports</Label>
                <select
                  id="settings-sport"
                  className={selectClassName()}
                  value={selectedSettingsSportId}
                  onChange={(event) => handleSettingsSportChange(event.target.value)}
                >
                  <option value="">Select Sports</option>
                  {settingsSports.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="settings-category">Category</Label>
                <select
                  id="settings-category"
                  className={selectClassName()}
                  value={selectedSettingsCategoryId}
                  onChange={(event) => handleSettingsCategoryChange(event.target.value)}
                  disabled={!selectedSettingsSportId}
                >
                  <option value="">Select Category</option>
                  {settingsCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="settings-tournament">Tournament</Label>
                <select
                  id="settings-tournament"
                  className={selectClassName()}
                  value={selectedSettingsTournamentId}
                  onChange={(event) => void handleSettingsTournamentChange(event.target.value)}
                  disabled={!selectedSettingsCategoryId}
                >
                  <option value="">Select Tournament</option>
                  {settingsTournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <section className={cardClassName()}>
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">Available Markets</h3>
                <Button
                  size="sm"
                  onClick={() => void handleAddMarkets()}
                  disabled={!selectedSettingsTournamentId || settingsActionLoading}
                >
                  Add Markets
                </Button>
              </div>

              <div className="max-h-[520px] overflow-y-auto">
                <table className="min-w-full">
                  <thead className={tableHeadClassName()}>
                    <tr>
                      <th className="px-4 py-3">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableSettingsMarkets.length === 0 ? (
                      <tr>
                        <td className={tableCellClassName()}>Please select a sport to display markets</td>
                      </tr>
                    ) : (
                      availableSettingsMarkets.map((market) => (
                        <tr key={market.id}>
                          <td className={tableCellClassName()}>
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedSettingsMarketIds.includes(market.id)}
                                onChange={(event) =>
                                  toggleSettingsMarketSelection(market.id, event.target.checked)
                                }
                                disabled={!selectedSettingsTournamentId}
                              />
                              <span>{market.name}</span>
                            </label>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={cardClassName()}>
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">Tournament Markets</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <thead className={tableHeadClassName()}>
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournamentMarketsLoading ? (
                      <tr>
                        <td className={tableCellClassName()} colSpan={3}>
                          Please wait...
                        </td>
                      </tr>
                    ) : tournamentMarkets.length === 0 ? (
                      <tr>
                        <td className={tableCellClassName()} colSpan={3}>
                          {selectedSettingsTournamentId ? "No Markets" : "Select a tournament to manage its markets."}
                        </td>
                      </tr>
                    ) : (
                      tournamentMarkets.map((market) => (
                        <tr key={market.id}>
                          <td className={tableCellClassName()}>{market.name}</td>
                          <td className={tableCellClassName()}>
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                className="text-error-600 hover:text-error-700"
                                onClick={() => void handleRemoveMarket(market.id)}
                                disabled={settingsActionLoading}
                              >
                                Remove Market
                              </button>
                              <button
                                type="button"
                                className={
                                  market.cashOutStatus === 1
                                    ? "text-error-600 hover:text-error-700"
                                    : "text-green-600 hover:text-green-700"
                                }
                                onClick={() => void handleToggleCashout(market.id)}
                                disabled={settingsActionLoading}
                              >
                                {market.cashOutStatus === 1 ? "Disable Cashout" : "Enable Cashout"}
                              </button>
                            </div>
                          </td>
                          <td className={tableCellClassName()}>
                            <input
                              type="checkbox"
                              checked={market.status === 1}
                              onChange={() => void handleToggleStatus(market.id)}
                              disabled={settingsActionLoading}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>

      <Modal
        isOpen={Boolean(editingOutcomesMarket)}
        onClose={() => setEditingOutcomesMarket(null)}
        size="4xl"
      >
        <ModalHeader>
          Edit Market Outcomes for {editingOutcomesMarket?.displayName || editingOutcomesMarket?.name || ""}
        </ModalHeader>

        <ModalBody>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={tableHeadClassName()}>
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Provider ID</th>
                  <th className="px-4 py-3">Spread</th>
                  <th className="px-4 py-3">Short Code (WA)</th>
                  <th className="px-4 py-3">Short Code (EA)</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {outcomeRows.map((row, index) => (
                  <tr key={`${row.outcomeID}-${index}`}>
                    <td className={tableCellClassName()}>
                      <Input
                        value={row.outcomeName}
                        onChange={(event) => handleOutcomeChange(index, "outcomeName", event.target.value)}
                      />
                    </td>
                    <td className={tableCellClassName()}>
                      <Input
                        value={row.outcomeID}
                        onChange={(event) => handleOutcomeChange(index, "outcomeID", event.target.value)}
                      />
                    </td>
                    <td className={tableCellClassName()}>
                      <Input
                        value={row.specifier}
                        onChange={(event) => handleOutcomeChange(index, "specifier", event.target.value)}
                      />
                    </td>
                    <td className={tableCellClassName()}>
                      <Input
                        value={row.codeWA}
                        onChange={(event) => handleOutcomeChange(index, "codeWA", event.target.value)}
                      />
                    </td>
                    <td className={tableCellClassName()}>
                      <Input
                        value={row.codeEA}
                        onChange={(event) => handleOutcomeChange(index, "codeEA", event.target.value)}
                      />
                    </td>
                    <td className={tableCellClassName()}>
                      <input
                        type="checkbox"
                        checked={row.status === 1}
                        onChange={(event) =>
                          handleOutcomeChange(index, "status", event.target.checked ? 1 : 0)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModalBody>

        <ModalFooter className="justify-between">
          <Button
            type="button"
            variant="outline"
            startIcon={<Plus className="h-4 w-4" />}
            onClick={addOutcomeRow}
          >
            Add New Row
          </Button>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => setEditingOutcomesMarket(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void submitOutcomes()} disabled={savingOutcomes}>
              {savingOutcomes ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default withAuth(MarketsManagerPage);
