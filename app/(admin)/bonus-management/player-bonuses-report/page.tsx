"use client";

import React, { useState, useCallback } from "react";
import Select from "react-select";
import type { Range } from "react-date-range";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { DateRangeFilter, defaultDateRange } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { withAuth } from "@/utils/withAuth";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";

import { columns, PlayerBonusReport } from "./columns";
import { playerBonusReportData } from "./data";

const filterOptions = [
  {
    label: "Bonus Type",
    options: [
      { value: "registration", label: "Registration" },
      { value: "first_deposit", label: "First Deposit" },
      { value: "deposit_bonus", label: "Deposit Bonus" },
      { value: "referral", label: "Referral" },
      { value: "cashback", label: "Cashback" },
      { value: "freebet", label: "Freebet" },
      { value: "sharebet", label: "Sharebet" },
    ],
  },
  {
    label: "Transaction Type",
    options: [
      { value: "bonus_achieved", label: "Bonus Achieved" },
      { value: "bonus_lost", label: "Bonus Lost" },
      { value: "bonus_redeemed", label: "Bonus Redeemed" },
    ],
  },
  {
    label: "Referral Source",
    options: [
      { value: "other", label: "Other" },
      { value: "facebook", label: "Facebook" },
      { value: "instagram", label: "Instagram" },
      { value: "twitter", label: "Twitter" },
      { value: "organic", label: "Organic" },
    ],
  },
  {
    label: "Player Agent Type",
    options: [
      { value: "under_agent", label: "Under Agent" },
      { value: "not_under", label: "Not Under" },
    ],
  },
];

function PlayerBonusesReportPage() {
  const { theme } = useTheme();
  const [filteredData, setFilteredData] = useState<PlayerBonusReport[]>(playerBonusReportData);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [appliedDateRange, setAppliedDateRange] = useState<Range | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<{ value: string; label: string } | null>(null);
  const [appliedFilter, setAppliedFilter] = useState<{ value: string; label: string } | null>(null);

  const filterReports = useCallback(
    (filter: { value: string; label: string } | null = appliedFilter, range: Range | null = appliedDateRange) => {
      let filtered = [...playerBonusReportData];

      if (filter) {
        const val = filter.value.toLowerCase();

        // Check Bonus Type
        if (["registration", "first_deposit", "deposit_bonus", "referral", "cashback", "freebet", "sharebet"].includes(val)) {
          filtered = filtered.filter(
            (item) => item.bonusType.toLowerCase().replace(" ", "_") === val
          );
        }

        // Check Transaction Type
        if (["bonus_achieved", "bonus_lost", "bonus_redeemed"].includes(val)) {
          filtered = filtered.filter(
            (item) => item.transactionType.toLowerCase().replace(" ", "_") === val
          );
        }

        // Check Referral Source
        if (["other", "facebook", "instagram", "twitter", "organic"].includes(val)) {
          filtered = filtered.filter((item) => item.referralSource.toLowerCase() === val);
        }

        // Check Player Agent Type
        if (["under_agent", "not_under"].includes(val)) {
          filtered = filtered.filter(
            (item) => item.playerAgentType.toLowerCase().replace(" ", "_") === val
          );
        }
      }

      // Filter by Date Range
      if (range && range.startDate && range.endDate) {
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.date);
          const start = new Date(range.startDate!);
          const end = new Date(range.endDate!);

          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          return itemDate >= start && itemDate <= end;
        });
      }

      return filtered;
    },
    [appliedFilter, appliedDateRange]
  );

  const handleSearch = () => {
    const nextFilter = selectedFilter;
    const nextDateRange = dateRange;

    setAppliedFilter(nextFilter);
    setAppliedDateRange(nextDateRange);
    setFilteredData(filterReports(nextFilter, nextDateRange));
  };

  const handleClearFilters = () => {
    setDateRange(defaultDateRange);
    setSelectedFilter(null);
    setAppliedFilter(null);
    setAppliedDateRange(null);
    setFilteredData(playerBonusReportData);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Player Bonus Report" />

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range Picker */}
          <DateRangeFilter
            range={dateRange}
            onChange={(range) => setDateRange(range)}
          />

          {/* Multi-Select Filter */}
          <div className="w-[18rem]">
            <Select
              styles={reactSelectStyles(theme)}
              options={filterOptions}
              placeholder="Filter Options"
              value={selectedFilter}
              onChange={(val) => setSelectedFilter(val)}
              isClearable
            />
          </div>
        </div>

        <FilterActions onSearch={handleSearch} onClear={handleClearFilters} />
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(PlayerBonusesReportPage);

