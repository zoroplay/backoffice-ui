"use client";

import React, { useState} from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns, QuickBet } from "./columns";
import { quickBets } from "./data";
import { FilterActions } from "@/components/common/FilterActions";
import { withAuth } from "@/utils/withAuth";

function QuickBetPage() {
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState<QuickBet[]>(quickBets);

  const applyFilter = () => {
    if (!searchValue) {
      setFilteredData(quickBets);
      return;
    }
    const filtered = quickBets.filter((row) =>
      row.betslipId.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const clearFilter = () => {
    setSearchValue("");
    setFilteredData(quickBets);
  }

  return (
    <div className="p-4">
      <PageBreadcrumb pageTitle="Quick Bet Search" />
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search by Betslip ID"
          className="border rounded px-3 py-2 w-[20rem] dark:bg-gray-900 dark:text-white"
        />
        <FilterActions onSearch={applyFilter} onClear={clearFilter} />
      </div>
      
      <div className="mt-6">
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
  }


export default withAuth(QuickBetPage);
