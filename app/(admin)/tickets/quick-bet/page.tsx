"use client";

import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns, QuickBet } from "./columns";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import { Infotext } from "@/components/common/Info";
import { betsApi, normalizeApiError } from "@/lib/api";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { LoadingState } from "@/components/common/LoadingState";

function QuickBetPage() {
  const [filteredData, setFilteredData] = useState<QuickBet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();
  const [submittedQuery, setSubmittedQuery] = useState("");

  const toNumber = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const toQuickBet = useCallback((row: Record<string, unknown>): QuickBet => ({
    betslipId: String(row.betslipId ?? row.betslip_id ?? row.couponId ?? ""),
    betType: String(row.betType ?? row.type ?? row.ticketType ?? ""),
    placedOn: String(row.placedOn ?? row.createdAt ?? row.date ?? ""),
    by: String(row.by ?? row.username ?? row.user ?? ""),
    sportsLimit: String(row.sportsLimit ?? row.sports_limit ?? ""),
    sport: String(row.sport ?? row.sportName ?? ""),
    league: String(row.league ?? row.tournament ?? ""),
    event: String(row.event ?? row.eventName ?? ""),
    market: String(row.market ?? row.marketName ?? ""),
    selection: String(row.selection ?? row.outcome ?? ""),
    odds: toNumber(row.odds),
    stake: toNumber(row.stake),
    ret: toNumber(row.ret ?? row.returns ?? row.potentialWinnings),
    winLoss: toNumber(row.winLoss ?? row.win_loss ?? row.profitLoss),
    clientType: String(row.clientType ?? row.channel ?? ""),
    betStatus: String(row.betStatus ?? row.status ?? ""),
    betSettledAt: String(row.betSettledAt ?? row.settledAt ?? row.settled_at ?? "-"),
  }), []);

  const getRowsFromResponse = useCallback((res: unknown): QuickBet[] => {
    const root = (res as { data?: unknown })?.data ?? res;
    const list =
      (Array.isArray(root) && root) ||
      ((root as { data?: unknown })?.data as unknown[]) ||
      ((root as { coupon?: unknown })?.coupon
        ? [(root as { coupon?: unknown }).coupon]
        : []) ||
      (root ? [root] : []);

    if (!Array.isArray(list)) return [];
    return list.map((row) => toQuickBet((row as Record<string, unknown>) ?? {}));
  }, [toQuickBet]);

  useEffect(() => {
    setPlaceholder("Search by Betslip ID");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  useEffect(() => {
    const couponId = submittedQuery.trim();
    if (!couponId) {
      setFilteredData([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadCouponDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await betsApi.getCouponDetails(couponId);
        if (cancelled) return;
        setFilteredData(getRowsFromResponse(res));
      } catch (err) {
        if (cancelled) return;
        const apiErr = normalizeApiError(err);
        setError(apiErr.message ?? "Failed to fetch coupon details");
        setFilteredData([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadCouponDetails();

    return () => {
      cancelled = true;
    };
  }, [getRowsFromResponse, submittedQuery]);

  const applySearch = () => {
    setSubmittedQuery(query.trim());
  };

  const clearSearch = () => {
    resetQuery();
  };





  return (
    <div className="p-4">
      <PageBreadcrumb pageTitle="Quick Bet Search" />
      <Infotext text="Use the search bar to find a quick bet by betslip ID" />
      <TableFilterToolbar
        actions={{
          onSearch: applySearch,
          onClear: clearSearch,
        }}
        isLoading={isLoading}
        className="mb-4"
      />
      {isLoading ? (
        <LoadingState className="py-8" />
      ) : (
        <>
          {error && (
            <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <DataTable columns={columns} data={filteredData} />
        </>
      )}
    </div>
  );
}

export default withAuth(QuickBetPage);
