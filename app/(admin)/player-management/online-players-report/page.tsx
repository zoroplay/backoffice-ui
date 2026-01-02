"use client";

import { useEffect, useMemo } from "react";
import { onlinePlayers } from "./data";
import { columns } from "./columns";
import { withAuth } from "@/utils/withAuth";
import { DataTable } from "@/components/tables/DataTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useSearch } from "@/context/SearchContext";
import { Info } from "lucide-react";

function OnlinePlayersPage() {
  const { query, setPlaceholder, resetPlaceholder } = useSearch();

  useEffect(() => {
    setPlaceholder("Search by Username");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  
  const filteredData = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return onlinePlayers;

    return onlinePlayers.filter((p) =>
      p.username.toLowerCase().includes(trimmed)
    );
  }, [query]);

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Online Player Search" />
      <span className="flex items-center gap-1 mb-2 text-gray-500 dark:text-gray-400"> 
         <Info className="h-4 w-4" />
         <p className="text-sm text-gray-500 dark:text-gray-400">Use the global search to filter by Username. </p>
      </span>
      {/* Data Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
}

export default withAuth(OnlinePlayersPage);
