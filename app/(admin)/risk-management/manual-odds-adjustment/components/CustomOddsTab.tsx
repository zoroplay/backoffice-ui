"use client";

import Select, { type ActionMeta, type MultiValue, type GroupBase, type StylesConfig } from "react-select";
import { FilterActions } from "@/components/common/FilterActions";
import { DataTable } from "@/components/tables/DataTable";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import type { ColumnDef } from "@tanstack/react-table";

import type { CustomOddsOverride } from "../data";
import type { CustomFilterOption } from "../types";

type CustomOddsTabProps = {
  theme: string | null;
  filterOptions: Array<{
    label: string;
    options: CustomFilterOption[];
  }>;
  selectedOptions: CustomFilterOption[];
  onFilterChange: (
    newValue: MultiValue<CustomFilterOption>,
    actionMeta: ActionMeta<CustomFilterOption>
  ) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  filteredOverrides: CustomOddsOverride[];
  columns: ColumnDef<CustomOddsOverride, unknown>[];
};

export function CustomOddsTab({
  theme,
  filterOptions,
  selectedOptions,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  filteredOverrides,
  columns,
}: CustomOddsTabProps) {
  const selectStyles = reactSelectStyles((theme === "light" || theme === "dark" ? theme : undefined)) as StylesConfig<CustomFilterOption, true, GroupBase<CustomFilterOption>>;

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Custom Odds Overrides
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review, approve, or decline bespoke price requests before they hit production.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="max-w-[20rem]">            
          <Select<CustomFilterOption, true>
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            options={filterOptions}
            value={selectedOptions}
            styles={selectStyles}
            placeholder="Filter by Sport, Status, or Market"
            onChange={onFilterChange}
          />
          </div>

          <div>
            <FilterActions onSearch={onApplyFilters} onClear={onClearFilters} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Overrides ({filteredOverrides.length})
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use the global search above to find a specific Match ID.
            </p>
          </div>
        </div>

        <DataTable columns={columns} data={filteredOverrides} />
      </div>
    </>
  );
}

export default CustomOddsTab;

