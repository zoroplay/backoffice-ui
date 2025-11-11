"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, PencilLine, Plus, Trash2 } from "lucide-react";

import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";

import type { CasinoBanner } from "../types";

type BannersTabProps = {
  banners: CasinoBanner[];
  onCreateBanner: () => void;
  onEditBanner: (banner: CasinoBanner) => void;
  onDeleteBanner: (banner: CasinoBanner) => void;
};

const statusChip: Record<string, string> = {
  active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  inactive:
    "bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300",
};

const BannersTab: React.FC<BannersTabProps> = ({
  banners,
  onCreateBanner,
  onEditBanner,
  onDeleteBanner,
}) => {
  const columns = useMemo<ColumnDef<CasinoBanner>[]>(() => {
    return [
      {
        accessorKey: "image",
        header: "Preview",
        cell: ({ row }) => (
          <div className="relative h-16 w-28 overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
            <Image
              src={row.original.image}
              alt={row.original.title}
              fill
              sizes="112px"
              className="object-cover"
              unoptimized
            />
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {row.original.title}
            </p>
            {row.original.audience && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Audience: {row.original.audience}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "target",
        header: "Target",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {row.original.target.toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: "position",
        header: "Position",
        cell: ({ row }) => (
          <span className="inline-flex rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:bg-brand-500/20 dark:text-brand-200">
            {row.original.position}
          </span>
        ),
      },
      {
        accessorKey: "link",
        header: "Link",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <a
            href={row.original.link}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-brand-500 underline"
          >
            {row.original.link.replace(/^https?:\/\//, "")}
          </a>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              row.original.isActive ? statusChip.active : statusChip.inactive
            }`}
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        accessorKey: "lastUpdated",
        header: "Updated",
        cell: ({ row }) => {
          const date = new Date(row.original.lastUpdated);
          return (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <CalendarDays size={16} />
              {date.toLocaleDateString()}
            </div>
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
              onClick={(event) => {
                event.stopPropagation();
                onEditBanner(row.original);
              }}
            >
              <PencilLine size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-2"
              onClick={(event) => {
                event.stopPropagation();
                onDeleteBanner(row.original);
              }}
            >
              <Trash2 size={16} className="text-red-500" />
            </Button>
          </div>
        ),
      },
    ];
  }, [onDeleteBanner, onEditBanner]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50 p-6 shadow-sm dark:border-gray-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Promotional Banners
            </h3>
            <p className="max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Manage hero sliders, spotlight campaigns, and retention promos for
              casino audiences across web and mobile experiences.
            </p>
          </div>
          <Button onClick={onCreateBanner} startIcon={<Plus size={16} />}>
            Add New Banner
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Banner Library ({banners.length})
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Keep creative assets, links, and targeting in sync with marketing.
            </p>
          </div>
        </div>

        <DataTable columns={columns} data={banners} />
      </div>
    </div>
  );
};

export default BannersTab;

