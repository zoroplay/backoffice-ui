"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { withAuth } from "@/utils/withAuth";

import { columns, createActionColumn, type BannerRow } from "./columns";
import {
  bannerId,
  bannerPosition,
  bannerTarget,
  bannerTitle,
  bannerType,
  deleteBanner,
  fetchBanners,
  type BannerRecord,
} from "./api";

function mapBannerToRow(banner: BannerRecord): BannerRow {
  return {
    id: bannerId(banner),
    title: bannerTitle(banner),
    bannerType: bannerType(banner),
    target: bannerTarget(banner),
    position: bannerPosition(banner),
    link: String(banner.link ?? ""),
    image: String(banner.image ?? ""),
  };
}

function BannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const summary = useMemo(() => {
    const popupCount = banners.filter((banner) => banner.position === "popup").length;
    const sliderCount = banners.filter((banner) => banner.position === "slider").length;

    return {
      total: banners.length,
      popupCount,
      sliderCount,
    };
  }, [banners]);

  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchBanners();
      setBanners(response.map(mapBannerToRow));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load banners");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  const handleEdit = useCallback(
    (banner: BannerRow) => {
      router.push(`/content-management/banners/${encodeURIComponent(banner.id)}`);
    },
    [router]
  );

  const handleDelete = useCallback(
    async (bannerIdValue: string) => {
      const banner = banners.find((item) => item.id === bannerIdValue);
      if (!banner) return;

      const confirmed = window.confirm("You will not be able to recover this item");
      if (!confirmed) return;

      setDeletingId(bannerIdValue);
      try {
        await deleteBanner(bannerIdValue);
        toast.success("Item has been removed");
        setBanners((current) => current.filter((item) => item.id !== bannerIdValue));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to delete banner");
      } finally {
        setDeletingId("");
      }
    },
    [banners]
  );

  const columnsWithActions = useMemo(
    () => [
      ...columns,
      createActionColumn({
        onEdit: handleEdit,
        onDelete: handleDelete,
        deletingId,
      }),
    ],
    [deletingId, handleDelete, handleEdit]
  );

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Site Banners" />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">List</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage site banners for web and mobile placements.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadBanners()}
              disabled={loading}
              startIcon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
            >
              Refresh
            </Button>
            <Link
              href="/content-management/banners/add-new"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-success-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-success-600"
            >
              <Plus className="h-4 w-4" />
              Add New Banner
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Banners</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{summary.total}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Popup</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{summary.popupCount}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Slider</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{summary.sliderCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {loading ? (
          <div className="rounded-lg border border-gray-100 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            Loading Please wait....
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-lg border border-gray-100 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            No banners have been created
          </div>
        ) : (
          <DataTable
            columns={columnsWithActions}
            data={banners}
            onRowClick={(row) => handleEdit(row.original)}
          />
        )}
      </section>
    </div>
  );
}

export default withAuth(BannersPage);
