"use client";

import React from "react";
import Select, { type MultiValue } from "react-select";

import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { reactSelectStyles } from "@/utils/reactSelectStyles";

import type { ColumnDef } from "@tanstack/react-table";
import type { GroupBase } from "react-select";
import type { SelectOption } from "../data";
import type { TournamentMarketRow } from "../columns";

type MarketSettingsTabProps = {
  theme: string;
  filterOptions: GroupBase<SelectOption>[];
  selections: SelectOption[];
  onSelectionChange: (value: MultiValue<SelectOption>) => void;
  availableMarkets: SelectOption[];
  selectedTournament: string | null;
  onOpenAssignmentModal: () => void;
  columns: ColumnDef<TournamentMarketRow>[];
  rows: TournamentMarketRow[];
};

export const MarketSettingsTab: React.FC<MarketSettingsTabProps> = ({
  theme,
  filterOptions,
  selections,
  onSelectionChange,
  availableMarkets,
  selectedTournament,
  onOpenAssignmentModal,
  columns,
  rows,
}) => {
  const hasTournament = Boolean(selectedTournament);
  const tableData =
    rows.length > 0
      ? rows
      : [
          {
            id: "placeholder-1",
            name: "Placeholder Market - Update Limits",
            status: "Inactive",
            action: "Click edit to configure",
          },
          {
            id: "placeholder-2",
            name: "Add Popular Bet Builder",
            status: "Active",
            action: "Ready to assign",
          },
        ];

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap gap-4">
        <div className="w-full max-w-3xl">
          <Select<SelectOption, true>
            styles={reactSelectStyles(theme)}
            options={filterOptions}
            placeholder="Select sport, category, tournament"
            isMulti
            closeMenuOnSelect={false}
            value={selections}
            onChange={onSelectionChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Available Markets</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose markets to assign to tournaments.
              </p>
            </div>
            <Button
              size="sm"
              onClick={onOpenAssignmentModal}
              className="bg-brand-500 text-white hover:bg-brand-600"
              disabled={!hasTournament}
            >
              Assign Markets
            </Button>
          </div>
          <div className="mt-4 max-h-[280px] space-y-2 overflow-y-auto rounded-lg border border-dashed border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 custom-scrollbar">
            {availableMarkets.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a sport to view available markets.
              </p>
            ) : (
              availableMarkets.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-brand-500 hover:bg-brand-50 dark:border-gray-800 dark:text-gray-200 dark:hover:border-brand-400 dark:hover:bg-gray-800/70"
                >
                  <span>{option.label}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Tournament Markets</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Remove markets you no longer want offered in this tournament.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <DataTable columns={columns} data={tableData} />
            {!hasTournament && (
              <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Select a tournament to manage its markets.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

