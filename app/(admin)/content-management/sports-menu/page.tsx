"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Edit2, MoveDown, MoveUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAuth } from "@/utils/withAuth";

import {
  fetchSportsMenu,
  saveCategory,
  saveSport,
  saveTournament,
  updateSportsMenuOrder,
  type CategoryNode,
  type SportsMenuStatus,
  type SportNode,
  type TournamentNode,
} from "./api";

type TabKey = "sport" | "category" | "tournament";

type SportFormState = {
  id: string;
  name: string;
  order: string;
  status: SportsMenuStatus;
};

type CategoryFormState = {
  id: string;
  sportId: string;
  name: string;
  order: string;
  status: SportsMenuStatus;
};

type TournamentFormState = {
  id: string;
  sportId: string;
  categoryId: string;
  name: string;
  order: string;
  status: SportsMenuStatus;
  imagePath: string;
};

const blankSportForm: SportFormState = {
  id: "",
  name: "",
  order: "1000",
  status: "1",
};

const blankCategoryForm: CategoryFormState = {
  id: "",
  sportId: "",
  name: "",
  order: "1000",
  status: "1",
};

const blankTournamentForm: TournamentFormState = {
  id: "",
  sportId: "",
  categoryId: "",
  name: "",
  order: "1000",
  status: "1",
  imagePath: "",
};

function reorderItem<T>(list: T[], index: number, delta: -1 | 1) {
  const nextIndex = index + delta;
  if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return list;
  const copy = list.slice();
  const [item] = copy.splice(index, 1);
  copy.splice(nextIndex, 0, item);
  return copy;
}

function findSport(menu: SportNode[], sportId: string) {
  return menu.find((sport) => sport.id === sportId) ?? null;
}

function findCategory(menu: SportNode[], sportId: string, categoryId: string) {
  return findSport(menu, sportId)?.categories.find((category) => category.id === categoryId) ?? null;
}

function statusLabel(status: SportsMenuStatus) {
  return status === "1" ? "Active" : "Deactivate";
}

function SportsMenuPage() {
  const [menu, setMenu] = useState<SportNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("sport");
  const [expandedSports, setExpandedSports] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [sportForm, setSportForm] = useState<SportFormState>(blankSportForm);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(blankCategoryForm);
  const [tournamentForm, setTournamentForm] = useState<TournamentFormState>(blankTournamentForm);
  const [savingTab, setSavingTab] = useState<TabKey | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState(false);

  useEffect(() => {
    void loadMenu();
  }, []);

  async function loadMenu() {
    setLoading(true);
    try {
      const nextMenu = await fetchSportsMenu();
      setMenu(nextMenu);
      setExpandedSports(Object.fromEntries(nextMenu.map((sport) => [sport.id, false])));
      setExpandedCategories(
        Object.fromEntries(
          nextMenu.flatMap((sport) => sport.categories.map((category) => [category.id, false]))
        )
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load sports menu");
    } finally {
      setLoading(false);
    }
  }

  async function persistOrder(nextMenu: SportNode[]) {
    setUpdatingOrder(true);
    setMenu(nextMenu);
    try {
      await updateSportsMenuOrder(nextMenu);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update sports menu order");
      await loadMenu();
    } finally {
      setUpdatingOrder(false);
    }
  }

  const sportOptions = useMemo(
    () => menu.map((sport) => ({ value: sport.id, label: sport.name })),
    [menu]
  );

  const categoryOptions = useMemo(() => {
    const sport = findSport(menu, tournamentForm.sportId || categoryForm.sportId);
    return (sport?.categories ?? []).map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [categoryForm.sportId, menu, tournamentForm.sportId]);

  function resetSportForm() {
    setSportForm(blankSportForm);
  }

  function resetCategoryForm() {
    setCategoryForm(blankCategoryForm);
  }

  function resetTournamentForm() {
    setTournamentForm(blankTournamentForm);
  }

  function selectSportForEdit(sport: SportNode) {
    setSportForm({
      id: sport.id,
      name: sport.name,
      order: sport.order,
      status: sport.status,
    });
    setActiveTab("sport");
  }

  function selectCategoryForEdit(sport: SportNode, category: CategoryNode) {
    setCategoryForm({
      id: category.id,
      sportId: sport.id,
      name: category.name,
      order: category.order,
      status: category.status,
    });
    setActiveTab("category");
  }

  function selectTournamentForEdit(sport: SportNode, category: CategoryNode, tournament: TournamentNode) {
    setTournamentForm({
      id: tournament.id,
      sportId: sport.id,
      categoryId: category.id,
      name: tournament.name,
      order: tournament.order,
      status: tournament.status,
      imagePath: tournament.imagePath,
    });
    setActiveTab("tournament");
  }

  async function submitSport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sportForm.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setSavingTab("sport");
    try {
      await saveSport({
        id: sportForm.id || undefined,
        name: sportForm.name.trim(),
        order: sportForm.order,
        status: sportForm.status,
      });
      toast.success("Saved");
      resetSportForm();
      await loadMenu();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save sport");
    } finally {
      setSavingTab(null);
    }
  }

  async function submitCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!categoryForm.sportId) {
      toast.error("Select Sports");
      return;
    }
    if (!categoryForm.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    const sport = findSport(menu, categoryForm.sportId);
    if (!sport) {
      toast.error("Selected sport is unavailable");
      return;
    }

    setSavingTab("category");
    try {
      await saveCategory({
        id: categoryForm.id || undefined,
        name: categoryForm.name.trim(),
        sport_id: sport.providerId,
        sport: sport.providerId,
        order: categoryForm.order,
        status: categoryForm.status,
      });
      toast.success("Saved");
      resetCategoryForm();
      await loadMenu();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save category");
    } finally {
      setSavingTab(null);
    }
  }

  async function submitTournament(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tournamentForm.sportId) {
      toast.error("Select Sports");
      return;
    }
    if (!tournamentForm.categoryId) {
      toast.error("Select Category");
      return;
    }
    if (!tournamentForm.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    const sport = findSport(menu, tournamentForm.sportId);
    const category = findCategory(menu, tournamentForm.sportId, tournamentForm.categoryId);
    if (!sport || !category) {
      toast.error("Selected hierarchy is unavailable");
      return;
    }

    setSavingTab("tournament");
    try {
      await saveTournament({
        id: tournamentForm.id || undefined,
        name: tournamentForm.name.trim(),
        sport: sport.providerId,
        sport_category_id: category.providerId,
        order: tournamentForm.order,
        status: tournamentForm.status,
        image_path: tournamentForm.imagePath,
      });
      toast.success("Saved");
      resetTournamentForm();
      await loadMenu();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save tournament");
    } finally {
      setSavingTab(null);
    }
  }

  async function moveSport(index: number, delta: -1 | 1) {
    await persistOrder(reorderItem(menu, index, delta));
  }

  async function moveCategory(sportId: string, index: number, delta: -1 | 1) {
    const nextMenu = menu.map((sport) =>
      sport.id === sportId
        ? {
            ...sport,
            categories: reorderItem(sport.categories, index, delta),
          }
        : sport
    );
    await persistOrder(nextMenu);
  }

  async function moveTournament(sportId: string, categoryId: string, index: number, delta: -1 | 1) {
    const nextMenu = menu.map((sport) =>
      sport.id === sportId
        ? {
            ...sport,
            categories: sport.categories.map((category) =>
              category.id === categoryId
                ? {
                    ...category,
                    tournaments: reorderItem(category.tournaments, index, delta),
                  }
                : category
            ),
          }
        : sport
    );
    await persistOrder(nextMenu);
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Sports Menu" />

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => setExpandedSports(Object.fromEntries(menu.map((sport) => [sport.id, true])))} size="sm">
          [+] Expand All
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setExpandedSports(Object.fromEntries(menu.map((sport) => [sport.id, false])));
            setExpandedCategories(
              Object.fromEntries(menu.flatMap((sport) => sport.categories.map((category) => [category.id, false])))
            );
          }}
          size="sm"
        >
          [-] Collapse All
        </Button>
        <Button type="button" variant="outline" onClick={() => void loadMenu()} disabled={loading} startIcon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}>
          Reload Menu
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Sports List</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Edit the live sports hierarchy and persist its order.
            </p>
          </div>

          <div className="max-h-[700px] overflow-y-auto px-6 pb-6 pt-4 custom-scrollbar">
            {loading ? (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Loading Please wait....
              </div>
            ) : (
              <ul className="space-y-3">
                {menu.map((sport, sportIndex) => {
                  const sportExpanded = expandedSports[sport.id] ?? false;

                  return (
                    <li key={sport.id} className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
                      <div className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setExpandedSports((current) => ({ ...current, [sport.id]: !sportExpanded }))}
                            className="rounded-md border border-gray-300 p-1 dark:border-gray-700"
                          >
                            {sportExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{sport.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Order #{sport.order} · {statusLabel(sport.status)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => void moveSport(sportIndex, -1)} disabled={sportIndex === 0 || updatingOrder}>
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => void moveSport(sportIndex, 1)} disabled={sportIndex === menu.length - 1 || updatingOrder}>
                            <MoveDown className="h-4 w-4" />
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => selectSportForEdit(sport)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {sportExpanded ? (
                        <ul className="space-y-2 border-t border-gray-200 px-4 py-3 dark:border-gray-800">
                          {sport.categories.map((category, categoryIndex) => {
                            const categoryExpanded = expandedCategories[category.id] ?? false;

                            return (
                              <li key={category.id} className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                                <div className="flex items-center justify-between gap-3 px-3 py-2">
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedCategories((current) => ({
                                          ...current,
                                          [category.id]: !categoryExpanded,
                                        }))
                                      }
                                      className="rounded-md border border-gray-300 p-1 dark:border-gray-700"
                                    >
                                      {categoryExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </button>
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">{category.name}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Order #{category.order} · {statusLabel(category.status)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button type="button" size="sm" variant="outline" onClick={() => void moveCategory(sport.id, categoryIndex, -1)} disabled={categoryIndex === 0 || updatingOrder}>
                                      <MoveUp className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" onClick={() => void moveCategory(sport.id, categoryIndex, 1)} disabled={categoryIndex === sport.categories.length - 1 || updatingOrder}>
                                      <MoveDown className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" onClick={() => selectCategoryForEdit(sport, category)}>
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {categoryExpanded ? (
                                  <ul className="space-y-2 border-t border-gray-200 px-3 py-2 dark:border-gray-800">
                                    {category.tournaments.map((tournament, tournamentIndex) => (
                                      <li key={tournament.id} className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/60">
                                        <div>
                                          <p className="font-medium text-gray-900 dark:text-white">{tournament.name}</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Order #{tournament.order} · {statusLabel(tournament.status)}
                                          </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <Button type="button" size="sm" variant="outline" onClick={() => void moveTournament(sport.id, category.id, tournamentIndex, -1)} disabled={tournamentIndex === 0 || updatingOrder}>
                                            <MoveUp className="h-4 w-4" />
                                          </Button>
                                          <Button type="button" size="sm" variant="outline" onClick={() => void moveTournament(sport.id, category.id, tournamentIndex, 1)} disabled={tournamentIndex === category.tournaments.length - 1 || updatingOrder}>
                                            <MoveDown className="h-4 w-4" />
                                          </Button>
                                          <Button type="button" size="sm" variant="outline" onClick={() => selectTournamentForEdit(sport, category, tournament)}>
                                            <Edit2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sport">Sports Mgmt.</TabsTrigger>
              <TabsTrigger value="category">Category Mgmt.</TabsTrigger>
              <TabsTrigger value="tournament">Tournament Mgmt.</TabsTrigger>
            </TabsList>

            <TabsContent value="sport" className="pt-5">
              <form className="space-y-4" onSubmit={(event) => void submitSport(event)}>
                <div>
                  <Label htmlFor="sport-name">Name</Label>
                  <Input id="sport-name" value={sportForm.name} onChange={(event) => setSportForm((current) => ({ ...current, name: event.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="sport-order">Order Position</Label>
                  <Input id="sport-order" value={sportForm.order} onChange={(event) => setSportForm((current) => ({ ...current, order: event.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="sport-status">Status</Label>
                  <select
                    id="sport-status"
                    value={sportForm.status}
                    onChange={(event) => setSportForm((current) => ({ ...current, status: event.target.value as SportsMenuStatus }))}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="1">Active</option>
                    <option value="0">Deactivate</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={savingTab === "sport"}>{savingTab === "sport" ? "Saving..." : "Save"}</Button>
                  <Button type="button" variant="outline" onClick={resetSportForm}>Reset</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="category" className="pt-5">
              <form className="space-y-4" onSubmit={(event) => void submitCategory(event)}>
                <div>
                  <Label htmlFor="category-sport">Sports</Label>
                  <select
                    id="category-sport"
                    value={categoryForm.sportId}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, sportId: event.target.value }))}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="">Select Sports</option>
                    {sportOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="category-name">Name</Label>
                  <Input id="category-name" value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="category-order">Order Position</Label>
                  <Input id="category-order" value={categoryForm.order} onChange={(event) => setCategoryForm((current) => ({ ...current, order: event.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="category-status">Status</Label>
                  <select
                    id="category-status"
                    value={categoryForm.status}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, status: event.target.value as SportsMenuStatus }))}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="1">Active</option>
                    <option value="0">Deactivate</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={savingTab === "category"}>{savingTab === "category" ? "Saving..." : "Save"}</Button>
                  <Button type="button" variant="outline" onClick={resetCategoryForm}>Reset</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="tournament" className="pt-5">
              <form className="space-y-4" onSubmit={(event) => void submitTournament(event)}>
                <div>
                  <Label htmlFor="tournament-sport">Sports</Label>
                  <select
                    id="tournament-sport"
                    value={tournamentForm.sportId}
                    onChange={(event) =>
                      setTournamentForm((current) => ({
                        ...current,
                        sportId: event.target.value,
                        categoryId: "",
                      }))
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="">Select Sports</option>
                    {sportOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="tournament-category">Categories</Label>
                  <select
                    id="tournament-category"
                    value={tournamentForm.categoryId}
                    onChange={(event) => setTournamentForm((current) => ({ ...current, categoryId: event.target.value }))}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="tournament-name">Name</Label>
                  <Input id="tournament-name" value={tournamentForm.name} onChange={(event) => setTournamentForm((current) => ({ ...current, name: event.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="tournament-order">Order Position</Label>
                  <Input id="tournament-order" value={tournamentForm.order} onChange={(event) => setTournamentForm((current) => ({ ...current, order: event.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="tournament-status">Status</Label>
                  <select
                    id="tournament-status"
                    value={tournamentForm.status}
                    onChange={(event) => setTournamentForm((current) => ({ ...current, status: event.target.value as SportsMenuStatus }))}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="1">Active</option>
                    <option value="0">Deactivate</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="tournament-image">Select Image</Label>
                  {tournamentForm.imagePath ? (
                    <img src={tournamentForm.imagePath} alt="Tournament" className="mb-3 h-24 rounded-lg border border-gray-200 object-cover dark:border-gray-700" />
                  ) : null}
                  <input
                    id="tournament-image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setTournamentForm((current) => ({
                          ...current,
                          imagePath: typeof reader.result === "string" ? reader.result : "",
                        }));
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={savingTab === "tournament"}>{savingTab === "tournament" ? "Saving..." : "Save"}</Button>
                  <Button type="button" variant="outline" onClick={resetTournamentForm}>Reset</Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}

export default withAuth(SportsMenuPage);
