"use client";

import React, { useCallback, useEffect, useState } from "react";
import { MultiValue, type GroupBase } from "react-select";
import type { Range } from "react-date-range";
import { TrendingDown, TrendingUp } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  defaultDateRange,
} from "@/components/common/DateRangeFilter";
import { DataTable } from "@/components/tables/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAuth } from "@/utils/withAuth";
import { useTheme } from "@/context/ThemeContext";
import { useSearch } from "@/context/SearchContext";

import { withdrawalColumns } from "./withdrawals-columns";
import { depositColumns } from "./deposits-columns";
import {
  withdrawals,
  Withdrawal,
} from "./withdrawals-data";
import { deposits, Deposit } from "./deposits-data";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";

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
  {
    label: "Location",
    options: [
      { value: "Location:Lagos", label: "Lagos" },
      { value: "Location:Abuja", label: "Abuja" },
      { value: "Location:Port Harcourt", label: "Port Harcourt" },
      { value: "Location:Kano", label: "Kano" },
    ],
  },
  {
    label: "Bank",
    options: [
      { value: "Bank:Access Bank", label: "Access Bank" },
      { value: "Bank:GTBank", label: "GTBank" },
      { value: "Bank:Zenith Bank", label: "Zenith Bank" },
      { value: "Bank:UBA", label: "UBA" },
      { value: "Bank:First Bank", label: "First Bank" },
    ],
  },
];

const searchableWithdrawalFields: Array<keyof Withdrawal> = [
  "username",
  "transactionId",
  "nameOnFile",
  "accountName",
];

const searchableDepositFields: Array<keyof Deposit> = [
  "username",
  "transactionId",
  "fullName",
];

function DepositsWithdrawalsPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("withdrawals");

  // Filters state
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [filteredData, setFilteredData] = useState<(Withdrawal | Deposit)[]>(
    withdrawals
  );

  // Applied filters state
  const [appliedFilters, setAppliedFilters] = useState<FilterOption[]>([]);
  const [appliedDateRange, setAppliedDateRange] = useState<Range>(defaultDateRange);

  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  useEffect(() => {
    const placeholderText =
      activeTab === "withdrawals"
        ? "Search by Username, Transaction ID, Name on File, or Account Name"
        : "Search by Username, Transaction ID, or Full Name";
    setPlaceholder(placeholderText);

    return () => {
      resetPlaceholder();
    };
  }, [activeTab, resetPlaceholder, setPlaceholder]);

  const filterWithdrawals = useCallback(
    (
      searchQuery: string,
      filters: FilterOption[] = appliedFilters,
      range: Range = appliedDateRange
    ) => {
      const searchTerm = searchQuery.trim().toLowerCase();

      return withdrawals.filter((row) => {
        // Global search
        if (searchTerm) {
          const matchesSearch = searchableWithdrawalFields.some((field) =>
            String(row[field] ?? "")
              .toLowerCase()
              .includes(searchTerm)
          );
          if (!matchesSearch) {
            return false;
          }
        }

        // Parse multi-select filters
        const selections = (filters ?? []).reduce<Record<string, string>>((acc, option) => {
          if (!option?.value) {
            return acc;
          }

          const [category, value] = option.value.split(":");
          if (category && value) {
            acc[category] = value;
          }

          return acc;
        }, {});

        // Transaction Status filter
        const matchesStatus = selections.Status
          ? row.status.toLowerCase() === selections.Status.toLowerCase()
          : true;

        // Payment Method filter
        const matchesMethod = selections.PaymentMethod
          ? row.paymentMethod.toLowerCase() === selections.PaymentMethod.toLowerCase()
          : true;

        // Location filter
        const matchesLocation = selections.Location
          ? row.location.toLowerCase() === selections.Location.toLowerCase()
          : true;

        // Bank filter
        const matchesBank = selections.Bank
          ? row.bank.toLowerCase() === selections.Bank.toLowerCase()
          : true;

        // Date range filter
        const matchesDate =
          range && range.startDate && range.endDate
            ? (() => {
                const rowDate = new Date(row.dateRequested);
                const start = new Date(range.startDate);
                const end = new Date(range.endDate);

                rowDate.setHours(0, 0, 0, 0);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);

                return rowDate >= start && rowDate <= end;
              })()
            : true;

        return (
          matchesStatus &&
          matchesMethod &&
          matchesLocation &&
          matchesBank &&
          matchesDate
        );
      });
    },
    [appliedDateRange, appliedFilters]
  );

  const filterDeposits = useCallback(
    (
      searchQuery: string,
      filters: FilterOption[] = appliedFilters,
      range: Range = appliedDateRange
    ) => {
      const searchTerm = searchQuery.trim().toLowerCase();

      return deposits.filter((row) => {
        // Global search
        if (searchTerm) {
          const matchesSearch = searchableDepositFields.some((field) =>
            String(row[field] ?? "")
              .toLowerCase()
              .includes(searchTerm)
          );
          if (!matchesSearch) {
            return false;
          }
        }

        // Parse multi-select filters
        const selections = (filters ?? []).reduce<Record<string, string>>((acc, option) => {
          if (!option?.value) {
            return acc;
          }

          const [category, value] = option.value.split(":");
          if (category && value) {
            acc[category] = value;
          }

          return acc;
        }, {});

        // Transaction Status filter
        const matchesStatus = selections.Status
          ? row.status.toLowerCase() === selections.Status.toLowerCase()
          : true;

        // Payment Method filter
        const matchesMethod = selections.PaymentMethod
          ? row.paymentMethod.toLowerCase() === selections.PaymentMethod.toLowerCase()
          : true;

        // Location filter
        const matchesLocation = selections.Location
          ? row.location.toLowerCase() === selections.Location.toLowerCase()
          : true;

        // Bank filter
        const matchesBank = selections.Bank
          ? row.bank.toLowerCase() === selections.Bank.toLowerCase()
          : true;

        // Date range filter
        const matchesDate =
          range && range.startDate && range.endDate
            ? (() => {
                const rowDate = new Date(row.createdDate);
                const start = new Date(range.startDate);
                const end = new Date(range.endDate);

                rowDate.setHours(0, 0, 0, 0);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);

                return rowDate >= start && rowDate <= end;
              })()
            : true;

        return (
          matchesStatus &&
          matchesMethod &&
          matchesLocation &&
          matchesBank &&
          matchesDate
        );
      });
    },
    [appliedDateRange, appliedFilters]
  );

  useEffect(() => {
    if (activeTab === "withdrawals") {
      setFilteredData(filterWithdrawals(query));
    } else {
      setFilteredData(filterDeposits(query));
    }
  }, [activeTab, filterDeposits, filterWithdrawals, query]);

  const applyFilters = () => {
    const nextFilters = selectedFilters;
    const nextRange = dateRange.startDate && dateRange.endDate ? dateRange : defaultDateRange;

    setAppliedFilters(nextFilters);
    setAppliedDateRange(nextRange);

    if (activeTab === "withdrawals") {
      setFilteredData(filterWithdrawals(query, nextFilters, nextRange));
    } else {
      setFilteredData(filterDeposits(query, nextFilters, nextRange));
    }
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setDateRange(defaultDateRange);
    setAppliedFilters([]);
    setAppliedDateRange(defaultDateRange);

    if (activeTab === "withdrawals") {
      setFilteredData(withdrawals);
    } else {
      setFilteredData(deposits);
    }

    resetQuery();
  };

  // Handle filter selection with one-per-group constraint
  const handleFilterChange = useCallback((selected: MultiValue<FilterOption>) => {
    // Group selections by category and keep only the last one per category
    const categoryMap = new Map<string, FilterOption>();
    
    selected.forEach((option) => {
      const [category] = option.value.split(":");
      if (category) {
        // Keep only the last option for each category
        categoryMap.set(category, option);
      }
    });

    // Convert back to array, ensuring only one option per category
    const filteredSelection = Array.from(categoryMap.values());
    setSelectedFilters(filteredSelection);
  }, []);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Deposits/Withdrawals Manager" />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
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

        <TableFilterToolbar<FilterOption, true, GroupBase<FilterOption>>
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          actions={{
            onSearch: applyFilters,
            onClear: clearFilters,
          }}
          selectProps={{
            containerClassName: "max-w-[26rem]",
            options: filterOptions,
            placeholder: "Filter by Transaction Status, Payment Method, Location, or Bank",
            value: selectedFilters,
            onChange: handleFilterChange,
            isMulti: true,
          }}
        />

        {/* Tab Content */}
        <TabsContent value="withdrawals" className="mt-4">
          <DataTable columns={withdrawalColumns} data={filteredData as Withdrawal[]} />
        </TabsContent>

        <TabsContent value="deposits" className="mt-4">
          <DataTable columns={depositColumns} data={filteredData as Deposit[]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default withAuth(DepositsWithdrawalsPage);

