"use client";

import React, { useCallback, useMemo, useState } from "react";
import Select, { type SingleValue } from "react-select";
import type { Row } from "@tanstack/react-table";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { FilterActions } from "@/components/common/FilterActions";
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

import { columns, ContentPageRow, createActionColumn } from "./columns";
import { ContentPage, contentPages } from "./data";

type FilterOption = { value: string; label: string };
type TargetOption = { value: ContentPage["target"]; label: string };

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
  { value: "Web", label: "Web" },
  { value: "Mobile", label: "Mobile" },
  { value: "Hybrid", label: "Hybrid" },
];

const mapPageToRow = (page: ContentPage): ContentPageRow => ({
  id: page.id,
  title: page.title,
  target: page.target,
  createdBy: page.createdBy,
  content: page.content,
  isActive: page.isActive,
  lastUpdated: page.lastUpdated,
});

const applyFilter = (rows: ContentPageRow[], filter: FilterOption | null) => {
  if (!filter) return rows;

  const [type, value] = filter.value.split(":");

  if (type === "target") {
    return rows.filter((row) => row.target === value);
  }

  if (type === "status") {
    const shouldBeActive = value === "Active";
    return rows.filter((row) => row.isActive === shouldBeActive);
  }

  return rows;
};

function PagesPage() {
  const { theme } = useTheme();

  const [pages, setPages] = useState<ContentPageRow[]>(() => contentPages.map(mapPageToRow));
  const [activeFilter, setActiveFilter] = useState<FilterOption | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<ContentPageRow | null>(null);
  const [targetSelection, setTargetSelection] = useState<TargetOption | null>(targetOptions[0]);
  const [formValues, setFormValues] = useState({
    title: "",
    createdBy: "",
    content: "",
    isActive: true,
  });
  const [formKey, setFormKey] = useState(0);

  const filteredRows = useMemo(() => applyFilter(pages, activeFilter), [pages, activeFilter]);

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

  const openCreateModal = () => {
    setEditingPage(null);
    setFormValues({
      title: "",
      createdBy: "",
      content: "",
      isActive: true,
    });
    setTargetSelection(targetOptions[0]);
    setFormKey((key) => key + 1);
    setIsModalOpen(true);
  };

  const handleEdit = useCallback((page: ContentPageRow) => {
    setEditingPage(page);
    setFormValues({
      title: page.title,
      createdBy: page.createdBy,
      content: page.content,
      isActive: page.isActive,
    });
    setTargetSelection(targetOptions.find((option) => option.value === page.target) ?? null);
    setFormKey((key) => key + 1);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    (pageId: string) => {
      const page = pages.find((item) => item.id === pageId);
      if (!page) return;
      const confirmed = window.confirm(`Remove "${page.title}" from published pages?`);
      if (!confirmed) return;

      const updatedPages = pages.filter((item) => item.id !== pageId);
      setPages(updatedPages);
    },
    [pages]
  );

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSearch = () => {
    setActiveFilter(selectedFilter);
  };

  const handleClear = () => {
    setSelectedFilter(null);
    setActiveFilter(null);
  };

  const handleFormSubmit = () => {
    if (!formValues.title.trim()) {
      alert("Please provide a page title.");
      return;
    }

    if (!targetSelection) {
      alert("Please choose a target platform.");
      return;
    }

    const now = new Date().toISOString();

    if (editingPage) {
      const updatedPages = pages.map((page) =>
        page.id === editingPage.id
          ? {
              ...page,
              title: formValues.title.trim(),
              createdBy: formValues.createdBy.trim() || "Admin",
              content: formValues.content.trim(),
              target: targetSelection.value,
              isActive: formValues.isActive,
              lastUpdated: now,
            }
          : page
      );
      setPages(updatedPages);
      alert("Page updated (mock).");
    } else {
      const newPage: ContentPageRow = {
        id: `page-${Date.now()}`,
        title: formValues.title.trim(),
        createdBy: formValues.createdBy.trim() || "Admin",
        content: formValues.content.trim(),
        target: targetSelection.value,
        isActive: formValues.isActive,
        lastUpdated: now,
      };

      setPages((prev) => [newPage, ...prev]);
      alert("Page created (mock).");
    }

    setIsModalOpen(false);
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
          <Button onClick={openCreateModal} className="bg-emerald-500 text-white hover:bg-emerald-600">
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="w-full max-w-[20rem]">
            <Select<FilterOption, false>
              styles={reactSelectStyles(theme)}
              options={filterOptions}
              placeholder="Filter by Target or Status"
              value={selectedFilter}
              onChange={(option: SingleValue<FilterOption>) => setSelectedFilter(option ?? null)}
              isClearable
            />
          </div>
          <FilterActions onSearch={handleSearch} onClear={handleClear} />
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/70">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">List</h3>
          </div>

          <DataTable
            columns={columnsWithActions}
            data={filteredRows}
            onRowClick={(row: Row<ContentPageRow>) => handleEdit(row.original)}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} size="lg">
        <ModalHeader>{editingPage ? "Edit Page" : "Add New Page"}</ModalHeader>
        <ModalBody>
          <Form
            key={formKey}
            onSubmit={() => {
              handleFormSubmit();
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
                    setFormValues((prev) => ({ ...prev, title: event.target.value }))
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
              <div className="md:col-span-2">
                <Label>Target</Label>
                <Select<TargetOption, false>
                  styles={reactSelectStyles(theme)}
                  options={targetOptions}
                  value={targetSelection}
                  onChange={(option) => setTargetSelection(option as TargetOption)}
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
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={handleFormSubmit}>
            {editingPage ? "Update Page" : "Save Page"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default withAuth(PagesPage);

