"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns, PendingCashoutBet } from "./column";
import { withAuth } from "@/utils/withAuth";
import { betsApi, normalizeApiError } from "@/lib/api";
import { LoadingState } from "@/components/common/LoadingState";

function PendingCashoutPage() {
  const [rows, setRows] = useState<PendingCashoutBet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toNumber = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const toPendingCashoutRow = (
    row: Record<string, unknown>
  ): PendingCashoutBet => ({
    betslipId: String(row.betslipId ?? row.betslip_id ?? row.ticketId ?? ""),
    placedBy: String(row.placedBy ?? row.username ?? row.user ?? ""),
    cashoutBy: String(row.cashoutBy ?? row.cashoutUser ?? row.cashout_user ?? ""),
    selection: String(row.selection ?? row.outcome ?? row.event ?? ""),
    odds: toNumber(row.odds),
    stake: toNumber(row.stake),
    potentialWins: toNumber(
      row.potentialWins ?? row.potentialWinnings ?? row.returns
    ),
    cashoutAmount: toNumber(row.cashoutAmount ?? row.cashout_value ?? row.amount),
    dateTime: String(row.dateTime ?? row.createdAt ?? row.date ?? ""),
  });

  const getRowsFromResponse = (res: unknown): PendingCashoutBet[] => {
    const root = (res as { data?: unknown })?.data ?? res;
    const list =
      (Array.isArray(root) && root) ||
      ((root as { data?: unknown })?.data as unknown[]) ||
      ((root as { rows?: unknown })?.rows as unknown[]) ||
      ((root as { results?: unknown })?.results as unknown[]) ||
      [];

    if (!Array.isArray(list)) return [];
    return list.map((row) =>
      toPendingCashoutRow((row as Record<string, unknown>) ?? {})
    );
  };

  useEffect(() => {
    let cancelled = false;

    const loadPendingCashout = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await betsApi.getPendingCashout(1);
        if (cancelled) return;
        setRows(getRowsFromResponse(res));
      } catch (err) {
        if (cancelled) return;
        const apiErr = normalizeApiError(err);
        setError(apiErr.message ?? "Failed to fetch pending cashout bets");
        setRows([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadPendingCashout();

    return () => {
      cancelled = true;
    };
  }, []);

return (
    <div className="p-4">   

      <PageBreadcrumb pageTitle="Pending Cashout Bets" />
      
      <div className="mt-6">
        {isLoading ? (
          <LoadingState className="py-8" />
        ) : (
          <>
            {error && (
              <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <DataTable columns={columns} data={rows} />
          </>
        )}
      </div>
    </div>
  );
  }


export default withAuth(PendingCashoutPage);
