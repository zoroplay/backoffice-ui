"use client";

import React, { useCallback, useState } from "react";
import type { GroupBase, StylesConfig, MultiValue } from "react-select";
import makeAnimated from "react-select/animated";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns, TicketOnHold } from './columns'
import {ticketsOnHold} from './data'  


import { withAuth } from "@/utils/withAuth";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import type { Range } from "react-date-range";

// ----------------------
// Filter Options
// ----------------------
type FilterOption = { value: string; label: string };

type FilterCategory = "betType" | "stake" | "return" | "other";

const getFilterCategory = (value: string): FilterCategory => {
  if (["Single", "Multiple", "System"].includes(value)) {
    return "betType";
  }

  if (value.startsWith("stake_")) {
    return "stake";
  }

  if (value.startsWith("return_")) {
    return "return";
  }

  return "other";
};

const filterOptions: Array<{
  label: string;
  options: FilterOption[];
}> = [
  {
    label: "Bet Type",
    options: [
      { value: "Single", label: "Single Bet" },
      { value: "Multiple", label: "Multiple Bet" },
      { value: "System", label: "System Bet" },
    ],
  },
  {
    label: "Stake Range",
    options: [
      { value: "stake_low", label: "Stake < ₦1,000" },
      { value: "stake_medium", label: "Stake ₦1,000 - ₦5,000" },
      { value: "stake_high", label: "Stake > ₦5,000" },
    ],
  },
  {
    label: "Potential Return",
    options: [
      { value: "return_low", label: "Return < ₦5,000" },
      { value: "return_medium", label: "Return ₦5,000 - ₦10,000" },
      { value: "return_high", label: "Return > ₦10,000" },
    ],
  },
];

const animatedComponents = makeAnimated();

const createDefaultDateRange = (): Range => ({
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
  endDate: new Date(),
  key: "selection",
});

function TicketOnHoldPage() {
  const { theme } = useTheme();  
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
  const [filteredData, setFilteredData] = useState<TicketOnHold[]>(ticketsOnHold);
  const [dateRange, setDateRange] = useState<Range>(createDefaultDateRange());

  

  // ----------------------
  // Clear filters
  // ----------------------
  const handleClear = () => {
     setSelectedFilters([]);  
     setFilteredData(ticketsOnHold);  
     setDateRange(createDefaultDateRange());
  };

  // Handle select change with category constraint
  const handleSelectChange = useCallback(
    (val: MultiValue<FilterOption>) => {
      if (!val || val.length === 0) {
        handleClear();
        return;
      }

      const nextSelection = val.reduce<FilterOption[]>((acc, option) => {
        const category = getFilterCategory(option.value);
        const existingIndex = acc.findIndex(
          (selected) => getFilterCategory(selected.value) === category
        );

        if (existingIndex !== -1) {
          acc.splice(existingIndex, 1);
        }

        acc.push(option);
        return acc;
      }, []);

      setSelectedFilters(nextSelection);
    },
    [handleClear]
  );

  // Apply filters
  const handleSearch = () => {
    if (selectedFilters.length === 0) {
      setFilteredData(ticketsOnHold);
      return;
    }

    const betTypeFilter = selectedFilters.find(f => 
      ["Single", "Multiple", "System"].includes(f.value)
    );

    const stakeFilter = selectedFilters.find(f => 
      f.value.startsWith('stake_')
    );

    const returnFilter = selectedFilters.find(f => 
      f.value.startsWith('return_')
    );

    const filtered = ticketsOnHold.filter((ticket) => {
      // Bet Type filtering
      const matchesBetType = !betTypeFilter || 
        ticket.betType === betTypeFilter.value;

      // Stake filtering
      let matchesStake = !stakeFilter;
      if (stakeFilter) {
        if (stakeFilter.value === 'stake_low') matchesStake = ticket.stake < 1000;
        else if (stakeFilter.value === 'stake_medium') matchesStake = ticket.stake >= 1000 && ticket.stake <= 5000;
        else if (stakeFilter.value === 'stake_high') matchesStake = ticket.stake > 5000;
      }

      // Return filtering
      let matchesReturn = !returnFilter;
      if (returnFilter) {
        if (returnFilter.value === 'return_low') matchesReturn = ticket.potentialReturn < 5000;
        else if (returnFilter.value === 'return_medium') matchesReturn = ticket.potentialReturn >= 5000 && ticket.potentialReturn <= 10000;
        else if (returnFilter.value === 'return_high') matchesReturn = ticket.potentialReturn > 10000;
      }

      return matchesBetType && matchesStake && matchesReturn;
    });

    setFilteredData(filtered);
  };

  return (
    <div className="p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Tickets On Hold" />

      <TableFilterToolbar<FilterOption, true, GroupBase<FilterOption>>   
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        actions={{
          onSearch: handleSearch,
          onClear: handleClear,
        }}
        selectProps={{
          containerClassName: "max-w-[22rem]",
          options: filterOptions,
          components: animatedComponents,
          isMulti: true,
          placeholder: "Filter by Bet Type, Stake or Returns",
          value: selectedFilters,
          onChange: handleSelectChange,
          styles: reactSelectStyles(theme) as StylesConfig<FilterOption, true, GroupBase<FilterOption>>,
        }}
      />

      {/* Table */}
      <div className="mt-6">
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
}

export default withAuth(TicketOnHoldPage);
