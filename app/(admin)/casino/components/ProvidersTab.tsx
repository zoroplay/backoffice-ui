"use client";

import React, { useMemo } from "react";
import { Building2, Globe, PencilLine, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";

import type { GameProvider } from "../types";

type ProvidersTabProps = {
  providers: GameProvider[];
  onCreateProvider: () => void;
  onEditProvider: (provider: GameProvider) => void;
  onToggleProvider: (provider: GameProvider) => void;
  onDeleteProvider: (provider: GameProvider) => void;
};

const ProvidersTab: React.FC<ProvidersTabProps> = ({
  providers,
  onCreateProvider,
  onEditProvider,
  onToggleProvider,
  onDeleteProvider,
}) => {
  const totalActive = providers.filter((provider) => provider.isActive).length;

  const columns = useMemo<ColumnDef<GameProvider>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "Provider",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {row.original.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {row.original.slug}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "totalGames",
        header: "Games",
        cell: ({ getValue }) => (
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {getValue<number>().toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "foundedYear",
        header: "Founded",
        cell: ({ getValue }) => {
          const value = getValue<number | undefined>();
          return (
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {value ?? "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "headquarters",
        header: "HQ",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {row.original.headquarters ?? "—"}
          </div>
        ),
      },
      {
        accessorKey: "website",
        header: "Website",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) =>
          row.original.website ? (
            <a
              href={row.original.website}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-brand-500 underline"
            >
              Visit site
            </a>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
          ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            color={row.original.isActive ? "success" : "neutral"}
            variant="light"
            size="sm"
            className="text-xs font-semibold"
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
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
              onClick={() => onEditProvider(row.original)}
            >
              <PencilLine size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`px-3 py-2 transition-colors ${
                row.original.isActive
                  ? "dark:bg-gray-800 dark:text-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-500/20 dark:hover:text-red-400 dark:hover:border-red-500/30"
                  : "dark:bg-gray-800 dark:text-gray-100 hover:bg-green-50 hover:text-green-600 hover:border-green-300 dark:hover:bg-green-500/20 dark:hover:text-green-400 dark:hover:border-green-500/30"
              }`}
              onClick={() => onToggleProvider(row.original)}
            >
              {row.original.isActive ? (
                <PowerOff size={16} />
              ) : (
                <Power size={16} />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-2"
              onClick={() => onDeleteProvider(row.original)}
            >
              <Trash2 size={16} className="text-red-500" />
            </Button>
          </div>
        ),
      },
    ];
  }, [onDeleteProvider, onEditProvider, onToggleProvider]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Provider Network
            </h3>
            <p className="max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Activate, evaluate, and prioritise integrations with premium
              studios across live dealer, slots, and instant win verticals.
            </p>
          </div>
          <Button onClick={onCreateProvider} startIcon={<Plus size={16} />}>
            Add Provider
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Providers
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {providers.length}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Contracts managed via procurement
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-500/5 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-200">
              Active Integrations
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-200">
              {totalActive}
            </p>
            <p className="text-xs text-emerald-500/70 dark:text-emerald-200/70">
              Available in lobby & API catalogue
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Global Coverage
              </p>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Malta, Sweden, Czech Republic, and more.
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-brand-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Marketplace Feed
              </p>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Automatic nightly feed checks for new titles.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Provider Directory
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Toggle availability without losing historical performance data.
            </p>
          </div>
        </div>

        <DataTable columns={columns} data={providers} />
      </div>
    </div>
  );
};

export default ProvidersTab;

