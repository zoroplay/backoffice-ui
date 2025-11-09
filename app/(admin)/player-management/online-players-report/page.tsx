"use client";

import { useEffect, useMemo } from "react";
import { onlinePlayers } from "./data";
import { columns } from "./columns";
import { withAuth } from "@/utils/withAuth";
import { DataTable } from "@/components/tables/DataTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useSearch } from "@/context/SearchContext";

function OnlinePlayersPage() {
  const { query, setPlaceholder, resetPlaceholder } = useSearch();

  useEffect(() => {
    setPlaceholder("Search by Username");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  // ✅ useMemo ensures filtering only runs when `searchValue` changes
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

      {/* Data Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
}

export default withAuth(OnlinePlayersPage);
