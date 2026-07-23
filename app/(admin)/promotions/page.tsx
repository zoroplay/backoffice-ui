"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { PencilLine, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { withAuth } from "@/utils/withAuth";

import {
  deletePromotion,
  fetchPromotions,
  promotionContent,
  promotionEndDate,
  promotionId,
  promotionImage,
  promotionStartDate,
  promotionStatus,
  promotionTargetUrl,
  promotionTitle,
  promotionType,
  type PromotionRecord,
} from "./api";
import type { PromotionStatus } from "./types";

type PromotionRow = {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  type: string;
  targetUrl: string;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
};

function mapPromotionToRow(promotion: PromotionRecord): PromotionRow {
  return {
    id: promotionId(promotion),
    title: promotionTitle(promotion),
    content: promotionContent(promotion),
    imageUrl: promotionImage(promotion),
    type: promotionType(promotion),
    targetUrl: promotionTargetUrl(promotion),
    startDate: promotionStartDate(promotion),
    endDate: promotionEndDate(promotion),
    status: promotionStatus(promotion),
  };
}

function PromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<PromotionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const summary = useMemo(() => {
    const active = promotions.filter((promotion) => promotion.status === "active").length;
    const scheduled = promotions.filter((promotion) => promotion.status === "scheduled").length;
    const expired = promotions.filter((promotion) => promotion.status === "expired").length;

    return {
      total: promotions.length,
      active,
      scheduled,
      expired,
    };
  }, [promotions]);

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchPromotions();
      setPromotions(response.map(mapPromotionToRow));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load promotions");
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPromotions();
  }, [loadPromotions]);

  const handleEdit = useCallback(
    (promotionIdValue: string) => {
      router.push(`/promotions/${encodeURIComponent(promotionIdValue)}`);
    },
    [router]
  );

  const handleDelete = useCallback(
    async (promotionIdValue: string) => {
      const promotion = promotions.find((item) => item.id === promotionIdValue);
      if (!promotion) return;

      const confirmed = window.confirm(`Delete promotion "${promotion.title}"?`);
      if (!confirmed) return;

      setDeletingId(promotionIdValue);
      try {
        await deletePromotion(promotionIdValue);
        toast.success("Promotion has been removed");
        setPromotions((current) => current.filter((item) => item.id !== promotionIdValue));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to delete promotion");
      } finally {
        setDeletingId("");
      }
    },
    [promotions]
  );

  const columns = useMemo<ColumnDef<PromotionRow>[]>(
    () => [
      {
        accessorKey: "imageUrl",
        header: "Image",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            {row.original.imageUrl ? (
              <img
                src={row.original.imageUrl}
                alt={row.original.title}
                className="h-16 w-28 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-16 w-28 items-center justify-center rounded-md border border-dashed border-gray-300 text-xs text-gray-500 dark:border-gray-700">
                No image
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <div className="space-y-1 text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {row.original.title}
            </p>
            {row.original.content ? (
              <p className="max-w-[20rem] line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                {row.original.content}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge color="primary" variant="light" size="sm" className="text-xs font-semibold uppercase">
            {row.original.type || "-"}
          </Badge>
        ),
      },
      {
        accessorKey: "targetUrl",
        header: "Target URL",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          row.original.targetUrl ? (
            <a
              href={row.original.targetUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="text-sm text-brand-500 underline decoration-dotted underline-offset-2"
            >
              {row.original.targetUrl}
            </a>
          ) : (
            "-"
          )
        ),
      },
      {
        id: "schedule",
        header: "Schedule",
        cell: ({ row }) => (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>{row.original.startDate || "-"}</p>
            <p>{row.original.endDate || "-"}</p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const colorMap: Record<PromotionStatus, "primary" | "success" | "error"> = {
            scheduled: "primary",
            active: "success",
            expired: "error",
          };

          return (
            <Badge color={colorMap[row.original.status]} variant="light" size="sm" className="text-xs font-semibold uppercase">
              {row.original.status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                handleEdit(row.original.id);
              }}
            >
              <PencilLine className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={deletingId === row.original.id}
              onClick={(event) => {
                event.stopPropagation();
                void handleDelete(row.original.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ),
      },
    ],
    [deletingId, handleDelete, handleEdit]
  );

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Promotions" />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">List</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage promotional pages, creatives, and outbound target URLs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadPromotions()}
              disabled={loading}
              startIcon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
            >
              Refresh
            </Button>
            <Link
              href="/promotions/add-new"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-success-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-success-600"
            >
              <Plus className="h-4 w-4" />
              Add New Page
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <SummaryCard label="Total" value={summary.total} />
          <SummaryCard label="Active" value={summary.active} />
          <SummaryCard label="Scheduled" value={summary.scheduled} />
          <SummaryCard label="Expired" value={summary.expired} />
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {loading ? (
          <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading Please wait....
          </div>
        ) : promotions.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            No record found
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={promotions}
            onRowClick={(row) => handleEdit(row.original.id)}
          />
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

export default withAuth(PromotionsPage);
