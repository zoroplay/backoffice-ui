"use client";

import React from "react";
import Select, { type SingleValue } from "react-select";

import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { reactSelectStyles } from "@/utils/reactSelectStyles";

import type { SelectOption } from "../data";
import type { MarketGroupRow } from "../columns";
import type { ColumnDef } from "@tanstack/react-table";

type MarketGroupingTabProps = {
  theme: string;
  sportsOptions: SelectOption[];
  groupFilter: SelectOption | null;
  onGroupFilterChange: (option: SingleValue<SelectOption>) => void;
  sportSummary: {
    total: number;
    markets: number;
  };
  groupColumns: ColumnDef<MarketGroupRow>[];
  groupedRows: MarketGroupRow[];
  onRowClick: (row: MarketGroupRow) => void;
  onCreateGroup: () => void;
};

export const MarketGroupingTab: React.FC<MarketGroupingTabProps> = ({
  theme,
  sportsOptions,
  groupFilter,
  onGroupFilterChange,
  sportSummary,
  groupColumns,
  groupedRows,
  onRowClick,
  onCreateGroup,
}) => {
  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-full max-w-xs">
          <Select<SelectOption, false>
            styles={reactSelectStyles(theme)}
            options={sportsOptions}
            placeholder="Select sport"
            value={groupFilter}
            onChange={onGroupFilterChange}
            isClearable
          />
        </div>
        <Button onClick={onCreateGroup} className="bg-brand-500 text-white hover:bg-brand-600">
          Create Group
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
          <p className="text-sm text-gray-500 dark:text-gray-400">Groups</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{sportSummary.total}</p>
        </div>
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Markets</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{sportSummary.markets}</p>
        </div>
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Sport</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {groupFilter?.label ?? "All Sports"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/70">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Market Groups</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tap a row to edit group details and manage associated markets.
          </p>
        </div>

        <DataTable
          columns={groupColumns}
          data={groupedRows}
          onRowClick={(row) => onRowClick(row.original)}
        />
      </div>
    </div>
  );
};

