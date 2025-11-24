"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { type MultiValue, type GroupBase, type StylesConfig } from "react-select";
import { Info, Clock, CheckCircle2, XCircle } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { withAuth } from "@/utils/withAuth";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";
import { useSearch } from "@/context/SearchContext";

import { columns, PendingRequest } from "./columns";
import {
  pendingRequests,
  filterOptions,
  type FilterOption,
} from "./data";

const searchableFields: Array<keyof PendingRequest> = [
  "username",
  "name",
  "requestType",
  "parentUser",
];

// Helper function to get filter category
const getFilterCategory = (value: string): string => {
  const requestTypeGroup = filterOptions[0];
  if (requestTypeGroup.options.some((opt) => opt.value === value)) {
    return "requestType";
  }
  return "status";
};

function PendingRequestsPage() {
  const { theme } = useTheme();
  const [allRequests, setAllRequests] = useState<PendingRequest[]>(pendingRequests);
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterOption[]>([]);

  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  useEffect(() => {
    setPlaceholder("Search by username, name, request type, or parent user");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  const filterRequests = useCallback(
    (searchQuery: string, filters: FilterOption[], data: PendingRequest[]) => {
      const searchTerm = searchQuery.trim().toLowerCase();

      // Separate filters by category
      const requestTypeFilters = filters.filter(
        (f) => getFilterCategory(f.value) === "requestType"
      );
      const statusFilters = filters.filter(
        (f) => getFilterCategory(f.value) === "status"
      );

      return data.filter((request) => {
        // Search filter
        if (searchTerm) {
          const matchesSearch = searchableFields.some((field) =>
            String(request[field] ?? "")
              .toLowerCase()
              .includes(searchTerm)
          );

          if (!matchesSearch) {
            return false;
          }
        }

        // Request type filter
        if (requestTypeFilters.length > 0) {
          const matchesRequestType = requestTypeFilters.some(
            (filter) => request.requestType === filter.value
          );
          if (!matchesRequestType) {
            return false;
          }
        }

        // Status filter
        if (statusFilters.length > 0) {
          const matchesStatus = statusFilters.some(
            (filter) => request.status === filter.value
          );
          if (!matchesStatus) {
            return false;
          }
        }

        return true;
      });
    },
    []
  );

  const filteredData = useMemo(
    () => filterRequests(query, appliedFilters, allRequests),
    [filterRequests, query, appliedFilters, allRequests]
  );

  // Apply filters
  const handleSearch = () => {
    setAppliedFilters(selectedFilters);
  };

  // Clear filters
  const handleClear = () => {
    setSelectedFilters([]);
    setAppliedFilters([]);
    resetQuery();
  };

  // Handle filter change
  const handleFilterChange = (val: MultiValue<FilterOption>) => {
    if (!val || val.length === 0) {
      setSelectedFilters([]);
      return;
    }

    // Enforce single selection per category
    const nextSelection = val.reduce<FilterOption[]>((acc, option) => {
      const category = getFilterCategory(option.value);
      const existingIndex = acc.findIndex(
        (selected) => getFilterCategory(selected.value) === category
      );

      if (existingIndex !== -1) {
        acc.splice(existingIndex, 1);
      }

      acc.push(option);
      return acc;
    }, []);

    setSelectedFilters(nextSelection);
  };

  // Approve request
  const handleApprove = useCallback((requestId: string) => {
    setAllRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? { ...request, status: "approved" as const }
          : request
      )
    );
  }, []);

  // Reject request
  const handleReject = useCallback((requestId: string) => {
    setAllRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? { ...request, status: "rejected" as const }
          : request
      )
    );
  }, []);

  // Create columns with callbacks
  const tableColumns = useMemo(
    () =>
      columns.map((col) => {
        if (col.id === "actions") {
          return {
            ...col,
            cell: ({ row }: { row: any }) => {
              const request = row.original;
              const isPending = request.status === "pending";

              return (
                <div className="flex items-center gap-2">
                  {isPending && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        className="h-8 bg-green-500 hover:bg-green-600 text-white px-3"
                        onClick={() => handleApprove(request.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 px-3"
                        onClick={() => handleReject(request.id)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {!isPending && (
                    <span className="text-sm text-gray-400 text-center dark:text-gray-500">
                      Processed
                    </span>
                  )}
                </div>
              );
            },
          };
        }
        return col;
      }),
    [handleApprove, handleReject]
  );

  const pendingCount = filteredData.filter(
    (r) => r.status === "pending"
  ).length;
  const approvedCount = filteredData.filter(
    (r) => r.status === "approved"
  ).length;
  const rejectedCount = filteredData.filter(
    (r) => r.status === "rejected"
  ).length;

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Pending Requests" />

      <span className="flex items-center gap-1 mb-2 text-gray-500 dark:text-gray-400">
        <Info className="h-4 w-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use the global search to filter by Username, Name, Request Type, or Parent User
        </p>
      </span>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {pendingCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Approved
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {approvedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Rejected
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {rejectedCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <TableFilterToolbar<FilterOption, true, GroupBase<FilterOption>>
        actions={{
          onSearch: handleSearch,
          onClear: handleClear,
        }}
        selectProps={{
          containerClassName: "max-w-[22rem]",
          options: filterOptions,
          isMulti: true,
          closeMenuOnSelect: false,
          hideSelectedOptions: false,
          placeholder: "Filter by Request Type or Status",
          value: selectedFilters,
          onChange: handleFilterChange,
          styles: reactSelectStyles(theme) as StylesConfig<FilterOption, true, GroupBase<FilterOption>>,
        }}
      />

      {/* Data Table */}
      <DataTable columns={tableColumns} data={filteredData} />
    </div>
  );
}

export default withAuth(PendingRequestsPage);

