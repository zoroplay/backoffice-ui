"use client";

import React, { useState } from "react";
import Select from "react-select";
import type { Range } from "react-date-range";
import type { RowSelectionState } from "@tanstack/react-table";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { DateRangeFilter, defaultDateRange } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import Button from "@/components/ui/button/Button";
import { withAuth } from "@/utils/withAuth";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";

import { columns, MassBonusPlayer } from "./columns";
import { massBonusPlayersData } from "./data";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";

type FilterOption = {
  value: string;
  label: string;
};

const segmentTypeOptions: FilterOption[] = [
  { value: "registered_no_deposit", label: "Players registered, no deposit" },
  { value: "deposited", label: "Players deposited" },
  { value: "deposit_count", label: "Players deposit count" },
  { value: "bet_amount", label: "Players bet amount" },
  { value: "bet_amount_and_type", label: "Players bet amount and bet type" },
];

const bonusOptions: FilterOption[] = [
  { value: "welcome_bonus", label: "Welcome Bonus - 100%" },
  { value: "weekend_special", label: "Weekend Special - 50%" },
  { value: "first_deposit", label: "First Deposit Bonus - 150%" },
  { value: "loyalty_bonus", label: "Loyalty Bonus - 25%" },
  { value: "free_bet", label: "Free Bet Friday - ₦1000" },
  { value: "monthly_reload", label: "Monthly Reload - 75%" },
  { value: "cashback", label: "Cashback Bonus - 10%" },
  { value: "casino_welcome", label: "Casino Welcome - 200%" },
];

function GrantMassBonusesPage() {
  const { theme } = useTheme();
  const [filteredData, setFilteredData] = useState<MassBonusPlayer[]>(massBonusPlayersData);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [segmentType, setSegmentType] = useState<FilterOption | null>(null);
  const [selectedBonus, setSelectedBonus] = useState<FilterOption | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const handleSearch = () => {
    // Apply filters based on segment type
    if (!segmentType) {
      setFilteredData(massBonusPlayersData);
      return;
    }

    let filtered = [...massBonusPlayersData];

    switch (segmentType.value) {
      case "registered_no_deposit":
        filtered = filtered.filter((player) => player.balance === 0);
        break;
      case "deposited":
        filtered = filtered.filter((player) => player.balance > 0);
        break;
      case "deposit_count":
        // Example filter - players with balance > 10000
        filtered = filtered.filter((player) => player.balance > 10000);
        break;
      case "bet_amount":
        // Example filter - active players with balance
        filtered = filtered.filter(
          (player) => player.status === "Active" && player.balance > 5000
        );
        break;
      case "bet_amount_and_type":
        // Example filter - verified and active
        filtered = filtered.filter(
          (player) => player.verified && player.status === "Active"
        );
        break;
      default:
        break;
    }

    setFilteredData(filtered);
  };

  const handleClearFilters = () => {
    setDateRange(defaultDateRange);
    setSegmentType(null);
    setSelectedBonus(null);    
    setFilteredData(massBonusPlayersData);
    setRowSelection({});
  };

  const handleGrantBonus = () => {
    const selectedRows = Object.keys(rowSelection);
    
    if (selectedRows.length === 0) {
      alert("Please select at least one player");
      return;
    }

    if (!selectedBonus) {
      alert("Please select a bonus to grant");
      return;
    }

    // Get selected players
    const selectedPlayers = filteredData.filter((_, index) =>
      selectedRows.includes(index.toString())
    );

    console.log("Granting bonus:", {
      bonus: selectedBonus.label,
      players: selectedPlayers.map((p) => p.username),
      count: selectedPlayers.length,
    });

    alert(
      `Bonus "${selectedBonus.label}" granted to ${selectedPlayers.length} player(s):\n${selectedPlayers.map((p) => p.username).join(", ")}`
    );

    // Reset selection
    setRowSelection({});
  };

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Grant Mass Bonuses" />

      <TableFilterToolbar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: handleSearch,
          onClear: handleClearFilters,
        }}
        selectProps={{
          options: segmentTypeOptions,
          placeholder: "Select Segment Type", 
          value: segmentType,
          onChange: (val) => setSegmentType(val ?? null),
          isClearable: true,
        }}
      />
      {/* Results Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Results Header */}
        <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Results</h2>
          <div className="flex items-center gap-3">
            {/* Select Bonus Dropdown */}
            <div className="w-64">
              <Select<FilterOption>
                styles={reactSelectStyles(theme)}
                options={bonusOptions}
                placeholder="Select Bonus"
                value={selectedBonus}
                onChange={(val) => setSelectedBonus(val as FilterOption | null)}
                isClearable
              />
            </div>
            {/* Grant Bonus Button */}
            <Button
              onClick={handleGrantBonus}
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={!selectedBonus || Object.keys(rowSelection).length === 0}
            >
              Grant Bonus
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          {filteredData.length > 0 ? (
            <DataTable
              columns={columns}
              data={filteredData}
              onRowSelectionChange={setRowSelection}
              rowSelection={rowSelection}
            />
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(GrantMassBonusesPage);

