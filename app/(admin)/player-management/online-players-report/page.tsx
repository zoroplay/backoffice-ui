"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { columns } from "./columns";
import type { OnlinePlayer } from "./data";
import { withAuth } from "@/utils/withAuth";
import { DataTable } from "@/components/tables/DataTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useSearch } from "@/context/SearchContext";
import { Info } from "lucide-react";
import { normalizeApiError, playerApi } from "@/lib/api";
import { toast } from "sonner";

function mapOnlineRow(entry: Record<string, unknown>): OnlinePlayer {
  const statusValue = Number(entry.status ?? 0);
  const isActive = statusValue === 1;

  return {
    username: String(entry.username ?? ""),
    dateJoined: String(entry.registered ?? entry.createdAt ?? ""),
    email: String(entry.email ?? ""),
    phone: String(entry.phoneNumber ?? ""),
    balance: Number(entry.balance ?? 0),
    bonuses: Number(entry.bonus ?? 0),
    lifetimeDeposits: Number(entry.lifeTimeDeposit ?? 0),
    lifetimeWithdrawals: Number(entry.lifeTimeWithdrawal ?? 0),
    openBets: Number(entry.openBets ?? 0),
    verified: Number(entry.verified ?? 0) === 1 ? "Yes" : "No",
    status: isActive ? "Active" : "Inactive",
  };
}

function OnlinePlayersPage() {
  const { query, setPlaceholder, resetPlaceholder } = useSearch();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnlinePlayer[]>([]);

  useEffect(() => {
    setPlaceholder("Search by Username");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  const loadReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await playerApi.getOnlinePlayersReport(1, {
        country: "",
        state: "",
        username: "",
        source: "",
      });

      const root = (response && typeof response === "object") ? (response as { data?: unknown }) : {};
      const rows = Array.isArray(root.data) ? root.data : [];
      setData(rows.map((row) => mapOnlineRow(row as Record<string, unknown>)));
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to load online players report");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const filteredData = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return data;

    return data.filter((player) => player.username.toLowerCase().includes(trimmed));
  }, [data, query]);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Online Player Search" />
      <span className="mb-2 flex items-center gap-1 text-gray-500 dark:text-gray-400">
        <Info className="h-4 w-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Use the global search to filter by Username. </p>
      </span>
      <div className="overflow-x-auto custom-scrollbar">
        <DataTable columns={columns} data={filteredData} loading={isLoading} />
      </div>
    </div>
  );
}

export default withAuth(OnlinePlayersPage);
