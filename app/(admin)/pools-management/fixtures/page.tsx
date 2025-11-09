"use client";

import React, { useMemo, useState } from "react";
import Select, { type SingleValue } from "react-select";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Form from "@/components/form/Form";
import Button from "@/components/ui/button/Button";
import { DataTable } from "@/components/tables/DataTable";
import { FilterActions } from "@/components/common/FilterActions";
import { DateRangeFilter, defaultDateRange } from "@/components/common/DateRangeFilter";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { withAuth } from "@/utils/withAuth";

import { columns, PoolFixtureRow } from "./columns";
import { poolFixtures, PoolFixture } from "./data";

type FilterOption = { value: string; label: string };

const filterOptions: { label: string; options: FilterOption[] }[] = [
  {
    label: "Division",
    options: [
      { value: "Premier League", label: "Premier League" },
      { value: "La Liga", label: "La Liga" },
      { value: "Serie A", label: "Serie A" },
      { value: "Bundesliga", label: "Bundesliga" },
      { value: "Ligue 1", label: "Ligue 1" },
      { value: "Championship", label: "Championship" },
      { value: "Eredivisie", label: "Eredivisie" },
      { value: "MLS", label: "MLS" },
      { value: "Primeira Liga", label: "Primeira Liga" },
      { value: "Scottish Premiership", label: "Scottish Premiership" },
    ],
  },
  {
    label: "Status",
    options: [
      { value: "Pending", label: "Pending" },
      { value: "Live", label: "Live" },
      { value: "Settled", label: "Settled" },
    ],
  },
];

const mapFixtureToRow = (fixture: PoolFixture): PoolFixtureRow => ({
  id: fixture.id,
  serial: fixture.serial,
  division: fixture.division,
  eventId: fixture.eventId,
  eventName: fixture.eventName,
  market: fixture.market,
  oddsHome: fixture.odds.home,
  oddsDraw: fixture.odds.draw,
  oddsAway: fixture.odds.away,
  date: fixture.date,
  time: fixture.time,
  scores: fixture.scores,
  result: fixture.result,
  status: fixture.status,
});

function FixturesPage() {
  const { theme } = useTheme();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filteredRows, setFilteredRows] = useState<PoolFixtureRow[]>(poolFixtures.map(mapFixtureToRow));
  const [selectedFilter, setSelectedFilter] = useState<FilterOption | null>(null);
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [divisionOption, setDivisionOption] = useState<FilterOption | null>(null);
  const [roundOption, setRoundOption] = useState<FilterOption | null>(null);
  const [uploadNote, setUploadNote] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  const divisions = useMemo(() => {
    const uniqueDivisions = new Set<string>();
    poolFixtures.forEach((fixture) => uniqueDivisions.add(fixture.division));
    return Array.from(uniqueDivisions);
  }, []);

  const handleFilter = () => {
    let rows = poolFixtures.slice();

    if (selectedFilter) {
      if (divisions.includes(selectedFilter.value)) {
        rows = rows.filter((fixture) => fixture.division === selectedFilter.value);
      } else {
        rows = rows.filter((fixture) => fixture.status === selectedFilter.value);
      }
    }

    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      rows = rows.filter((fixture) => {
        const fixtureDate = new Date(fixture.date);
        return fixtureDate >= start && fixtureDate <= end;
      });
    }

    setFilteredRows(rows.map(mapFixtureToRow));
  };

  const handleClear = () => {
    setSelectedFilter(null);
    setDateRange(defaultDateRange);
    setFilteredRows(poolFixtures.map(mapFixtureToRow));
  };

  const summary = useMemo(() => {
    const total = filteredRows.length;
    const pending = filteredRows.filter((row) => row.status === "Pending").length;
    const settled = filteredRows.filter((row) => row.status === "Settled").length;
    return {
      total,
      pending,
      settled,
    };
  }, [filteredRows]);

  const handleModalClose = () => {
    setIsUploadModalOpen(false);
    setDivisionOption(null);
    setRoundOption(null);
    setUploadNote("");
    setSelectedFileName("");
  };

  const handleUploadSubmit = () => {
    handleModalClose();
    alert("Pool results uploaded successfully! (mock)");
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Pool Fixtures" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pool Fixture Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monitor your scheduled fixtures, their odds, and outcomes from a single workspace.
            </p>
          </div>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-brand-500 text-white hover:bg-brand-600"
          >
            Upload Results
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Fixtures</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Fixtures</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.pending}</p>
          </div>
          <div className="rounded-xl border border-dashed border- gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Settled Fixtures</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.settled}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <DateRangeFilter range={dateRange} onChange={(range) => setDateRange(range)} />
            <div className="w-[18rem]">
              <Select<FilterOption, false>
                styles={reactSelectStyles(theme)}
                options={filterOptions}
                placeholder="Filter by Division or Status"
                value={selectedFilter}
                onChange={(value: SingleValue<FilterOption>) => setSelectedFilter(value ?? null)}
                isClearable
              />
            </div>
          </div>

          <FilterActions onSearch={handleFilter} onClear={handleClear} />
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/70">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Fixtures</h3>
          </div>
          <DataTable columns={columns} data={filteredRows} />
        </div>
      </div>

      <Modal isOpen={isUploadModalOpen} onClose={handleModalClose} size="lg">
        <ModalHeader>Upload Pool Results</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              handleUploadSubmit();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Division</label>
                <Select<FilterOption, false>
                  styles={reactSelectStyles(theme)}
                  options={divisions.map((division) => ({ value: division, label: division }))}
                  placeholder="Select division"
                  value={divisionOption}
                  onChange={(value: SingleValue<FilterOption>) => setDivisionOption(value ?? null)}
                  isClearable
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Round</label>
                <Select<FilterOption, false>
                  styles={reactSelectStyles(theme)}
                  options={[
                    { value: "round-15", label: "Round 15" },
                    { value: "round-16", label: "Round 16" },
                    { value: "round-17", label: "Round 17" },
                  ]}
                  placeholder="Select round"
                  value={roundOption}
                  onChange={(value: SingleValue<FilterOption>) => setRoundOption(value ?? null)}
                  isClearable
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Spreadsheet</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500 transition hover:border-brand-400 hover:bg-white hover:text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                <span className="font-medium text-gray-700 dark:text-gray-200">Drag & drop to upload</span>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">or click to browse your files</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setSelectedFileName(file ? file.name : "");
                  }}
                />
              </label>
              {selectedFileName && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Selected file: <span className="font-medium text-gray-700 dark:text-gray-200">{selectedFileName}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <textarea
                rows={4}
                placeholder="Add any internal notes for this upload (optional)"
                value={uploadNote}
                onChange={(event) => setUploadNote(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-theme-xs outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              />
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={handleModalClose} type="button">
            Cancel
          </Button>
          <Button
            onClick={handleUploadSubmit}
            className="bg-brand-500 text-white hover:bg-brand-600"
            type="button"
          >
            Upload Results
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default withAuth(FixturesPage);

