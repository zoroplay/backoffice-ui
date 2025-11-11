"use client";

import React, { useCallback, useMemo, useState } from "react";
import type { ActionMeta, MultiValue } from "react-select";
import { Trophy, Layers, Building2, Megaphone } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeContext";
import { withAuth } from "@/utils/withAuth";

import {
  casinoBanners as initialBanners,
  casinoFilterOptions,
  casinoGames as initialGames,
  casinoStatusOptions,
  gameCategories as initialCategories,
  gameProviders as initialProviders,
  bannerPositions,
  bannerTargets,
} from "./data";
import CasinoGamesTab from "./components/CasinoGamesTab";
import GameCategoriesTab from "./components/GameCategoriesTab";
import ProvidersTab from "./components/ProvidersTab";
import BannersTab from "./components/BannersTab";
import GameFormModal from "./components/GameFormModal";
import CategoryFormModal from "./components/CategoryFormModal";
import ProviderFormModal from "./components/ProviderFormModal";
import BannerFormModal from "./components/BannerFormModal";
import type {
  BannerFormValues,
  CasinoBanner,
  CasinoFilterOption,
  CasinoGame,
  CasinoGroupedFilterOption,
  GameCategory,
  GameFormValues,
  GameProvider,
  ProviderFormValues,
  CategoryFormValues,
} from "./types";

type CasinoTabKey = "games" | "categories" | "providers" | "banners";

const tabConfig: Array<{
  key: CasinoTabKey;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    key: "games",
    label: "Casino Games",
    description: "Browse and manage the entire casino catalogue.",
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    key: "categories",
    label: "Game Categories",
    description: "Shape lobby groupings and priority weighting.",
    icon: <Layers className="h-4 w-4" />,
  },
  {
    key: "providers",
    label: "Providers",
    description: "Control provider availability across channels.",
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    key: "banners",
    label: "Banners",
    description: "Launch promotional creatives and hero placements.",
    icon: <Megaphone className="h-4 w-4" />,
  },
];

function enforceSingleSelections(
  options: MultiValue<CasinoFilterOption>
): CasinoFilterOption[] {
  const deduped: CasinoFilterOption[] = [];
  for (const option of options) {
    const existingIndex = deduped.findIndex(
      (item) => item.group === option.group
    );
    if (existingIndex >= 0) {
      deduped[existingIndex] = option;
    } else {
      deduped.push(option);
    }
  }
  return deduped;
}

function CasinoPage() {
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<CasinoTabKey>("games");

  const [games, setGames] = useState<CasinoGame[]>(() =>
    [...initialGames].sort((a, b) => b.priority - a.priority)
  );
  const [categories, setCategories] = useState<GameCategory[]>(() =>
    [...initialCategories].sort((a, b) => b.priority - a.priority)
  );
  const [providers, setProviders] = useState<GameProvider[]>(initialProviders);
  const [banners, setBanners] = useState<CasinoBanner[]>(initialBanners);

  const [selectedFilters, setSelectedFilters] = useState<CasinoFilterOption[]>(
    []
  );
  const [appliedFilters, setAppliedFilters] = useState<CasinoFilterOption[]>(
    []
  );

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<CasinoGame | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GameCategory | null>(
    null
  );

  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<GameProvider | null>(
    null
  );

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<CasinoBanner | null>(null);

  const filterGroups = useMemo<CasinoGroupedFilterOption[]>(
    () => casinoFilterOptions,
    []
  );

  const handleFilterChange = useCallback(
    (
      options: MultiValue<CasinoFilterOption>,
      _meta: ActionMeta<CasinoFilterOption>
    ) => {
      const deduped = enforceSingleSelections(options);
      setSelectedFilters(deduped);
    },
    []
  );

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(selectedFilters);
  }, [selectedFilters]);

  const handleClearFilters = useCallback(() => {
    setSelectedFilters([]);
    setAppliedFilters([]);
  }, []);

  const filteredGames = useMemo<CasinoGame[]>(() => {
    if (appliedFilters.length === 0) {
      return games;
    }

    return games.filter((game) => {
      return appliedFilters.every((filter) => {
        switch (filter.group) {
          case "category":
            return game.categories.includes(filter.value);
          case "provider":
            return game.providerId === filter.value;
          case "status":
            return game.status === filter.value;
          case "feature":
            if (filter.value === "featured") {
              return game.isFeatured;
            }
            if (filter.value === "bonus-buy") {
              return game.hasBonusBuy;
            }
            if (filter.value === "live") {
              return (
                game.categories.includes("cat-live") ||
                game.tags.includes("live")
              );
            }
            return game.tags.includes(filter.value);
          default:
            return true;
        }
      });
    });
  }, [appliedFilters, games]);

  const openCreateGame = useCallback(() => {
    setEditingGame(null);
    setIsGameModalOpen(true);
  }, []);

  const openEditGame = useCallback((game: CasinoGame) => {
    setEditingGame(game);
    setIsGameModalOpen(true);
  }, []);

  const handleDeleteGame = useCallback((game: CasinoGame) => {
    const confirmDelete = window.confirm(
      `Delete "${game.name}" from the catalogue?`
    );
    if (!confirmDelete) return;
    setGames((prev) => prev.filter((item) => item.id !== game.id));
  }, []);

  const handleGameSubmit = useCallback(
    (formValues: GameFormValues) => {
      const timestamp = new Date().toISOString();
      if (editingGame) {
        setGames((prev) =>
          prev
            .map((game) =>
              game.id === editingGame.id
                ? { ...game, ...formValues, updatedAt: timestamp }
                : game
            )
            .sort((a, b) => b.priority - a.priority)
        );
      } else {
        const newGame: CasinoGame = {
          id: `game-${Date.now()}`,
          updatedAt: timestamp,
          ...formValues,
        };
        setGames((prev) =>
          [newGame, ...prev].sort((a, b) => b.priority - a.priority)
        );
      }

      setIsGameModalOpen(false);
      setEditingGame(null);
    },
    [editingGame]
  );

  const openCreateCategory = useCallback(() => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  }, []);

  const openEditCategory = useCallback((category: GameCategory) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  }, []);

  const handleDeleteCategory = useCallback((category: GameCategory) => {
    const confirmDelete = window.confirm(
      `Remove category "${category.name}"?`
    );
    if (!confirmDelete) return;

    setCategories((prev) =>
      prev.filter((item) => item.id !== category.id)
    );

    setGames((prev) =>
      prev.map((game) => ({
        ...game,
        categories: game.categories.filter((id) => id !== category.id),
      }))
    );
  }, []);

  const handleCategorySubmit = useCallback(
    (values: CategoryFormValues) => {
      if (editingCategory) {
        setCategories((prev) =>
          prev
            .map((category) =>
              category.id === editingCategory.id
                ? {
                    ...category,
                    name: values.name,
                    priority: values.priority,
                    isActive: values.isActive,
                    description: values.description,
                  }
                : category
            )
            .sort((a, b) => b.priority - a.priority)
        );
      } else {
        const newCategory: GameCategory = {
          id: `category-${Date.now()}`,
          createdAt: new Date().toISOString(),
          name: values.name,
          priority: values.priority,
          isActive: values.isActive,
          description: values.description,
        };
        setCategories((prev) =>
          [newCategory, ...prev].sort((a, b) => b.priority - a.priority)
        );
      }

      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    },
    [editingCategory]
  );

  const openCreateProvider = useCallback(() => {
    setEditingProvider(null);
    setIsProviderModalOpen(true);
  }, []);

  const openEditProvider = useCallback((provider: GameProvider) => {
    setEditingProvider(provider);
    setIsProviderModalOpen(true);
  }, []);

  const handleToggleProvider = useCallback((provider: GameProvider) => {
    setProviders((prev) =>
      prev.map((item) =>
        item.id === provider.id
          ? { ...item, isActive: !item.isActive }
          : item
      )
    );
  }, []);

  const handleDeleteProvider = useCallback((provider: GameProvider) => {
    const confirmDelete = window.confirm(
      `Remove provider "${provider.name}"?`
    );
    if (!confirmDelete) return;

    setProviders((prev) => prev.filter((item) => item.id !== provider.id));
    setGames((prev) =>
      prev.filter((game) => game.providerId !== provider.id)
    );
  }, []);

  const handleProviderSubmit = useCallback(
    (values: ProviderFormValues) => {
      if (editingProvider) {
        setProviders((prev) =>
          prev.map((provider) =>
            provider.id === editingProvider.id
              ? {
                  ...provider,
                  name: values.name,
                  slug: values.slug,
                  website: values.website,
                  headquarters: values.headquarters,
                  foundedYear: values.foundedYear,
                  isActive: values.isActive,
                }
              : provider
          )
        );
      } else {
        const newProvider: GameProvider = {
          id: `provider-${Date.now()}`,
          name: values.name,
          slug: values.slug,
          website: values.website,
          headquarters: values.headquarters,
          foundedYear: values.foundedYear,
          isActive: values.isActive,
          totalGames: 0,
        };
        setProviders((prev) => [newProvider, ...prev]);
      }

      setIsProviderModalOpen(false);
      setEditingProvider(null);
    },
    [editingProvider]
  );

  const openCreateBanner = useCallback(() => {
    setEditingBanner(null);
    setIsBannerModalOpen(true);
  }, []);

  const openEditBanner = useCallback((banner: CasinoBanner) => {
    setEditingBanner(banner);
    setIsBannerModalOpen(true);
  }, []);

  const handleDeleteBanner = useCallback((banner: CasinoBanner) => {
    const confirmDelete = window.confirm(
      `Delete banner "${banner.title}"?`
    );
    if (!confirmDelete) return;
    setBanners((prev) => prev.filter((item) => item.id !== banner.id));
  }, []);

  const handleBannerSubmit = useCallback(
    (values: BannerFormValues) => {
      if (editingBanner) {
        setBanners((prev) =>
          prev.map((banner) =>
            banner.id === editingBanner.id
              ? {
                  ...banner,
                  title: values.title,
                  target: values.target,
                  position: values.position,
                  link: values.link,
                  isActive: values.isActive,
                  image: values.image,
                  content: values.content,
                  audience: values.audience,
                  lastUpdated: new Date().toISOString(),
                }
              : banner
          )
        );
      } else {
        const newBanner: CasinoBanner = {
          id: `banner-${Date.now()}`,
          title: values.title,
          target: values.target,
          position: values.position,
          link: values.link,
          isActive: values.isActive,
          image: values.image,
          content: values.content,
          audience: values.audience,
          lastUpdated: new Date().toISOString(),
        };
        setBanners((prev) => [newBanner, ...prev]);
      }

      setIsBannerModalOpen(false);
      setEditingBanner(null);
    },
    [editingBanner]
  );

  const editingGameValues: GameFormValues | undefined = useMemo(() => {
    if (!editingGame) return undefined;
    const {
      name,
      slug,
      providerId,
      categories: categoryIds,
      tags,
      status,
      isFeatured,
      hasBonusBuy,
      rtp,
      volatility,
      priority,
      thumbnail,
    } = editingGame;
    return {
      name,
      slug,
      providerId,
      categories: categoryIds,
      tags,
      status,
      isFeatured,
      hasBonusBuy,
      rtp,
      volatility,
      priority,
      thumbnail,
    };
  }, [editingGame]);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Casino Management" />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CasinoTabKey)}>
        <TabsList className="flex w-full flex-wrap items-center justify-center gap-2 rounded-full border border-gray-100 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:justify-start">
          {tabConfig.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="group inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 transition data-[state=active]:bg-brand-500 data-[state=active]:text-white dark:text-gray-400 dark:data-[state=active]:bg-brand-400 dark:data-[state=active]:text-gray-950"
            >
              <span>{tab.icon}</span>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="games">
          <CasinoGamesTab
            theme={theme}
            games={games}
            filteredGames={filteredGames}
            categories={categories}
            providers={providers}
            filterGroups={filterGroups}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            onCreateGame={openCreateGame}
            onEditGame={openEditGame}
            onDeleteGame={handleDeleteGame}
          />
        </TabsContent>

        <TabsContent value="categories">
          <GameCategoriesTab
            categories={categories}
            onCreateCategory={openCreateCategory}
            onEditCategory={openEditCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </TabsContent>

        <TabsContent value="providers">
          <ProvidersTab
            providers={providers}
            onCreateProvider={openCreateProvider}
            onEditProvider={openEditProvider}
            onToggleProvider={handleToggleProvider}
            onDeleteProvider={handleDeleteProvider}
          />
        </TabsContent>

        <TabsContent value="banners">
          <BannersTab
            banners={banners}
            onCreateBanner={openCreateBanner}
            onEditBanner={openEditBanner}
            onDeleteBanner={handleDeleteBanner}
          />
        </TabsContent>
      </Tabs>

      <GameFormModal
        theme={theme}
        isOpen={isGameModalOpen}
        categories={categories}
        providers={providers}
        statusOptions={casinoStatusOptions}
        initialValues={editingGameValues}
        onClose={() => {
          setIsGameModalOpen(false);
          setEditingGame(null);
        }}
        onSubmit={handleGameSubmit}
      />

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        initialValues={editingCategory ?? undefined}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleCategorySubmit}
      />

      <ProviderFormModal
        isOpen={isProviderModalOpen}
        initialValues={editingProvider ?? undefined}
        onClose={() => {
          setIsProviderModalOpen(false);
          setEditingProvider(null);
        }}
        onSubmit={handleProviderSubmit}
      />

      <BannerFormModal
        theme={theme}
        isOpen={isBannerModalOpen}
        initialValues={editingBanner ?? undefined}
        targets={bannerTargets}
        positions={bannerPositions}
        onClose={() => {
          setIsBannerModalOpen(false);
          setEditingBanner(null);
        }}
        onSubmit={handleBannerSubmit}
      />
    </div>
  );
}

export default withAuth(CasinoPage);

