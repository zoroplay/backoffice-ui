"use client";

import React, { useCallback, useEffect, useState} from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns, QuickBet } from "./columns";
import { quickBets } from "./data";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import { Info } from "lucide-react";

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

 

 

  return (
    <div className="p-4">
      <PageBreadcrumb pageTitle="Quick Bet Search" />
       <span className="flex items-center gap-1 mb-2">
          <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400 ">Use the search bar to find a quick bet by betslip ID</p>
       </span>
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(QuickBetPage);
