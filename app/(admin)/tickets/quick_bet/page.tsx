"use client";

import React, { useCallback, useEffect, useState} from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns, QuickBet } from "./columns";
import { quickBets } from "./data";
import { FilterActions } from "@/components/common/FilterActions";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";

function QuickBetPage() {
  const [filteredData, setFilteredData] = useState<QuickBet[]>(quickBets);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  const filterByQuery = useCallback(
    (value: string) => {
      const trimmed = value.trim().toLowerCase();

      if (!trimmed) {
        return quickBets;
      }

      return quickBets.filter((row) =>
        row.betslipId.toLowerCase().includes(trimmed)
      );
    },
    []
  );

  useEffect(() => {
    setPlaceholder("Search by Betslip ID");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  useEffect(() => {
    setFilteredData(filterByQuery(query));
  }, [filterByQuery, query]);

  const applyFilter = () => {
    setFilteredData(filterByQuery(query));
  };

  const clearFilter = () => {
    resetQuery();
    setFilteredData(quickBets);
  };

  return (
    <div className="p-4">
      <PageBreadcrumb pageTitle="Quick Bet Search" />
{/*       
      <div className="flex flex-col md:flex-row gap-4 mb-6 md:justify-between">
        <FilterActions onSearch={applyFilter} onClear={clearFilter} />
      </div> */}
      
      <div className="mt-6">
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
  }


export default withAuth(QuickBetPage);
