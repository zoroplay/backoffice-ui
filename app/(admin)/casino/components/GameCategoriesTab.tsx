"use client";

import React from "react";
import { ChevronRight, PencilLine, Plus, Trash2 } from "lucide-react";

import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import type { ColumnDef } from "@tanstack/react-table";

import type { GameCategory } from "../types";

type GameCategoriesTabProps = {
  categories: GameCategory[];
  onCreateCategory: () => void;
  onEditCategory: (category: GameCategory) => void;
  onDeleteCategory: (category: GameCategory) => void;
};

const GameCategoriesTab: React.FC<GameCategoriesTabProps> = ({
  categories,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const columns: ColumnDef<GameCategory>[] = [
    {
      accessorKey: "name",
      header: "Category",
      meta: { cellClassName: "text-left" },
      cell: ({ row }) => (
        <div className="flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-sm font-semibold uppercase tracking-wide text-brand-600 dark:bg-brand-500/15 dark:text-brand-100">
            {row.original.name.slice(0, 2)}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {row.original.name}
            </p>
            {row.original.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {row.original.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ getValue }) => (
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {getValue<number>()}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            row.original.isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300"
          }`}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ getValue }) => {
        const date = new Date(getValue<string>());
        return (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {date.toLocaleDateString()}
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
            onClick={() => onEditCategory(row.original)}
          >
            <PencilLine size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3 py-2"
            onClick={() => onDeleteCategory(row.original)}
          >
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const activeTotal = categories.filter((category) => category.isActive).length;
  const inactiveTotal = categories.length - activeTotal;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50 p-6 shadow-sm dark:border-gray-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Game Category Structure
            </h3>
            <p className="max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Shape how titles are grouped across lobby, recommendations, and
              search. Priorities influence ordering wherever categories appear.
            </p>
          </div>
          <Button onClick={onCreateCategory} startIcon={<Plus size={16} />}>
            Add Top Category
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Categories
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {categories.length}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Including lobby and feature segments
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-500/5 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-200">
              Active
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-200">
              {activeTotal}
            </p>
            <p className="text-xs text-emerald-500/80 dark:text-emerald-200/70">
              Visible across lobby endpoints
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Inactive
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {inactiveTotal}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Hidden until upcoming launches
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Category Registry
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag-and-drop re-ordering coming soon. For now, adjust priority
              values to set front-end ordering.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-500 transition hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200"
          >
            Bulk manage <ChevronRight size={16} />
          </button>
        </div>

        <DataTable columns={columns} data={categories} />
      </div>
    </div>
  );
};

export default GameCategoriesTab;

