"use client";

import React from "react";
import Select, { type MultiValue } from "react-select";

import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { reactSelectStyles } from "@/utils/reactSelectStyles";

import type { ColumnDef } from "@tanstack/react-table";
import type { MarketRow } from "../columns";
import type { SelectOption } from "../data";

type MarketsTabProps = {
  theme: string;
  filterOptions: Array<{ label: string; options: SelectOption[] }>;
  selections: SelectOption[];
  onSelectionsChange: (options: MultiValue<SelectOption>) => void;
  summary: {
    total: number;
    enabled: number;
    cashoutEnabled: number;
  };
  columns: ColumnDef<MarketRow>[];
  rows: MarketRow[];
  onCreateMarket: () => void;
  onRowClick: (row: MarketRow) => void;
};

export const MarketsTab: React.FC<MarketsTabProps> = ({
  theme,
  filterOptions,
  selections,
  onSelectionsChange,
  summary,
  columns,
  rows,
  onCreateMarket,
  onRowClick,
}) => {
  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-full max-w-xl">
          <Select<SelectOption, true>
            styles={reactSelectStyles(theme)}
            options={filterOptions}
            placeholder="Filter by sport or market group"
            isMulti
            value={selections}
            onChange={onSelectionsChange}
            closeMenuOnSelect={false}
          />
        </div>
        <Button onClick={onCreateMarket} className="bg-brand-500 text-white hover:bg-brand-600">
          Add Market
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
          <p className="text-sm text-gray-500 dark:text-gray-400">Markets</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.total}</p>
        </div>
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
          <p className="text-sm text-gray-500 dark:text-gray-400">Enabled</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.enabled}</p>
        </div>
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
          <p className="text-sm text-gray-500 dark:text-gray-400">Cashout Ready</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.cashoutEnabled}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/70">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Available Markets</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Use filters to narrow the list and click a row to adjust market configuration.
          </p>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          onRowClick={(row) => onRowClick(row.original)}
        />
      </div>
    </div>
  );
};

