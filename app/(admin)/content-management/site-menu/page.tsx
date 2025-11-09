"use client";

import React, { useId, useMemo, useState } from "react";
import Select, { type SingleValue } from "react-select";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { FilterActions } from "@/components/common/FilterActions";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Switch from "@/components/form/switch/Switch";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { withAuth } from "@/utils/withAuth";

import { columns, SiteMenuRow } from "./columns";
import { SiteMenuItem, siteMenuItems } from "./data";

type FilterOption = { value: string; label: string };

const filterOptions: { label: string; options: FilterOption[] }[] = [
  {
    label: "Placement",
    options: [
      { value: "placement:Web", label: "Web" },
      { value: "placement:Mobile", label: "Mobile" },
      { value: "placement:Hybrid", label: "Hybrid" },
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

const mapItemToRow = (item: SiteMenuItem): SiteMenuRow => ({
  id: item.id,
  title: item.title,
  placement: item.placement,
  parent: item.parent,
  url: item.url,
  order: item.order,
  isActive: item.isActive,
  openInNewTab: item.openInNewTab,
  lastUpdated: item.lastUpdated,
});

function SiteMenuPage() {
  const { theme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<FilterOption | null>(null);
  const [filteredRows, setFilteredRows] = useState<SiteMenuRow[]>(siteMenuItems.map(mapItemToRow));
  const [selectedRow, setSelectedRow] = useState<SiteMenuRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const filterSelectId = useId();
  const placementSelectId = useId();
  const parentSelectId = useId();

  const filterData = (filter: FilterOption | null) => {
    let data = siteMenuItems.slice();

    if (filter) {
      const [type, value] = filter.value.split(":");
      if (type === "placement") {
        data = data.filter((item) => item.placement === value);
      } else if (type === "status") {
        const isActive = value === "Active";
        data = data.filter((item) => item.isActive === isActive);
      }
    }

    return data.map(mapItemToRow);
  };

  const handleSearch = () => {
    setFilteredRows(filterData(selectedFilter));
  };

  const handleClear = () => {
    setSelectedFilter(null);
    setFilteredRows(siteMenuItems.map(mapItemToRow));
  };

  const summary = useMemo(() => {
    const total = filteredRows.length;
    const active = filteredRows.filter((row) => row.isActive).length;
    const newTab = filteredRows.filter((row) => row.openInNewTab).length;

    return {
      total,
      active,
      newTab,
    };
  }, [filteredRows]);

  const handleRowClick = (row: SiteMenuRow) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRow(null);
    setIsModalOpen(false);
  };

  const handleManualSave = () => {
    alert("Menu item saved! (mock)");
    handleCloseModal();
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Site Menu" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Manage navigation across platforms</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review menu entries, update hierarchy, and deploy consistent brand experiences.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 text-white hover:bg-emerald-600">
            Add Menu Item
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Menu Items</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Items</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.active}</p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Open in New Tab</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.newTab}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="w-full max-w-[20rem]">
            <Select<FilterOption, false>
              styles={reactSelectStyles(theme)}
              options={filterOptions}
              placeholder="Filter by Placement or Status"
              value={selectedFilter}
              onChange={(option: SingleValue<FilterOption>) => setSelectedFilter(option ?? null)}
              isClearable
              instanceId={`site-menu-filter-${filterSelectId}`}
            />
          </div>

          <FilterActions onSearch={handleSearch} onClear={handleClear} />
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/70">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Menu Items</h3>
          </div>

          <DataTable columns={columns} data={filteredRows} onRowClick={(row) => handleRowClick(row.original)} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="lg">
        <ModalHeader>{selectedRow ? "Menu Item Details" : "Create Menu Item"}</ModalHeader>
        <ModalBody>
          {selectedRow ? (
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Title</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">{selectedRow.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Placement</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">{selectedRow.placement}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Parent Menu</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{selectedRow.parent ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Order</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{selectedRow.order}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">URL</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{selectedRow.url}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{selectedRow.isActive ? "Active" : "Inactive"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Open in New Tab</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{selectedRow.openInNewTab ? "Yes" : "No"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    {new Date(selectedRow.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Form
              onSubmit={() => {
                handleManualSave();
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="menuTitle">Title</Label>
                  <Input id="menuTitle" placeholder="Enter menu title" />
                </div>
                <div>
                  <Label>Placement</Label>
                  <Select
                    styles={reactSelectStyles(theme)}
                    options={[
                      { value: "Web", label: "Web" },
                      { value: "Mobile", label: "Mobile" },
                      { value: "Hybrid", label: "Hybrid" },
                    ]}
                    placeholder="Select placement"
                    instanceId={`site-menu-placement-${placementSelectId}`}
                  />
                </div>
                <div>
                  <Label>Parent Menu</Label>
                  <Select
                    styles={reactSelectStyles(theme)}
                    options={[
                      { value: "Main Navigation", label: "Main Navigation" },
                      { value: "Sportsbook", label: "Sportsbook" },
                      { value: "Quick Links", label: "Quick Links" },
                      { value: "Footer Links", label: "Footer Links" },
                    ]}
                    placeholder="Select parent"
                    isClearable
                    instanceId={`site-menu-parent-${parentSelectId}`}
                  />
                </div>
                <div>
                  <Label htmlFor="menuOrder">Display Order</Label>
                  <Input id="menuOrder" type="number" min={0} placeholder="0" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="menuUrl">Destination URL</Label>
                  <Input id="menuUrl" placeholder="/path-or-external-link" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Switch label="Is Active" defaultChecked />
                <Switch label="Open in new window" defaultChecked={false}/>
              </div>
            </Form>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={handleCloseModal} type="button">
            Close
          </Button>
          {!selectedRow && (
            <Button onClick={handleManualSave} className="bg-brand-500 text-white hover:bg-brand-600">
              Save Item
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default withAuth(SiteMenuPage);

