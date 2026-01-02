"use client";

import React from "react";
import Image from "next/image";
import { type ActionMeta, type GroupBase, type MultiValue, type StylesConfig } from "react-select";
import type { ColumnDef } from "@tanstack/react-table";
import { PencilLine, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";

import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";

import type {
  CasinoGame,
  CasinoGroupedFilterOption,
  CasinoFilterOption,
  GameCategory,
  GameProvider,
} from "../types";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useMemo } from "react";
type CasinoGamesTabProps = {
  theme: string | null;
  games: CasinoGame[];
  filteredGames: CasinoGame[];
  categories: GameCategory[];
  providers: GameProvider[];
  filterGroups: CasinoGroupedFilterOption[];
  selectedFilters: CasinoFilterOption[];
  onFilterChange: (
    nextValue: MultiValue<CasinoFilterOption>,
    actionMeta: ActionMeta<CasinoFilterOption>
  ) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  onCreateGame: () => void;
  onEditGame: (game: CasinoGame) => void;
  onDeleteGame: (game: CasinoGame) => void;
};

export function CasinoGamesTab({
  theme,
  games,
  filteredGames,
  categories,
  providers,
  filterGroups,
  selectedFilters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  onCreateGame,
  onEditGame,
  onDeleteGame,
}: CasinoGamesTabProps) {
  const normalizedTheme =
    theme === "light" || theme === "dark" ? theme : undefined;
  const selectStyles = useMemo<StylesConfig<CasinoFilterOption, true, GroupBase<CasinoFilterOption>>>(
    () =>
      reactSelectStyles<CasinoFilterOption, true, GroupBase<CasinoFilterOption>>(
        normalizedTheme
      ),
    [normalizedTheme]
  );

  const providerLookup = useMemo(
    () =>
      providers.reduce<Record<string, GameProvider>>((acc, provider) => {
        acc[provider.id] = provider;
        return acc;
      }, {}),
    [providers]
  );

  const categoryLookup = useMemo(
    () =>
      categories.reduce<Record<string, GameCategory>>((acc, category) => {
        acc[category.id] = category;
        return acc;
      }, {}),
    [categories]
  );

  const columns = useMemo<ColumnDef<CasinoGame>[]>(() => {
    return [
      {
        id: "game",
        header: "Game",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => {
          const game = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-24 overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
                <Image
                  src={game.thumbnail}
                  alt={game.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                  priority={false}
                  unoptimized
                />
              </div>
              <div className="min-w-[10rem]">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {game.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {game.slug}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "providerId",
        header: "Provider",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => {
          const provider = providerLookup[row.original.providerId];
          return (
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {provider?.name ?? "Unknown"}
              </span>
              {provider?.isActive === false && (
                <Badge
                  color="warning"
                  variant="light"
                  className="mt-0.5 text-[10px] uppercase tracking-wide"
                >
                  Inactive Provider
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: "categories",
        header: "Categories",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            {row.original.categories.map((categoryId) => (
              <Badge
                key={categoryId}
                color="neutral"
                variant="light"
              >
                {categoryLookup[categoryId]?.name ?? "Unknown"}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "rtp",
        header: "RTP",
        cell: ({ getValue }) => (
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {getValue<number>().toFixed(1)}%
          </span>
        ),
      },
      {
        accessorKey: "volatility",
        header: "Volatility",
        cell: ({ row }) => (
          <Badge
            color="primary"
            variant="light"
            className="uppercase tracking-wide"
          >
            {row.original.volatility}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const statusColor =
            status === "active"
              ? "success"
              : status === "preview"
              ? "primary"
              : "neutral";
          const statusLabel =
            status === "active"
              ? "Active"
              : status === "preview"
              ? "Preview"
              : "Inactive";

          return (
            <Badge color={statusColor} variant="light" >
              {statusLabel}
            </Badge>
          );
        },
      },
      {
        id: "feature-tags",
        header: "Tags",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-1.5">
            {row.original.isFeatured && (
              <Badge
                color="primary"
                variant="light"
                startIcon={<Sparkles size={12} />}
                className="text-[11px]"
              >
                Featured
              </Badge>
            )}
            {row.original.hasBonusBuy && (
              <Badge
                color="success"
                variant="light"                
                startIcon={<Wand2 size={12} />}
                className="text-[11px]"
              >
                Bonus Buy
              </Badge>
            )}
            {row.original.tags.map((tag) => (
              <Badge
                key={tag}
                color="neutral"
                variant="light"
                className="text-[11px] uppercase tracking-wide"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        meta: { cellClassName: "whitespace-nowrap" },
        cell: ({ getValue }) => {
          const date = new Date(getValue<string>());
          return (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {date.toLocaleDateString()} · {date.toLocaleTimeString()}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-2"
              onClick={() => onEditGame(row.original)}
            >
              <PencilLine size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-2"
              onClick={() => onDeleteGame(row.original)}
            >
              <Trash2 size={16} className="text-red-500" />
            </Button>
          </div>
        ),
      },
    ];
  }, [categoryLookup, onDeleteGame, onEditGame, providerLookup]);

  const totalFeatured = games.filter((game) => game.isFeatured).length;
  const totalBonusBuy = games.filter((game) => game.hasBonusBuy).length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Casino Catalogue
            </h3>
            <p className="max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Curate, launch, and iterate on casino titles across providers,
              categories, and promotions from a single, insight-rich hub.
            </p>
          </div>
          <Button onClick={onCreateGame} startIcon={<Plus size={16} />}>
            Add Casino Game
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Games
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {games.length.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Across {providers.length} active providers
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/40 p-4 dark:border-gray-800 dark:bg-gray-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Featured Titles
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {totalFeatured}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Curated for lobby hero placement
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/40 p-4 dark:border-gray-800 dark:bg-gray-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Bonus Buy
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {totalBonusBuy}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              High engagement bonus rounds available
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-brand-500/5 p-4 dark:border-brand-500/20 dark:bg-brand-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-200">
              Last Sync
            </p>
            <p className="mt-2 text-2xl font-semibold text-brand-600 dark:text-brand-100">
              {new Date(filteredGames[0]?.updatedAt ?? games[0]?.updatedAt ?? Date.now()).toLocaleDateString()}
            </p>
            <p className="text-xs text-brand-500/80 dark:text-brand-200/80">
              Auto-updates from provider feeds nightly
            </p>
          </div>
        </div>

        <TableFilterToolbar<CasinoFilterOption, true, GroupBase<CasinoFilterOption>>
          selectProps={{
            options: filterGroups,
            value: selectedFilters,
            onChange: onFilterChange,
            isMulti: true,
            placeholder: "Filter games...",
          }}
          actions={{
            onSearch: onApplyFilters,
            onClear: onClearFilters,
          }}
        />
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Casino Library ({filteredGames.length})
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Search results are scoped to applied filters. Click a row to
              review metadata and deployment status.
            </p>
          </div>
        </div>

        <DataTable columns={columns} data={filteredGames} />
      </div>
    </div>
  );
}

export default CasinoGamesTab;

