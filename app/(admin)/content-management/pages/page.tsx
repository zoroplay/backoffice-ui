"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select, { type MultiValue } from "react-select";
import type { Row } from "@tanstack/react-table";
import type { Range } from "react-date-range";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Switch from "@/components/form/switch/Switch";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { withAuth } from "@/utils/withAuth";
import { apiEnv } from "@/lib/api/env";
import { cmsApi, CmsPageRecord } from "@/lib/api/modules/cms.service";

import { columns, ContentPageRow, createActionColumn } from "./columns";

type FilterOption = { value: string; label: string };
type TargetOption = { value: "web" | "mobile" | "hybrid"; label: string };

type FormValues = {
  title: string;
  slug: string;
  createdBy: string;
  content: string;
  isActive: boolean;
};

const filterOptions: { label: string; options: FilterOption[] }[] = [
  {
    label: "Target",
    options: [
      { value: "target:Web", label: "Web" },
      { value: "target:Mobile", label: "Mobile" },
      { value: "target:Hybrid", label: "Hybrid" },
    ],
  },
  {
    label: "Status",
    options: [
      { value: "status:Active", label: "Active" },
      { value: "status:Inactive", label: "Inactive" },
    ],
  },
];

const targetOptions: TargetOption[] = [
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "hybrid", label: "Hybrid" },
];

const defaultFormValues: FormValues = {
  title: "",
  slug: "",
  createdBy: "",
  content: "",
  isActive: true,
};

const getSafeIsoDate = (value: unknown): string => {
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return new Date().toISOString();
};

const normalizeTarget = (value: unknown): TargetOption["value"] => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "mobile") return "mobile";
  if (normalized === "hybrid") return "hybrid";
  return "web";
};

const formatTargetLabel = (target: TargetOption["value"]): string => {
  if (target === "mobile") return "Mobile";
  if (target === "hybrid") return "Hybrid";
  return "Web";
};

const mapPageToRow = (page: CmsPageRecord): ContentPageRow => {
  const normalizedTarget = normalizeTarget(page.target);

  return {
    id: String(page.id),
    title: page.title,
    target: formatTargetLabel(normalizedTarget),
    createdBy: page.createdBy || "Admin",
    content: page.content || "",
    isActive: true,
    lastUpdated: getSafeIsoDate(page.updatedAt ?? page.createdAt),
  };
};

const toPageArray = (payload: unknown): CmsPageRecord[] => {
  if (Array.isArray(payload)) {
    return payload as CmsPageRecord[];
  }

  if (payload && typeof payload === "object") {
    const root = payload as { data?: unknown };

    if (Array.isArray(root.data)) {
      return root.data as CmsPageRecord[];
    }

    if (root.data && typeof root.data === "object") {
      return Object.values(root.data as Record<string, CmsPageRecord>);
    }
  }

  return [];
};

const toSinglePage = (payload: unknown): CmsPageRecord | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as { data?: unknown };

  if (root.data && typeof root.data === "object" && !Array.isArray(root.data)) {
    return root.data as CmsPageRecord;
  }

  return payload as CmsPageRecord;
};

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const applyFilter = (rows: ContentPageRow[], filters: FilterOption[]) => {
  if (filters.length === 0) return rows;

  let filtered = rows.slice();

  filters.forEach((filter) => {
    const [type, value] = filter.value.split(":");

    if (type === "target") {
      filtered = filtered.filter((row) => row.target === value);
    } else if (type === "status") {
      const shouldBeActive = value === "Active";
      filtered = filtered.filter((row) => row.isActive === shouldBeActive);
    }
  });

  return filtered;
};

function PagesPage() {
  const { theme } = useTheme();

  const [pages, setPages] = useState<ContentPageRow[]>([]);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
  const [filteredRows, setFilteredRows] = useState<ContentPageRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPage, setEditingPage] = useState<ContentPageRow | null>(null);
  const [editingRecord, setEditingRecord] = useState<CmsPageRecord | null>(null);
  const [targetSelection, setTargetSelection] = useState<TargetOption>(targetOptions[0]);
  const [formValues, setFormValues] = useState<FormValues>(defaultFormValues);
  const [formKey, setFormKey] = useState(0);

  const summary = useMemo(() => {
    const total = filteredRows.length;
    const webCount = filteredRows.filter((row) => row.target === "Web").length;
    const mobileCount = filteredRows.filter((row) => row.target === "Mobile").length;

    return {
      total,
      webCount,
      mobileCount,
    };
  }, [filteredRows]);

  const loadPages = useCallback(async () => {
    try {
      setIsLoading(true);
      const payload = await cmsApi.getPages(Number(apiEnv.clientId));
      const records = toPageArray(payload);
      const rows = records.map(mapPageToRow);
      setPages(rows);
      setFilteredRows(applyFilter(rows, selectedFilters));
    } catch {
      toast.error("Failed to load pages");
      setPages([]);
      setFilteredRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilters]);

  useEffect(() => {
    void loadPages();
  }, [loadPages]);

  const openCreateModal = () => {
    setEditingPage(null);
    setEditingRecord(null);
    setFormValues(defaultFormValues);
    setTargetSelection(targetOptions[0]);
    setFormKey((key) => key + 1);
    setIsModalOpen(true);
  };

  const handleEdit = useCallback(async (page: ContentPageRow) => {
    try {
      setIsLoading(true);
      const payload = await cmsApi.getPageById(page.id, Number(apiEnv.clientId));
      const record = toSinglePage(payload);

      if (!record) {
        toast.error("Page details unavailable");
        return;
      }

      setEditingPage(page);
      setEditingRecord(record);
      setFormValues({
        title: record.title || page.title,
        slug: record.slug || toSlug(record.title || page.title),
        createdBy: record.createdBy || page.createdBy || "",
        content: record.content || page.content || "",
        isActive: page.isActive,
      });
      setTargetSelection(
        targetOptions.find((option) => option.value === normalizeTarget(record.target)) ??
          targetOptions[0]
      );
      setFormKey((key) => key + 1);
      setIsModalOpen(true);
    } catch {
      toast.error("Failed to load page");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = useCallback(
    async (pageId: string) => {
      const page = pages.find((item) => item.id === pageId);
      if (!page) return;
      const confirmed = window.confirm(`Remove "${page.title}" from published pages?`);
      if (!confirmed) return;

      try {
        setIsLoading(true);
        await cmsApi.deletePage(pageId, Number(apiEnv.clientId));
        toast.success("Page deleted");
        await loadPages();
      } catch {
        toast.error("Failed to delete page");
      } finally {
        setIsLoading(false);
      }
    },
    [loadPages, pages]
  );

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSearch = () => {
    setFilteredRows(applyFilter(pages, selectedFilters));
  };

  const handleClear = () => {
    setSelectedFilters([]);
    setDateRange(defaultDateRange);
    setFilteredRows(pages);
  };

  const handleFilterChange = (newValue: MultiValue<FilterOption>) => {
    if (!newValue || newValue.length === 0) {
      setSelectedFilters([]);
      return;
    }

    const filterMap = new Map<string, FilterOption>();

    Array.from(newValue).forEach((filter) => {
      const [groupType] = filter.value.split(":");
      filterMap.set(groupType, filter);
    });

    setSelectedFilters(Array.from(filterMap.values()));
  };

  const handleFormSubmit = async () => {
    const title = formValues.title.trim();
    const createdBy = formValues.createdBy.trim() || "Admin";
    const content = formValues.content.trim();
    const slug = (formValues.slug.trim() || toSlug(title)).trim();

    if (!title) {
      toast.error("Please provide a page title.");
      return;
    }

    if (!slug) {
      toast.error("Please provide a valid slug.");
      return;
    }

    try {
      setIsLoading(true);

      if (editingPage && editingRecord) {
        await cmsApi.updatePage({
          id: editingRecord.id,
          clientId: Number(apiEnv.clientId),
          title,
          url: editingRecord.url ?? null,
          target: targetSelection.value,
          content,
          createdBy,
          createdAt: editingRecord.createdAt ?? {},
          updatedAt: editingRecord.updatedAt ?? {},
          slug,
        });
        toast.success("Page updated successfully");
      } else {
        await cmsApi.createPage({
          title,
          slug,
          content,
          target: targetSelection.value,
          clientId: Number(apiEnv.clientId),
          createdBy,
        });
        toast.success("Page created successfully");
      }

      setIsModalOpen(false);
      await loadPages();
    } catch {
      toast.error(editingPage ? "Failed to update page" : "Failed to create page");
    } finally {
      setIsLoading(false);
    }
  };

  const columnsWithActions = useMemo(
    () => [...columns, createActionColumn({ onEdit: handleEdit, onDelete: handleDelete })],
    [handleDelete, handleEdit]
  );

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Pages" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Static Pages</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Publish compliance updates, onboarding content, and campaign landing pages in one place.
            </p>
          </div>
          <Button onClick={openCreateModal} className="bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-500 dark:text-white dark:hover:bg-brand-600">
            Add New Page
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Pages</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Web Target</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.webCount}</p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Mobile Target</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.mobileCount}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <TableFilterToolbar<FilterOption, true>
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          actions={{
            onSearch: handleSearch,
            onClear: handleClear,
          }}
          selectProps={{
            containerClassName: "max-w-[22rem]",
            options: filterOptions,
            placeholder: "Filter Options",
            value: selectedFilters,
            onChange: handleFilterChange,
            isClearable: true,
            isMulti: true,
          }}
        />

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/70">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">List</h3>
          </div>

          <DataTable
            columns={columnsWithActions}
            data={filteredRows}
            onRowClick={(row: Row<ContentPageRow>) => {
              void handleEdit(row.original);
            }}
            loading={isLoading}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} size="lg">
        <ModalHeader>{editingPage ? "Edit Page" : "Add New Page"}</ModalHeader>
        <ModalBody>
          <Form
            key={formKey}
            onSubmit={() => {
              void handleFormSubmit();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="pageTitle">Title</Label>
                <Input
                  id="pageTitle"
                  placeholder="Enter page title"
                  defaultValue={formValues.title}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      title: event.target.value,
                      slug: prev.slug ? prev.slug : toSlug(event.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="pageSlug">Slug</Label>
                <Input
                  id="pageSlug"
                  placeholder="page-slug"
                  defaultValue={formValues.slug}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, slug: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="pageAuthor">Created By</Label>
                <Input
                  id="pageAuthor"
                  placeholder="Author name"
                  defaultValue={formValues.createdBy}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, createdBy: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Target</Label>
                <Select<TargetOption, false>
                  styles={reactSelectStyles(theme)}
                  options={targetOptions}
                  value={targetSelection}
                  onChange={(option) => {
                    if (!option) return;
                    setTargetSelection(option);
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Page Content</Label>
                <TextArea
                  placeholder="Enter content..."
                  rows={4}
                  value={formValues.content}
                  onChange={(value) =>
                    setFormValues((prev) => ({
                      ...prev,
                      content: value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Switch
                key={`active-${formKey}`}
                label="Is Active"
                defaultChecked={formValues.isActive}
                onChange={(checked) =>
                  setFormValues((prev) => ({
                    ...prev,
                    isActive: checked,
                  }))
                }
              />
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={closeModal} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={() => void handleFormSubmit()} disabled={isLoading}>
            {isLoading ? "Saving..." : editingPage ? "Update Page" : "Save Page"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default withAuth(PagesPage);
