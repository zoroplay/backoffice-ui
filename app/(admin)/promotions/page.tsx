"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import Select, {
  type ActionMeta,
  type GroupBase,
  type MultiValue,
  type StylesConfig,
} from "react-select";
import { CalendarRange, Filter, PencilLine, Plus, RefreshCw, Trash2 } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { FilterActions } from "@/components/common/FilterActions";
import { DataTable } from "@/components/tables/DataTable";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { withAuth } from "@/utils/withAuth";

import PromotionFormModal from "./components/PromotionFormModal";
import {
  promotionPlatforms,
  promotionsSeed,
  promotionStatuses,
  promotionTypes,
} from "./data";
import type { Promotion, PromotionFormValues } from "./types";

type FilterGroupKey = "platform" | "status" | "type";

type PromotionFilterOption = {
  label: string;
  value: string;
  group: FilterGroupKey;
};

type PromotionFilterGroup = {
  label: string;
  options: PromotionFilterOption[];
};

const statusBadgeClass: Record<string, string> = {
  draft:
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border border-dashed border-gray-300 dark:border-gray-700",
  scheduled:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200",
  active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  expired:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
};

function toFormValues(promotion: Promotion): PromotionFormValues {
  const { id, ...rest } = promotion;
  return rest;
}

function PromotionsPage() {
  const { theme } = useTheme();
  const normalizedTheme =
    theme === "light" || theme === "dark" ? theme : undefined;

  const selectStyles = useMemo<
    StylesConfig<PromotionFilterOption, true, GroupBase<PromotionFilterOption>>
  >(
    () =>
      reactSelectStyles<
        PromotionFilterOption,
        true,
        GroupBase<PromotionFilterOption>
      >(normalizedTheme),
    [normalizedTheme]
  );

  const filterOptions = useMemo<PromotionFilterGroup[]>(() => {
    return [
      {
        label: "Status",
        options: promotionStatuses.map((status) => ({
          label: status.label,
          value: status.value,
          group: "status" as const,
        })),
      },
      {
        label: "Platform",
        options: promotionPlatforms.map((platform) => ({
          label: platform.label,
          value: platform.value,
          group: "platform" as const,
        })),
      },
      {
        label: "Type",
        options: promotionTypes.map((type) => ({
          label: type,
          value: type,
          group: "type" as const,
        })),
      },
    ];
  }, []);

  const [promotions, setPromotions] = useState<Promotion[]>(promotionsSeed);
  const [selectedFilters, setSelectedFilters] = useState<
    PromotionFilterOption[]
  >([]);
  const [appliedFilters, setAppliedFilters] = useState<
    PromotionFilterOption[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );

  const handleFilterChange = (
    options: MultiValue<PromotionFilterOption>,
    _meta: ActionMeta<PromotionFilterOption>
  ) => {
    setSelectedFilters([...options]);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(selectedFilters);
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
    setAppliedFilters([]);
  };

  const handleCreateClick = () => {
    setEditingPromotion(null);
    setIsModalOpen(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsModalOpen(true);
  };

  const handleDeletePromotion = (promotion: Promotion) => {
    const confirmed = window.confirm(
      `Delete promotion "${promotion.title}"?`
    );
    if (!confirmed) return;
    setPromotions((prev) => prev.filter((item) => item.id !== promotion.id));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPromotion(null);
  };

  const handlePromotionSubmit = (values: PromotionFormValues) => {
    if (editingPromotion) {
      setPromotions((prev) =>
        prev.map((promotion) =>
          promotion.id === editingPromotion.id
            ? { ...promotion, ...values }
            : promotion
        )
      );
    } else {
      const newPromotion: Promotion = {
        id: `promotion-${Date.now()}`,
        ...values,
      };
      setPromotions((prev) => [newPromotion, ...prev]);
    }

    setIsModalOpen(false);
    setEditingPromotion(null);
  };

  const filteredPromotions = useMemo(() => {
    return promotions.filter((promotion) =>
      appliedFilters.every((filter) => {
        if (filter.group === "status") {
          return promotion.status === filter.value;
        }
        if (filter.group === "platform") {
          return promotion.platform === filter.value;
        }
        if (filter.group === "type") {
          return promotion.type === filter.value;
        }
        return true;
      })
    );
  }, [appliedFilters, promotions]);

  const summary = useMemo(() => {
    const total = promotions.length;
    const active = promotions.filter((promo) => promo.status === "active")
      .length;
    const scheduled = promotions.filter(
      (promo) => promo.status === "scheduled"
    ).length;
    const expired = promotions.filter((promo) => promo.status === "expired")
      .length;

    return { total, active, scheduled, expired };
  }, [promotions]);

  const columns = useMemo<ColumnDef<Promotion>[]>(() => {
    return [
      {
        accessorKey: "image",
        header: "Creative",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
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
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <div className="space-y-1 text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {row.original.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 max-w-[18rem]">
              {row.original.description}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:bg-brand-500/20 dark:text-brand-200">
            {row.original.type}
          </span>
        ),
      },
      {
        accessorKey: "platform",
        header: "Platform",
        cell: ({ row }) => {
          const platformLabel =
            promotionPlatforms.find(
              (platform) => platform.value === row.original.platform
            )?.label ?? row.original.platform;
          return (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {platformLabel}
            </span>
          );
        },
      },
      {
        accessorKey: "targetUrl",
        header: "Target URL",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <a
            href={row.original.targetUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-brand-500 underline decoration-dotted decoration-brand-300 hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200"
          >
            {row.original.targetUrl}
          </a>
        ),
      },
      {
        id: "schedule",
        header: "Schedule",
        cell: ({ row }) => (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium text-gray-600 dark:text-gray-300">
              {row.original.startDate || "Immediate"}
            </p>
            <p>{row.original.endDate || "No End"}</p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
              statusBadgeClass[row.original.status] ?? statusBadgeClass.draft
            )}
          >
            {row.original.status.toUpperCase()}
          </span>
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
              onClick={() => handleEditPromotion(row.original)}
            >
              <PencilLine size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-2"
              onClick={() => handleDeletePromotion(row.original)}
            >
              <Trash2 size={16} className="text-red-500" />
            </Button>
          </div>
        ),
      },
    ];
  }, [handleDeletePromotion, handleEditPromotion]);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Content · Promotions" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Promotion Campaigns
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage landing creatives and promotional journeys across web and mobile.
            </p>
          </div>
          <Button startIcon={<Plus size={16} />} onClick={handleCreateClick}>
            New Promotion
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Campaigns
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {summary.total}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Includes live, scheduled, and draft items
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-500/5 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-200">
              <RefreshCw className="h-4 w-4" />
              Active
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-200">
              {summary.active}
            </p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-200/70">
              Currently visible to players
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-500/5 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/10">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-200">
              <CalendarRange className="h-4 w-4" />
              Scheduled
            </p>
            <p className="mt-2 text-2xl font-semibold text-indigo-600 dark:text-indigo-200">
              {summary.scheduled}
            </p>
            <p className="text-xs text-indigo-600/70 dark:text-indigo-200/70">
              Automatically activates on future dates
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-500/5 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-200">
              Expired
            </p>
            <p className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-200">
              {summary.expired}
            </p>
            <p className="text-xs text-rose-600/70 dark:text-rose-200/70">
              Consider archiving or refreshing
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md flex w-full items-center gap-4 rounded-xl border border-dashed border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Select<PromotionFilterOption, true>
              isMulti
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              options={filterOptions}
              value={selectedFilters}
              onChange={handleFilterChange}
              styles={selectStyles}
              placeholder="Filter by status, platform, or type"
            />
          </div>
          <FilterActions
            onSearch={handleApplyFilters}
            onClear={handleClearFilters}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Promotions Library ({filteredPromotions.length})
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Keep creative assets, copy, and scheduling aligned across channels.
            </p>
          </div>
          <Badge variant="light" color="info" size="sm">
            {promotions.length} total records
          </Badge>
        </div>
        <DataTable columns={columns} data={filteredPromotions} />
      </div>

      <PromotionFormModal
        isOpen={isModalOpen}
        initialValues={editingPromotion ? toFormValues(editingPromotion) : undefined}
        onClose={handleModalClose}
        onSubmit={handlePromotionSubmit}
      />
    </div>
  );
}

export default withAuth(PromotionsPage);

