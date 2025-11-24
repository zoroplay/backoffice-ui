"use client";

import React, { useCallback, useEffect, useState } from "react";
import { GroupBase } from "react-select";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns } from "./columns";
import { inactivePlayersData, InactivePlayer } from "./data";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { Info } from "lucide-react";

// Client type options
const clientTypeOptions = [
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
  { value: "retail", label: "Retail" },
];

type ClientTypeOption = { value: string; label: string };

function InactivePlayersReport() {    
  const [selectedClientType, setSelectedClientType] = useState<ClientTypeOption[]>([]);
  const [filteredData, setFilteredData] = useState<InactivePlayer[]>(inactivePlayersData);
  const [appliedClientTypes, setAppliedClientTypes] = useState<ClientTypeOption[]>([]);
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
    (value: string, clientFilters?: ClientTypeOption[]) => {
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

      <span className="flex items-center gap-1 mb-2 text-gray-500 dark:text-gray-400">  <Info className="h-4 w-4" />    
        <p className="text-sm text-gray-500 dark:text-gray-400">Use the global search to filter by Username</p>
      </span>

      <TableFilterToolbar<ClientTypeOption, true, GroupBase<ClientTypeOption>>   
         
        actions={{
          onSearch: handleSearch,
          onClear: handleClear,
        }}
        selectProps={{
          containerClassName: "max-w-[20rem]",
          options: clientTypeOptions,
          placeholder: "Filter by Client Type",
          value: selectedClientType,
          onChange: (val) => setSelectedClientType(Array.isArray(val) ? [...val] : []),
          isMulti: true,
        }}
      />  

      {/* Data Table */}
      <DataTable columns={columns} data={filteredData} />
    </section>
  );
}

export default withAuth(InactivePlayersReport);
