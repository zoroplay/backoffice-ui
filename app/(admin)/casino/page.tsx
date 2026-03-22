"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import type { MultiValue } from "react-select";
import { Trophy, Layers, Building2, Megaphone } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { LoadingState } from "@/components/common/LoadingState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeContext";
import { withAuth } from "@/utils/withAuth";
import { casinoApi, normalizeApiError } from "@/lib/api";

import {
  casinoBanners as initialBanners,
  casinoStatusOptions,
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
type LooseRecord = Record<string, unknown>;

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

const toText = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const toBool = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") return value;
  const normalized = toText(value).trim().toLowerCase();
  if (["1", "true", "yes", "active", "enabled"].includes(normalized)) return true;
  if (["0", "false", "no", "inactive", "disabled"].includes(normalized)) return false;
  return fallback;
};

const toArray = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const root = payload as { data?: unknown };
  if (Array.isArray(root.data)) return root.data as T[];
  if (root.data && typeof root.data === "object") {
    return Object.values(root.data as Record<string, T>);
  }

  return [];
};

const parseStatus = (value: unknown): CasinoGame["status"] => {
  const normalized = toText(value).trim().toLowerCase();
  if (normalized === "1" || normalized === "active") return "active";
  if (normalized === "preview") return "preview";
  return "inactive";
};

const parseVolatility = (value: unknown): CasinoGame["volatility"] => {
  const normalized = toText(value, "Medium").trim().toLowerCase();
  if (normalized === "low") return "Low";
  if (normalized === "high") return "High";
  if (normalized === "extreme") return "Extreme";
  return "Medium";
};

const mapCategoryIds = (raw: LooseRecord): string[] => {
  const source = raw.categories ?? raw.categoryIds ?? raw.category_ids ?? raw.subProviderIds;

  if (Array.isArray(source)) {
    return source
      .map((entry) => {
        if (typeof entry === "string" || typeof entry === "number") {
          return String(entry);
        }
        if (entry && typeof entry === "object") {
          const row = entry as LooseRecord;
          return toText(row.id ?? row.slug ?? row.categoryId ?? row.sub_provider_slug, "");
        }
        return "";
      })
      .filter(Boolean);
  }

  const single = toText(raw.sub_provider_slug ?? raw.category ?? "");
  return single ? [single] : [];
};

const mapGameRow = (raw: LooseRecord, index: number): CasinoGame => ({
  id: toText(raw.id ?? raw.gameId ?? raw.slug, `game-${index}`),
  name: toText(raw.name ?? raw.gameName, `Game ${index + 1}`),
  slug: toText(raw.slug ?? raw.game_slug, `game-${index}`),
  providerId: toText(raw.providerId ?? raw.provider_id ?? raw.provider ?? raw.providerSlug, ""),
  categories: mapCategoryIds(raw),
  tags: Array.isArray(raw.tags)
    ? (raw.tags as unknown[]).map((tag) => toText(tag)).filter(Boolean)
    : toText(raw.tags)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  status: parseStatus(raw.status),
  isFeatured: toBool(raw.isFeatured ?? raw.featured),
  hasBonusBuy: toBool(raw.hasBonusBuy ?? raw.bonus_buy ?? raw.bonusBuy),
  rtp: toNumber(raw.rtp, 96),
  volatility: parseVolatility(raw.volatility),
  priority: toNumber(raw.priority ?? raw.rank, 0),
  thumbnail: toText(raw.thumbnail ?? raw.imagePath ?? raw.image, "/casino/vegas-nights.png"),
  updatedAt: toText(raw.updatedAt ?? raw.updated_at, new Date().toISOString()),
});

const mapCategoryRow = (raw: LooseRecord, index: number): GameCategory => ({
  id: toText(raw.id ?? raw.slug, `category-${index}`),
  name: toText(raw.name, `Category ${index + 1}`),
  priority: toNumber(raw.priority ?? raw.rank, 0),
  isActive: toBool(raw.isActive ?? raw.status, true),
  description: toText(raw.description, "") || undefined,
  createdAt: toText(raw.createdAt ?? raw.created_at, new Date().toISOString()),
});

const mapProviderRow = (raw: LooseRecord, index: number): GameProvider => ({
  id: toText(raw.id ?? raw.slug, `provider-${index}`),
  name: toText(raw.name, `Provider ${index + 1}`),
  slug: toText(raw.slug, `provider-${index}`),
  isActive: toBool(raw.isActive ?? raw.status, true),
  totalGames: toNumber(raw.totalGames ?? raw.total_games ?? raw.gamesCount, 0),
  website: toText(raw.website ?? raw.url, "") || undefined,
  headquarters: toText(raw.headquarters ?? raw.country, "") || undefined,
  foundedYear: (() => {
    const year = toNumber(raw.foundedYear ?? raw.founded_year, NaN);
    return Number.isFinite(year) ? year : undefined;
  })(),
});

const toApiStatus = (status: CasinoGame["status"]): number => {
  if (status === "active") return 1;
  if (status === "preview") return 2;
  return 0;
};

function CasinoPage() {
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<CasinoTabKey>("games");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [games, setGames] = useState<CasinoGame[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
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

  const loadCasinoData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [gamesPayload, categoriesPayload, providersPayload] = await Promise.all([
        casinoApi.getGames(),
        casinoApi.getCategories(),
        casinoApi.getProviders(),
      ]);

      const nextGames = toArray<LooseRecord>(gamesPayload)
        .map(mapGameRow)
        .sort((a, b) => b.priority - a.priority);
      const nextCategories = toArray<LooseRecord>(categoriesPayload)
        .map(mapCategoryRow)
        .sort((a, b) => b.priority - a.priority);
      const nextProviders = toArray<LooseRecord>(providersPayload).map(mapProviderRow);

      setGames(nextGames);
      setCategories(nextCategories);
      setProviders(nextProviders);
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message || "Failed to load casino data");
      setGames([]);
      setCategories([]);
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCasinoData();
  }, [loadCasinoData]);

  const filterGroups = useMemo<CasinoGroupedFilterOption[]>(() => {
    const statusOptions: CasinoFilterOption[] = [
      { label: "Active", value: "active", group: "status" },
      { label: "Inactive", value: "inactive", group: "status" },
      { label: "Preview", value: "preview", group: "status" },
    ];

    const featureOptions: CasinoFilterOption[] = [
      { label: "Featured Only", value: "featured", group: "feature" },
      { label: "Bonus Buy", value: "bonus-buy", group: "feature" },
      { label: "Live Dealer", value: "live", group: "feature" },
    ];

    return [
      {
        label: "Categories",
        options: categories.map((category) => ({
          label: category.name,
          value: category.id,
          group: "category",
        })),
      },
      {
        label: "Providers",
        options: providers.map((provider) => ({
          label: provider.name,
          value: provider.id,
          group: "provider",
        })),
      },
      {
        label: "Status",
        options: statusOptions,
      },
      {
        label: "Features",
        options: featureOptions,
      },
    ];
  }, [categories, providers]);

  const handleFilterChange = useCallback(
    (options: MultiValue<CasinoFilterOption>) => {
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

  const handleDeleteGame = useCallback(async (game: CasinoGame) => {
    const confirmDelete = window.confirm(
      `Delete "${game.name}" from the catalogue?`
    );
    if (!confirmDelete) return;

    try {
      setIsSubmitting(true);
      await casinoApi.deleteGame(game.id);
      toast.success("Game deleted successfully");
      await loadCasinoData();
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message || "Failed to delete game");
    } finally {
      setIsSubmitting(false);
    }
  }, [loadCasinoData]);

  const handleGameSubmit = useCallback(
    async (formValues: GameFormValues) => {
      try {
        setIsSubmitting(true);

        await casinoApi.updateGame({
          id: editingGame?.id,
          name: formValues.name,
          slug: formValues.slug,
          providerId: formValues.providerId,
          provider_id: formValues.providerId,
          categories: formValues.categories,
          tags: formValues.tags,
          status: toApiStatus(formValues.status),
          statusLabel: formValues.status,
          isFeatured: formValues.isFeatured,
          hasBonusBuy: formValues.hasBonusBuy,
          rtp: formValues.rtp,
          volatility: formValues.volatility,
          priority: formValues.priority,
          thumbnail: formValues.thumbnail,
        });

        toast.success(editingGame ? "Game updated" : "Game saved");
        setIsGameModalOpen(false);
        setEditingGame(null);
        await loadCasinoData();
      } catch (error) {
        const apiError = normalizeApiError(error);
        toast.error(apiError.message || "Failed to save game");
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingGame, loadCasinoData]
  );

  const openCreateCategory = useCallback(() => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  }, []);

  const openEditCategory = useCallback((category: GameCategory) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  }, []);

  const handleDeleteCategory = useCallback(async (category: GameCategory) => {
    const confirmDelete = window.confirm(
      `Remove category "${category.name}"?`
    );
    if (!confirmDelete) return;

    try {
      setIsSubmitting(true);
      await casinoApi.deleteCategory(category.id);
      toast.success("Category deleted successfully");
      await loadCasinoData();
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message || "Failed to delete category");
    } finally {
      setIsSubmitting(false);
    }
  }, [loadCasinoData]);

  const handleCategorySubmit = useCallback(
    async (values: CategoryFormValues) => {
      try {
        setIsSubmitting(true);
        if (editingCategory) {
          await casinoApi.updateCategory({
            id: editingCategory.id,
            name: values.name,
            slug: values.name.toLowerCase().trim().replace(/\s+/g, "-"),
            priority: values.priority,
            status: values.isActive ? 1 : 0,
            description: values.description ?? "",
          });
          toast.success("Category updated successfully");
        } else {
          await casinoApi.addCategory({
            name: values.name,
            slug: values.name.toLowerCase().trim().replace(/\s+/g, "-"),
            priority: values.priority,
            status: values.isActive ? 1 : 0,
            description: values.description ?? "",
          });
          toast.success("Category created successfully");
        }

        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        await loadCasinoData();
      } catch (error) {
        const apiError = normalizeApiError(error);
        toast.error(apiError.message || "Failed to save category");
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingCategory, loadCasinoData]
  );

  const openCreateProvider = useCallback(() => {
    setEditingProvider(null);
    setIsProviderModalOpen(true);
  }, []);

  const openEditProvider = useCallback((provider: GameProvider) => {
    setEditingProvider(provider);
    setIsProviderModalOpen(true);
  }, []);

  const handleToggleProvider = useCallback(async (provider: GameProvider) => {
    try {
      setIsSubmitting(true);
      await casinoApi.toggleProvider({
        id: provider.id,
        providerId: provider.id,
        status: provider.isActive ? 0 : 1,
      });
      toast.success("Provider status updated");
      await loadCasinoData();
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message || "Failed to toggle provider");
    } finally {
      setIsSubmitting(false);
    }
  }, [loadCasinoData]);

  const handleDeleteProvider = useCallback(async (provider: GameProvider) => {
    const confirmDelete = window.confirm(
      `Remove provider "${provider.name}"?`
    );
    if (!confirmDelete) return;

    try {
      setIsSubmitting(true);
      await casinoApi.deleteProvider(provider.id);
      toast.success("Provider deleted successfully");
      await loadCasinoData();
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message || "Failed to delete provider");
    } finally {
      setIsSubmitting(false);
    }
  }, [loadCasinoData]);

  const handleProviderSubmit = useCallback(
    async (values: ProviderFormValues) => {
      try {
        setIsSubmitting(true);
        await casinoApi.updateProvider({
          id: editingProvider?.id,
          name: values.name,
          slug: values.slug,
          website: values.website,
          headquarters: values.headquarters,
          foundedYear: values.foundedYear,
          status: values.isActive ? 1 : 0,
        });

        toast.success(editingProvider ? "Provider updated" : "Provider saved");
        setIsProviderModalOpen(false);
        setEditingProvider(null);
        await loadCasinoData();
      } catch (error) {
        const apiError = normalizeApiError(error);
        toast.error(apiError.message || "Failed to save provider");
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingProvider, loadCasinoData]
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

      {isLoading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <LoadingState text="Loading casino data..." className="py-12" />
        </div>
      ) : (
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
      )}

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
        onSubmit={(values) => {
          void handleGameSubmit(values);
        }}
      />

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        initialValues={editingCategory ?? undefined}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={(values) => {
          void handleCategorySubmit(values);
        }}
      />

      <ProviderFormModal
        isOpen={isProviderModalOpen}
        initialValues={editingProvider ?? undefined}
        onClose={() => {
          setIsProviderModalOpen(false);
          setEditingProvider(null);
        }}
        onSubmit={(values) => {
          void handleProviderSubmit(values);
        }}
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

      {isSubmitting ? (
        <LoadingState text="Applying changes..." className="justify-start py-1" />
      ) : null}
    </div>
  );
}

export default withAuth(CasinoPage);
