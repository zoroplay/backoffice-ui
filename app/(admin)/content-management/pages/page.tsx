"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { withAuth } from "@/utils/withAuth";

import { columns, createActionColumn, type ContentPageRow } from "./columns";
import {
  deleteContentPage,
  fetchContentPages,
  pageCreatedBy,
  pageId,
  pageTarget,
  pageTitle,
  type ContentPageRecord,
} from "./api";

function mapPageToRow(page: ContentPageRecord): ContentPageRow {
  return {
    id: pageId(page),
    title: pageTitle(page),
    target: pageTarget(page),
    createdBy: pageCreatedBy(page),
  };
}

function PagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<ContentPageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const summary = useMemo(() => {
    const webCount = pages.filter((page) => page.target === "web").length;
    const mobileCount = pages.filter((page) => page.target === "mobile").length;

    return {
      total: pages.length,
      webCount,
      mobileCount,
    };
  }, [pages]);

  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchContentPages();
      setPages(response.map(mapPageToRow));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load pages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPages();
  }, [loadPages]);

  const handleEdit = useCallback(
    (page: ContentPageRow) => {
      router.push(`/content-management/pages/${encodeURIComponent(page.id)}`);
    },
    [router]
  );

  const handleDelete = useCallback(
    async (pageIdValue: string) => {
      const page = pages.find((item) => item.id === pageIdValue);
      if (!page) return;

      const confirmed = window.confirm(`Delete "${page.title}"?`);
      if (!confirmed) return;

      setDeletingId(pageIdValue);
      try {
        await deleteContentPage(pageIdValue);
        toast.success("Page has been removed");
        await loadPages();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to delete page");
      } finally {
        setDeletingId("");
      }
    },
    [loadPages, pages]
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
      <PageBreadcrumb pageTitle="Pages" />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">List</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage CMS pages and their web or mobile target.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadPages()}
              disabled={loading}
              startIcon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
            >
              Refresh
            </Button>
            <Link
              href="/content-management/pages/add-new"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-success-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-success-600"
            >
              <Plus className="h-4 w-4" />
              Add New Page
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Pages</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{summary.total}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Web Target</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{summary.webCount}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Mobile Target</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{summary.mobileCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {loading ? (
          <div className="rounded-lg border border-gray-100 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            Loading Please wait....
          </div>
        ) : pages.length === 0 ? (
          <div className="rounded-lg border border-gray-100 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
            No record found
          </div>
        ) : (
          <DataTable
            columns={columnsWithActions}
            data={pages}
            onRowClick={(row) => handleEdit(row.original)}
          />
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Badge variant="light" color="info" size="sm">Web</Badge>
          <Badge variant="light" color="warning" size="sm">Mobile</Badge>
        </div>
      </section>
    </div>
  );
}

export default withAuth(PagesPage);
