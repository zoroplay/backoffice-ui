"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MultiValue, type GroupBase } from "react-select";
import type { Range } from "react-date-range";
import { TrendingDown, TrendingUp } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { DataTable } from "@/components/tables/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import { cashflowApi, normalizeApiError } from "@/lib/api";
import Button from "@/components/ui/button/Button";

import { withdrawalColumns } from "./withdrawals-columns";
import { depositColumns } from "./deposits-columns";
import { Withdrawal } from "./withdrawals-data";
import { Deposit } from "./deposits-data";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Infotext } from "@/components/common/Info";

type FilterOption = {
  value: string;
  label: string;
};

const filterOptions: Array<{ label: string; options: FilterOption[] }> = [
  {
    label: "Transaction Status",
    options: [
      { value: "Status:Pending", label: "Pending" },
      { value: "Status:Approved", label: "Approved" },
      { value: "Status:Declined", label: "Declined" },
      { value: "Status:Processing", label: "Processing" },
      { value: "Status:Completed", label: "Completed" },
    ],
  },
  {
    label: "Payment Method",
    options: [
      { value: "PaymentMethod:Bank Transfer", label: "Bank Transfer" },
      { value: "PaymentMethod:Mobile Money", label: "Mobile Money" },
      { value: "PaymentMethod:Card", label: "Card" },
    ],
  },
];

const toDDMMYYYY = (date?: Date, endOfDay = false) => {
  if (!date) return "";
  const d = new Date(date);
  if (endOfDay) {
    d.setHours(23, 59, 59, 0);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  const day = `${d.getDate()}`.padStart(2, "0");
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const year = d.getFullYear();
  const hours = `${d.getHours()}`.padStart(2, "0");
  const minutes = `${d.getMinutes()}`.padStart(2, "0");
  const seconds = `${d.getSeconds()}`.padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

const toYYYYMMDD = (date?: Date, endOfDay = false) => {
  if (!date) return "";
  const d = new Date(date);
  if (endOfDay) {
    d.setHours(23, 59, 59, 0);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  const day = `${d.getDate()}`.padStart(2, "0");
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const year = d.getFullYear();
  const hours = `${d.getHours()}`.padStart(2, "0");
  const minutes = `${d.getMinutes()}`.padStart(2, "0");
  const seconds = `${d.getSeconds()}`.padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const mapStatus = (status: unknown): "Pending" | "Approved" | "Declined" | "Processing" | "Completed" => {
  const numeric = Number(status);
  if (numeric === 1) return "Completed";
  if (numeric === 2) return "Approved";
  if (numeric === 3) return "Declined";
  if (numeric === 4) return "Processing";
  const text = String(status ?? "").toLowerCase();
  if (text.includes("approved")) return "Approved";
  if (text.includes("declined") || text.includes("rejected")) return "Declined";
  if (text.includes("processing")) return "Processing";
  if (text.includes("completed") || text.includes("success")) return "Completed";
  return "Pending";
};

function DepositsWithdrawalsPage() {
  const [activeTab, setActiveTab] = useState<"withdrawals" | "deposits">("withdrawals");
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [appliedFilters, setAppliedFilters] = useState<FilterOption[]>([]);
  const [appliedDateRange, setAppliedDateRange] = useState<Range>(defaultDateRange);
  const [appliedQuery, setAppliedQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [rows, setRows] = useState<(Withdrawal | Deposit)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);

  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  useEffect(() => {
    const placeholderText =
      activeTab === "withdrawals"
        ? "Search by username or transaction ID"
        : "Search by username or transaction ID";
    setPlaceholder(placeholderText);
    return () => resetPlaceholder();
  }, [activeTab, resetPlaceholder, setPlaceholder]);

  const fetchData = useCallback(async () => {
    if (!hasSearched) {
      return;
    }

    const selections = appliedFilters.reduce<Record<string, string>>((acc, option) => {
      const [category, value] = option.value.split(":");
      if (category && value) acc[category] = value;
      return acc;
    }, {});

    const from = toDDMMYYYY(appliedDateRange.startDate);
    const to = toDDMMYYYY(appliedDateRange.endDate, true);

    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === "withdrawals") {
        const response = await cashflowApi.searchWithdrawals(
          {
            period: "today",
            from,
            to,
            status: selections.Status ?? "",
            paymentMethod: selections.PaymentMethod ?? "",
            type: "Withdrawal",
            username: "",
            transactionId: "",
            keyword: appliedQuery,
            clientId: 4,
          },
          page
        );

        const root = response as {
          data?: {
            rows?: unknown[];
            total?: number;
            totalAmount?: number;
            lastPage?: number;
            page?: number;
            newPage?: number;
            prevPage?: number;
          };
        };
        const rowsData = Array.isArray(root?.data?.rows) ? root.data.rows : [];
        const mapped: Withdrawal[] = rowsData.map((item, index) => {
          const row = (item as Record<string, unknown>) ?? {};
          const amount = Number(row.amount ?? 0);
          return {
            id: String(row.id ?? index),
            dateRequested: String(row.created_at ?? row.updated_at ?? ""),
            username: String(row.username ?? ""),
            nameOnFile: String(row.account_name ?? row.username ?? ""),
            amount: Number.isFinite(amount) ? amount : 0,
            accountNumber: String(row.account_number ?? "-"),
            accountName: String(row.account_name ?? "-"),
            bank: String(row.bank ?? row.channel ?? "-"),
            updatedBy: String(row.updated_by ?? "System"),
            status: mapStatus(row.status),
            paymentMethod: String(row.channel ?? ""),
            location: String(row.location ?? ""),
            transactionId: String(row.transaction_no ?? row.id ?? ""),
          };
        });
        const nextLastPage = Math.max(1, Number(root?.data?.lastPage ?? 1) || 1);
        const nextPage = Math.max(1, Number(root?.data?.page ?? page) || page);
        setRows(mapped);
        setTotalRows(Number(root?.data?.total ?? mapped.length));
        setLastPage(nextLastPage);
        if (nextPage !== page) {
          setPage(Math.min(nextPage, nextLastPage));
        }
        setTotalAmount(Number(root?.data?.totalAmount ?? 0));
      } else {
        const startDate = toYYYYMMDD(appliedDateRange.startDate);
        const endDate = toYYYYMMDD(appliedDateRange.endDate, true);
        const response = await cashflowApi.searchDeposits(
          {
            period: "last_30_days",
            from,
            to,
            status: selections.Status ?? "",
            paymentMethod: selections.PaymentMethod ?? "",
            type: "Deposit",
            username: "",
            transactionId: "",
            keyword: appliedQuery,
            clientId: 4,
            startDate,
            endDate,
          },
          page
        );

        const root = response as {
          data?: {
            rows?: unknown[];
            total?: number;
            totalAmount?: number;
            lastPage?: number;
            page?: number;
            newPage?: number;
            prevPage?: number;
          };
        };
        const rowsData = Array.isArray(root?.data?.rows) ? root.data.rows : [];
        const mapped: Deposit[] = rowsData.map((item, index) => {
          const row = (item as Record<string, unknown>) ?? {};
          const amount = Number(row.amount ?? 0);
          const rawSource = String(row.source ?? "").toLowerCase();
          const clientType: Deposit["clientType"] =
            rawSource.includes("agent")
              ? "Agent"
              : rawSource.includes("vip")
              ? "VIP"
              : rawSource.includes("premium")
              ? "Premium"
              : "Regular";

          return {
            id: String(row.id ?? index),
            createdDate: String(row.created_at ?? ""),
            lastUpdatedDate:
              typeof row.updated_at === "string" && row.updated_at.trim()
                ? row.updated_at
                : "-",
            transactionId: String(row.transaction_no ?? row.id ?? ""),
            paymentMethod: String(row.channel ?? row.paymentMethod ?? ""),
            bank: String(row.bank ?? row.channel ?? "-"),
            username: String(row.username ?? ""),
            fullName: "",
            amount: Number.isFinite(amount) ? amount : 0,
            transactionNote: String(row.description ?? ""),
            status: mapStatus(row.status),
            clientType,
            handledBy: String(row.handledBy ?? "System"),
            action: String(row.action ?? "Processed"),
            approve: mapStatus(row.status) === "Completed",
            declineReason: String(row.declineReason ?? ""),
            reviewStatus: "Under Review",
            location: String(row.location ?? ""),
          };
        });
        const nextLastPage = Math.max(1, Number(root?.data?.lastPage ?? 1) || 1);
        const nextPage = Math.max(1, Number(root?.data?.page ?? page) || page);
        setRows(mapped);
        setTotalRows(Number(root?.data?.total ?? mapped.length));
        setLastPage(nextLastPage);
        if (nextPage !== page) {
          setPage(Math.min(nextPage, nextLastPage));
        }
        setTotalAmount(Number(root?.data?.totalAmount ?? 0));
      }
    } catch (err) {
      const apiError = normalizeApiError(err);
      setError(apiError.message ?? "Failed to fetch records");
      setRows([]);
      setTotalRows(0);
      setLastPage(1);
      setTotalAmount(0);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, appliedDateRange.endDate, appliedDateRange.startDate, appliedFilters, appliedQuery, hasSearched, page]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const applyFilters = () => {
    const nextRange = dateRange.startDate && dateRange.endDate ? dateRange : defaultDateRange;
    setAppliedFilters(selectedFilters);
    setAppliedDateRange(nextRange);
    setAppliedQuery(query.trim());
    setHasSearched(true);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setDateRange(defaultDateRange);
    setAppliedFilters([]);
    setAppliedDateRange(defaultDateRange);
    setAppliedQuery("");
    setHasSearched(false);
    setPage(1);
    setRows([]);
    setTotalRows(0);
    setLastPage(1);
    setTotalAmount(0);
    setError(null);
    resetQuery();
  };

  const handleFilterChange = useCallback((selected: MultiValue<FilterOption>) => {
    const categoryMap = new Map<string, FilterOption>();
    selected.forEach((option) => {
      const [category] = option.value.split(":");
      if (category) categoryMap.set(category, option);
    });
    setSelectedFilters(Array.from(categoryMap.values()));
  }, []);

  const amountLabel = useMemo(
    () =>
      `₦${totalAmount.toLocaleString("en-NG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`,
    [totalAmount]
  );

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Deposits/Withdrawals Manager" />

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as "withdrawals" | "deposits");
          setPage(1);
        }}
        defaultValue="withdrawals"
        className="w-full"
      >
        <TabsList className="mb-6 h-auto rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-1.5 shadow-sm dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-800/30">
          <TabsTrigger
            value="withdrawals"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-50 data-[state=active]:border data-[state=active]:border-red-200 data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-md dark:hover:bg-gray-800 dark:data-[state=active]:border-red-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-red-400"
          >
            <TrendingDown className="h-4 w-4" />
            Withdrawals
          </TabsTrigger>
          <TabsTrigger
            value="deposits"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-50 data-[state=active]:border data-[state=active]:border-green-200 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md dark:hover:bg-gray-800 dark:data-[state=active]:border-green-700 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-green-400"
          >
            <TrendingUp className="h-4 w-4" />
            Deposits
          </TabsTrigger>
        </TabsList>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Amount
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {amountLabel}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Records
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {totalRows}
            </p>
          </div>
        </div>

        <Infotext
          text={`Use the global search to filter by username or transaction ID, and use filters to narrow status/payment method.`}
        />

        <TableFilterToolbar<FilterOption, true, GroupBase<FilterOption>>
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          actions={{
            onSearch: applyFilters,
            onClear: clearFilters,
          }}
          isLoading={isLoading}
          selectProps={{
            containerClassName: "max-w-[26rem]",
            options: filterOptions,
            placeholder: "Filter by Status or Payment Method",
            value: selectedFilters,
            onChange: handleFilterChange,
            isMulti: true,
          }}
        />

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <TabsContent value="withdrawals" className="mt-4">
          {!hasSearched ? (
            <div className="flex justify-center py-8 text-gray-500">Search to see data.</div>
          ) : (
            <DataTable columns={withdrawalColumns} data={rows as Withdrawal[]} loading={isLoading} hidePagination />
          )}
        </TabsContent>

        <TabsContent value="deposits" className="mt-4">
          {!hasSearched ? (
            <div className="flex justify-center py-8 text-gray-500">Search to see data.</div>
          ) : (
            <DataTable columns={depositColumns} data={rows as Deposit[]} loading={isLoading} hidePagination />
          )}
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(1)}
          disabled={page <= 1 || isLoading}
        >
          First
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1 || isLoading}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => Math.min(lastPage, prev + 1))}
          disabled={page >= lastPage || isLoading}
        >
          Next
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(lastPage)}
          disabled={page >= lastPage || isLoading}
        >
          Last
        </Button>
      </div>
    </div>
  );
}

export default withAuth(DepositsWithdrawalsPage);
