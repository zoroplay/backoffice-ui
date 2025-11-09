"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Plus,
  Trash2,
} from "lucide-react";
import Select, { type SingleValue } from "react-select";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Switch from "@/components/form/switch/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { withAuth } from "@/utils/withAuth";

import {
  type CategoryNode,
  type SelectOption,
  type SportNode,
  type Status,
  statusOptions,
  sportsMenuSeed,
} from "./data";

type SportFormState = {
  name: string;
  order: string;
  status: SelectOption<Status> | null;
  featured: boolean;
};

type CategoryFormState = {
  sport: SelectOption | null;
  name: string;
  order: string;
  status: SelectOption<Status> | null;
};

type TournamentFormState = {
  sport: SelectOption | null;
  category: SelectOption | null;
  name: string;
  order: string;
  status: SelectOption<Status> | null;
  imageSource: string | null;
};

const buildInitialSportForm = (): SportFormState => ({
  name: "",
  order: "",
  status: statusOptions[0],
  featured: true,
});

const buildInitialCategoryForm = (): CategoryFormState => ({
  sport: null,
  name: "",
  order: "",
  status: statusOptions[0],
});

const buildInitialTournamentForm = (): TournamentFormState => ({
  sport: null,
  category: null,
  name: "",
  order: "",
  status: statusOptions[0],
  imageSource: null,
});

const SportsMenuPage: React.FC = () => {
  const { theme } = useTheme();
  const [sportsMenu, setSportsMenu] = useState<SportNode[]>(sportsMenuSeed);
  const [expandedSports, setExpandedSports] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sportsMenuSeed.map((sport) => [sport.id, true]))
  );
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const [sportForm, setSportForm] = useState<SportFormState>(() => buildInitialSportForm());
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(() => buildInitialCategoryForm());
  const [tournamentForm, setTournamentForm] = useState<TournamentFormState>(() => buildInitialTournamentForm());

  const sportOptions = useMemo<SelectOption[]>(() => {
    return sportsMenu.map((sport) => ({
      value: sport.id,
      label: sport.name,
    }));
  }, [sportsMenu]);

  const categoryOptions = useMemo<SelectOption[]>(() => {
    if (!tournamentForm.sport) return [];
    const sport = sportsMenu.find((item) => item.id === tournamentForm.sport?.value);
    return (
      sport?.categories.map((category) => ({
        value: category.id,
        label: category.name,
      })) ?? []
    );
  }, [sportsMenu, tournamentForm.sport]);

  const toggleSport = useCallback((sportId: string) => {
    setExpandedSports((prev) => ({
      ...prev,
      [sportId]: !prev[sportId],
    }));
  }, []);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }, []);

  const handleSportSubmit = () => {
    if (!sportForm.name.trim()) {
      alert("Please provide a sport name.");
      return;
    }
    const newSport: SportNode = {
      id: `sport-${Date.now()}`,
      name: sportForm.name.trim(),
      order: Number(sportForm.order) || sportsMenu.length + 1,
      status: (sportForm.status?.value ?? "Active") as Status,
      categories: [],
    };
    setSportsMenu((prev) => [...prev, newSport]);
    setExpandedSports((prev) => ({ ...prev, [newSport.id]: true }));
    setSportForm(buildInitialSportForm());
    alert("Sport saved (mock).");
  };

  const handleCategorySubmit = () => {
    if (!categoryForm.sport) {
      alert("Select a sport for this category.");
      return;
    }
    if (!categoryForm.name.trim()) {
      alert("Please provide a category name.");
      return;
    }
    const sportId = categoryForm.sport.value;
    const newCategory: CategoryNode = {
      id: `cat-${Date.now()}`,
      name: categoryForm.name.trim(),
      order: Number(categoryForm.order) || 1,
      status: (categoryForm.status?.value ?? "Active") as Status,
      tournaments: [],
    };
    setSportsMenu((prev) =>
      prev.map((sport) =>
        sport.id === sportId
          ? {
              ...sport,
              categories: [...sport.categories, newCategory],
            }
          : sport
      )
    );
    setExpandedSports((prev) => ({ ...prev, [sportId]: true }));
    setExpandedCategories((prev) => ({ ...prev, [newCategory.id]: true }));
    setCategoryForm(buildInitialCategoryForm());
    alert("Category saved (mock).");
  };

  const handleTournamentSubmit = () => {
    if (!tournamentForm.sport || !tournamentForm.category) {
      alert("Select a sport and category for this tournament.");
      return;
    }
    if (!tournamentForm.name.trim()) {
      alert("Please provide a tournament name.");
      return;
    }
    const sportId = tournamentForm.sport.value;
    const categoryId = tournamentForm.category.value;
    const newTournament = {
      id: `tour-${Date.now()}`,
      name: tournamentForm.name.trim(),
      order: Number(tournamentForm.order) || 1,
      status: (tournamentForm.status?.value ?? "Active") as Status,
      image: tournamentForm.imageSource ?? undefined,
    };
    setSportsMenu((prev) =>
      prev.map((sport) =>
        sport.id === sportId
          ? {
              ...sport,
              categories: sport.categories.map((category) =>
                category.id === categoryId
                  ? {
                      ...category,
                      tournaments: [...category.tournaments, newTournament],
                    }
                  : category
              ),
            }
          : sport
      )
    );
    setExpandedSports((prev) => ({ ...prev, [sportId]: true }));
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: true }));
    setTournamentForm(buildInitialTournamentForm());
    alert("Tournament saved (mock).");
  };

  const handleTournamentSportChange = (option: SingleValue<SelectOption>) => {
    setTournamentForm((prev) => ({
      ...prev,
      sport: option ?? null,
      category: null,
    }));
  };

  const handleTournamentCategoryChange = (option: SingleValue<SelectOption>) => {
    setTournamentForm((prev) => ({
      ...prev,
      category: option ?? null,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setTournamentForm((prev) => ({ ...prev, imageSource: null }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setTournamentForm((prev) => ({
        ...prev,
        imageSource: result,
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Sports Menu" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Sports List</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage the hierarchy of sports, categories, and tournaments.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-brand-500 text-white hover:bg-brand-600"
              onClick={() => alert("Sync with provider (mock).")}
            >
              Sync Feed
            </Button>
          </div>

          <div className="max-h-[600px] overflow-y-auto px-6 pb-6 pt-4 custom-scrollbar">
            <ul className="space-y-2">
              {sportsMenu.map((sport) => {
                const isExpanded = expandedSports[sport.id] ?? false;
                return (
                  <li key={sport.id} className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleSport(sport.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:border-brand-400 hover:text-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:text-brand-300"
                          aria-label={isExpanded ? "Collapse sport" : "Expand sport"}
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{sport.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Order #{sport.order} · {sport.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="text-gray-500 transition hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-300"
                          onClick={() => alert("Edit sport (mock).")}
                          aria-label="Edit sport"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="text-gray-500 transition hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                          onClick={() => alert("Delete sport (mock).")}
                          aria-label="Delete sport"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="text-gray-500 transition hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-300"
                          onClick={() => alert("Add category (mock).")}
                          aria-label="Add category"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950/80">
                        {sport.categories.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No categories added yet.
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {sport.categories.map((category) => {
                              const catExpanded = expandedCategories[category.id] ?? false;
                              return (
                                <li
                                  key={category.id}
                                  className="rounded-md border border-dashed border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60"
                                >
                                  <div className="flex items-center justify-between px-3 py-2">
                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={() => toggleCategory(category.id)}
                                        className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:border-brand-400 hover:text-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:text-brand-300"
                                        aria-label={catExpanded ? "Collapse category" : "Expand category"}
                                      >
                                        {catExpanded ? (
                                          <ChevronDown className="h-4 w-4" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4" />
                                        )}
                                      </button>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                          {category.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          Order #{category.order} · {category.status}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        className="text-gray-500 transition hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-300"
                                        onClick={() => alert("Edit category (mock).")}
                                        aria-label="Edit category"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        className="text-gray-500 transition hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                        onClick={() => alert("Delete category (mock).")}
                                        aria-label="Delete category"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        className="text-gray-500 transition hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-300"
                                        onClick={() => alert("Add tournament (mock).")}
                                        aria-label="Add tournament"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {catExpanded && (
                                    <div className="space-y-2 border-t border-dashed border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950/70">
                                      {category.tournaments.length === 0 ? (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          No tournaments configured.
                                        </p>
                                      ) : (
                                        category.tournaments.map((tournament) => (
                                          <div
                                            key={tournament.id}
                                            className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900/60"
                                          >
                                            <div>
                                              <p className="font-medium text-gray-900 dark:text-white">
                                                {tournament.name}
                                              </p>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Order #{tournament.order} · {tournament.status}
                                              </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <button
                                                type="button"
                                                className="text-gray-500 transition hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-300"
                                                onClick={() => alert("Edit tournament (mock).")}
                                                aria-label="Edit tournament"
                                              >
                                                <Edit2 className="h-4 w-4" />
                                              </button>
                                              <button
                                                type="button"
                                                className="text-gray-500 transition hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                                onClick={() => alert("Delete tournament (mock).")}
                                                aria-label="Delete tournament"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </button>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <Tabs defaultValue="sports" className="space-y-6">
            <TabsList className="mb-6 h-auto w-full rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:from-gray-900/40 dark:to-gray-900/20">
              <TabsTrigger
                value="sports"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-brand-500 data-[state=active]:border data-[state=active]:border-brand-200 data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-md dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-300 dark:data-[state=active]:border-brand-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-brand-300"
              >
                Sports Mgmt.
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-indigo-500 data-[state=active]:border data-[state=active]:border-indigo-200 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-300 dark:data-[state=active]:border-indigo-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-indigo-300"
              >
                Category Mgmt.
              </TabsTrigger>
              <TabsTrigger
                value="tournaments"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-emerald-500 data-[state=active]:border data-[state=active]:border-emerald-200 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-md dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-emerald-300 dark:data-[state=active]:border-emerald-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-emerald-300"
              >
                Tournament Mgmt.
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sports" className="px-6 pb-6">
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSportSubmit();
                }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="sportName">Name *</Label>
                  <Input
                    id="sportName"
                    placeholder="Enter sport name"
                    value={sportForm.name}
                    onChange={(event) =>
                      setSportForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sportOrder">Order Position</Label>
                  <Input
                    id="sportOrder"
                    type="number"
                    placeholder="e.g. 1"
                    value={sportForm.order}
                    onChange={(event) =>
                      setSportForm((prev) => ({ ...prev, order: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select<SelectOption<Status>, false>
                    styles={reactSelectStyles(theme)}
                    options={statusOptions}
                    value={sportForm.status}
                    onChange={(option: SingleValue<SelectOption<Status>>) =>
                      setSportForm((prev) => ({ ...prev, status: option ?? null }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-200 px-3 py-2 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Feature on homepage</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Toggle whether this sport shows on the public landing page.
                    </p>
                  </div>
                  <Switch
                    label=""
                    defaultChecked={sportForm.featured}
                    onChange={(checked) =>
                      setSportForm((prev) => ({ ...prev, featured: checked }))
                    }
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="bg-brand-500 text-white hover:bg-brand-600">
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSportForm(buildInitialSportForm())}
                  >
                    Reset
                  </Button>
                </div>
              </Form>
            </TabsContent>

            <TabsContent value="categories" className="px-6 pb-6">
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleCategorySubmit();
                }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label>Sports *</Label>
                  <Select<SelectOption, false>
                    styles={reactSelectStyles(theme)}
                    options={sportOptions}
                    value={categoryForm.sport}
                    placeholder="Select sport"
                    onChange={(option: SingleValue<SelectOption>) =>
                      setCategoryForm((prev) => ({ ...prev, sport: option ?? null }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Name *</Label>
                  <Input
                    id="categoryName"
                    placeholder="Enter category name"
                    value={categoryForm.name}
                    onChange={(event) =>
                      setCategoryForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryOrder">Order Position</Label>
                  <Input
                    id="categoryOrder"
                    type="number"
                    placeholder="e.g. 100"
                    value={categoryForm.order}
                    onChange={(event) =>
                      setCategoryForm((prev) => ({ ...prev, order: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select<SelectOption<Status>, false>
                    styles={reactSelectStyles(theme)}
                    options={statusOptions}
                    value={categoryForm.status}
                    onChange={(option: SingleValue<SelectOption<Status>>) =>
                      setCategoryForm((prev) => ({ ...prev, status: option ?? null }))
                    }
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="bg-brand-500 text-white hover:bg-brand-600">
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCategoryForm(buildInitialCategoryForm())}
                  >
                    Reset
                  </Button>
                </div>
              </Form>
            </TabsContent>

            <TabsContent value="tournaments" className="px-6 pb-6">
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleTournamentSubmit();
                }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label>Sports *</Label>
                  <Select<SelectOption, false>
                    styles={reactSelectStyles(theme)}
                    options={sportOptions}
                    value={tournamentForm.sport}
                    placeholder="Select sport"
                    onChange={handleTournamentSportChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categories *</Label>
                  <Select<SelectOption, false>
                    styles={reactSelectStyles(theme)}
                    options={categoryOptions}
                    value={tournamentForm.category}
                    placeholder="Select category"
                    onChange={handleTournamentCategoryChange}
                    isDisabled={!tournamentForm.sport}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tournamentName">Name *</Label>
                  <Input
                    id="tournamentName"
                    placeholder="Enter tournament name"
                    value={tournamentForm.name}
                    onChange={(event) =>
                      setTournamentForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tournamentOrder">Order Position</Label>
                  <Input
                    id="tournamentOrder"
                    type="number"
                    placeholder="e.g. 200"
                    value={tournamentForm.order}
                    onChange={(event) =>
                      setTournamentForm((prev) => ({ ...prev, order: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select<SelectOption<Status>, false>
                    styles={reactSelectStyles(theme)}
                    options={statusOptions}
                    value={tournamentForm.status}
                    onChange={(option: SingleValue<SelectOption<Status>>) =>
                      setTournamentForm((prev) => ({ ...prev, status: option ?? null }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tournamentImage">Select Image</Label>
                  <Input id="tournamentImage" type="file" accept="image/*" onChange={handleImageUpload} />
                  {tournamentForm.imageSource && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Image selected (mock preview not rendered).
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="bg-brand-500 text-white hover:bg-brand-600">
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTournamentForm(buildInitialTournamentForm())}
                  >
                    Reset
                  </Button>
                </div>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default withAuth(SportsMenuPage);


