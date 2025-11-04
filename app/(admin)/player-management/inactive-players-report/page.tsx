"use client";

import React, { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { FilterActions } from "@/components/common/FilterActions";
import { columns } from "./columns";
import { inactivePlayersData, InactivePlayer } from "./data";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";

// Client type options
const clientTypeOptions = [
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "retail", label: "Retail" },
];

function InactivePlayersReport() {
  const [selectedClientType, setSelectedClientType] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<InactivePlayer[]>(inactivePlayersData);
  const [appliedClientTypes, setAppliedClientTypes] = useState<any[]>([]);
  const { query, setPlaceholder, resetPlaceholder, resetQuery } = useSearch();

  useEffect(() => {
    setPlaceholder("Search by Username");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  // Clear filters
  const handleClear = () => {
    setSelectedClientType([]);
    setFilteredData(inactivePlayersData);
    setAppliedClientTypes([]);
    resetQuery();
  };

  // Apply filters
  const filterData = useCallback(
    (value: string, clientFilters?: any[]) => {
      const activeClientFilters = clientFilters ?? appliedClientTypes;
      const clientTypeValues = activeClientFilters.map((f) =>
        (f.value ?? "").toLowerCase()
      );
      const lowerSearch = value.trim().toLowerCase();

      return inactivePlayersData.filter((item) => {
        const matchesUsername =
          !lowerSearch || item.username.toLowerCase().includes(lowerSearch);

        const matchesType =
          clientTypeValues.length === 0 ||
          clientTypeValues.includes(item.clientType.toLowerCase());

        return matchesUsername && matchesType;
      });
    },
    [appliedClientTypes]
  );

  useEffect(() => {
    setFilteredData(filterData(query));
  }, [filterData, query]);

  const handleSearch = () => {
    setAppliedClientTypes(selectedClientType);
    setFilteredData(filterData(query, selectedClientType));
  };

  return (
    <section className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Inactive Players Report" />

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Username Input */}
          {/* Client Type Multi-Select */}
          <div className="w-[20rem]">
            <Select
              className="dark:text-black"
              options={clientTypeOptions}
              isMulti
              placeholder="Filter by Client Type"
              value={selectedClientType}
              onChange={(val) => setSelectedClientType(val as any[])}
            />
          </div>
        </div>

        {/* Filter Actions */}
        <FilterActions onSearch={handleSearch} onClear={handleClear} />
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={filteredData} />
    </section>
  );
}

export default withAuth(InactivePlayersReport);
