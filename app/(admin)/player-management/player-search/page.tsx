"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns, Player } from "./columns";
import { players } from "./data";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import { Info } from "lucide-react";

function PlayerSmartSearchPage() {
  const [filteredData, setFilteredData] = useState<Player[]>(players);
  const { query, setPlaceholder, resetPlaceholder } = useSearch();

  useEffect(() => {
    setPlaceholder(
      "Search by Customer Code, Name, Username, Email, or Phone..."
    );

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  // 🔍 Filter logic
  useEffect(() => {
    if (!query.trim()) {
      setFilteredData(players);
      return;
    }

    const lowerVal = query.toLowerCase();

    const filtered = players.filter((player) =>
      [
        player.code,
        player.username,
        player.fullName,
        player.email,
        player.phone,
      ]
        .map((field) => field.toLowerCase())
        .some((field) => field.includes(lowerVal))
    );

    setFilteredData(filtered);
  }, [query]);

  return (
    <div className="space-y-6 p-4">
     
      <PageBreadcrumb pageTitle="Player Smart Search" />
      <span className="flex items-center gap-1 mb-2 text-gray-500 dark:text-gray-400">  <Info className="h-4 w-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Use the global search to filter by Customer Code, Name, Username, Email. </p>
      </span>

      {/* Data Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
}

export default withAuth(PlayerSmartSearchPage);
