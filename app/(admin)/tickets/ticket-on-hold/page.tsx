"use client";

import React, { useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { FilterActions } from "@/components/common/FilterActions";
import { columns, TicketOnHold } from './columns'
import {ticketsOnHold} from './data'  


import { withAuth } from "@/utils/withAuth";

// ----------------------
// Filter Options
// ----------------------
const filterOptions = [
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

function TicketOnHoldPage() {  
  const [selectedFilters, setSelectedFilters] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<TicketOnHold[]>(ticketsOnHold);

  

  // ----------------------
  // Clear filters
  // ----------------------
  const handleClear = () => {
     setSelectedFilters([]);  
     setFilteredData(ticketsOnHold);  
  };

  // Handle select change with category constraint
  const handleSelectChange = (val: readonly unknown[]) => {
    if (!val || val.length === 0) {
      handleClear();
      return;
    }

    const newSelection = [...val];
    const lastSelected = newSelection[newSelection.length - 1] as { value: string; label: string };

    if (lastSelected) {
      // Remove any previous selection from the same category
      const otherSelections = selectedFilters.filter(filter => {
        // Determine category of the filter
        const isBetType = ["Single", "Multiple", "Combo"].includes(filter.value);
        const isStakeOrReturn = filter.value.startsWith('stake_') || filter.value.startsWith('return_');
        
        // Determine category of new selection
        const isNewBetType = ["Single", "Multiple", "Combo"].includes(lastSelected.value);
        const isNewStakeOrReturn = lastSelected.value.startsWith('stake_') || lastSelected.value.startsWith('return_');

        // Keep selections from different categories
        return (isBetType && !isNewBetType) || (isStakeOrReturn && !isNewStakeOrReturn);
      });

      setSelectedFilters([...otherSelections, lastSelected]);
    }
  };

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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 justify-between mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Combined Select */}
          <div className="w-[20rem]">
            <Select
              className="dark:text-black"
              options={filterOptions}
              components={animatedComponents}
              isMulti
              placeholder="Filter by Bet Type, Stake or Returns"
              value={selectedFilters}
              onChange={handleSelectChange}
              isClearable={true}
            />
          </div>
        </div>

        {/* Search & Clear */}
        <FilterActions onSearch={handleSearch} onClear={handleClear} />
      </div>

      {/* Table */}
      <div className="mt-6">
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
}

export default withAuth(TicketOnHoldPage);
