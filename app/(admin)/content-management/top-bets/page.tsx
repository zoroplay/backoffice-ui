"use client";

import React, { useEffect, useMemo, useState } from "react";
import Select, { type SingleValue } from "react-select";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import { Plus, Trash2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { withAuth } from "@/utils/withAuth";

import { sportsData } from "./data";

interface Option {
  value: string;
  label: string;
}

interface TopTournament {
  id: string;
  sport: string;
  category: string;
  tournament: string;
  showOnHome: boolean;
  showOnSideMenu: boolean;
}

const yesNoOptions: Option[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const topTournamentSeed: TopTournament[] = [
  {
    id: "top-1",
    sport: "Soccer",
    category: "International",
    tournament: "UEFA Champions League",
    showOnHome: true,
    showOnSideMenu: false,
  },
  {
    id: "top-2",
    sport: "Soccer",
    category: "International",
    tournament: "World Cup Qualification UEFA",
    showOnHome: true,
    showOnSideMenu: true,
  },
];

function TopBetsPage() {
  const { theme } = useTheme();

  const sportOptions = useMemo<Option[]>(
    () => sportsData.map((sport) => ({ value: sport.id, label: sport.name })),
    []
  );

  const [selectedSport, setSelectedSport] = useState<Option | null>(sportOptions[0] ?? null);
  const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Option | null>(null);
  const [showOnHome, setShowOnHome] = useState<Option>(yesNoOptions[0]);
  const [showOnSideMenu, setShowOnSideMenu] = useState<Option>(yesNoOptions[1]);
  const [topTournaments, setTopTournaments] = useState<TopTournament[]>(topTournamentSeed);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [tournamentToRemove, setTournamentToRemove] = useState<TopTournament | null>(null);

  const availableCategories = useMemo<Option[]>(() => {
    if (!selectedSport) return [];
    const sport = sportsData.find((item) => item.id === selectedSport.value);
    if (!sport) return [];
    return sport.categories.map((category) => ({ value: category.id, label: category.name }));
  }, [selectedSport]);

  const availableTournaments = useMemo<Option[]>(() => {
    if (!selectedSport || !selectedCategory) return [];
    const sport = sportsData.find((item) => item.id === selectedSport.value);
    const category = sport?.categories.find((item) => item.id === selectedCategory.value);
    if (!category) return [];
    return category.tournaments.map((tournament) => ({
      value: tournament.id,
      label: tournament.name,
    }));
  }, [selectedSport, selectedCategory]);

  useEffect(() => {
    if (!selectedSport) {
      setSelectedCategory(null);
      return;
    }
    const nextCategory = availableCategories[0] ?? null;
    setSelectedCategory(nextCategory);
  }, [selectedSport, availableCategories]);

  useEffect(() => {
    if (!selectedCategory) {
      setSelectedTournament(null);
      return;
    }
    const nextTournament = availableTournaments[0] ?? null;
    setSelectedTournament(nextTournament);
  }, [selectedCategory, availableTournaments]);

  const handleAddTopTournament = () => {
    if (!selectedSport || !selectedCategory || !selectedTournament) {
      alert("Please select sport, category, and tournament.");
      return;
    }

    const sportName = selectedSport.label;
    const categoryName = selectedCategory.label;
    const tournamentName = selectedTournament.label;

    const alreadyExists = topTournaments.some(
      (item) =>
        item.sport === sportName &&
        item.category === categoryName &&
        item.tournament === tournamentName
    );

    if (alreadyExists) {
      alert("This tournament is already in the top list.");
      return;
    }

    setTopTournaments((prev) => [
      {
        id: `top-${Date.now()}`,
        sport: sportName,
        category: categoryName,
        tournament: tournamentName,
        showOnHome: showOnHome.value === "yes",
        showOnSideMenu: showOnSideMenu.value === "yes",
      },
      ...prev,
    ]);

    alert("Top tournament saved (mock).");
    setIsFormModalOpen(false);
  };

  const handleRemoveTournament = (item: TopTournament) => {
    setTournamentToRemove(item);
    setIsRemoveModalOpen(true);
  };

  const confirmRemoveTournament = () => {
    if (!tournamentToRemove) return;

    setTopTournaments((prev) => prev.filter((item) => item.id !== tournamentToRemove.id));
    setIsRemoveModalOpen(false);
    setTournamentToRemove(null);
  };

  const summary = useMemo(() => {
    const total = topTournaments.length;
    const homeCount = topTournaments.filter((item) => item.showOnHome).length;
    const sideMenuCount = topTournaments.filter((item) => item.showOnSideMenu).length;
    return { total, homeCount, sideMenuCount };
  }, [topTournaments]);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Top Bets" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Curated Tournaments</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Highlight key competitions across products for quick access and ongoing campaigns.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Top Tournaments</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Visible on Home</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.homeCount}</p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">On Side Menu</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.sideMenuCount}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Tournaments</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Drag-and-drop ordering will be available once API sorting is ready. For now, items are listed by most recent additions.
              </p>
            </div>
            <Button
              onClick={() => setIsFormModalOpen(true)}
              className="bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-500 dark:text-white dark:hover:bg-brand-600"
              
            >
              Add Tournament
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {topTournaments.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No tournaments have been pinned yet. Add one using the form.
              </div>
            )}
            {topTournaments.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/60"
              >
                <div className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {item.sport} → {item.category} → {item.tournament}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span
                      className={`rounded-full px-2 py-1 font-medium ${
                        item.showOnHome
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300"
                      }`}
                    >
                      Home: {item.showOnHome ? "Yes" : "No"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 font-medium ${
                        item.showOnSideMenu
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300"
                      }`}
                    >
                      Side Menu: {item.showOnSideMenu ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveTournament(item)}
                  className="px-2"
                  aria-label={`Remove ${item.tournament}`}
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={isRemoveModalOpen} onClose={() => setIsRemoveModalOpen(false)}>
        <ModalHeader>Remove Tournament</ModalHeader>
        <ModalBody>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to remove
            {" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {tournamentToRemove?.tournament}
            </span>
            {" "}
            from the Top Bets list?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsRemoveModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmRemoveTournament}>Remove</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} size="lg">
        <ModalHeader>Add Tournament to Top Bet</ModalHeader>
        <ModalBody>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Selections cascade from sport to category to tournament. Toggle platform visibility before saving.
          </p>
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              handleAddTopTournament();
            }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Sport</Label>
                <Select<Option, false>
                  styles={reactSelectStyles(theme)}
                  options={sportOptions}
                  placeholder="Select sport"
                  value={selectedSport}
                  onChange={(option: SingleValue<Option>) => setSelectedSport(option ?? null)}
                />
              </div>
              <div>
                <Label>Category / Country</Label>
                <Select<Option, false>
                  styles={reactSelectStyles(theme)}
                  options={availableCategories}
                  placeholder="Select category"
                  value={selectedCategory}
                  onChange={(option: SingleValue<Option>) => setSelectedCategory(option ?? null)}
                  isDisabled={availableCategories.length === 0}
                />
              </div>
              <div>
                <Label>Tournament</Label>
                <Select<Option, false>
                  styles={reactSelectStyles(theme)}
                  options={availableTournaments}
                  placeholder="Select tournament"
                  value={selectedTournament}
                  onChange={(option: SingleValue<Option>) => setSelectedTournament(option ?? null)}
                  isDisabled={availableTournaments.length === 0}
                />
              </div>
              <div>
                <Label>Show on Home Screen</Label>
                <Select<Option, false>
                  styles={reactSelectStyles(theme)}
                  options={yesNoOptions}
                  value={showOnHome}
                  onChange={(option: SingleValue<Option>) =>
                    setShowOnHome(option ?? yesNoOptions[0])
                  }
                />
              </div>
              <div>
                <Label>Show on Side Menu</Label>
                <Select<Option, false>
                  styles={reactSelectStyles(theme)}
                  options={yesNoOptions}
                  value={showOnSideMenu}
                  onChange={(option: SingleValue<Option>) =>
                    setShowOnSideMenu(option ?? yesNoOptions[1])
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>
    </div>
  );
}

export default withAuth(TopBetsPage);
