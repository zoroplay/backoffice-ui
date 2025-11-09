"use client";

import React, { useCallback, useEffect, useState } from "react";
import Select from "react-select";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { withAuth } from "@/utils/withAuth";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";
import { useSearch } from "@/context/SearchContext";

import { columns, Agency } from "./columns";
import { agencies } from "./data";

type FilterOption = {
  value: string;
  label: string;
};

const agentTypeOptions: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "master-agent", label: "Master Agent" },
  { value: "super-agent", label: "Super Agent" },
  { value: "agent", label: "Agent" },
  { value: "shop", label: "Shop" },
  { value: "cashier", label: "Cashier" },
  { value: "web-affiliate", label: "Web Affiliate" },
  { value: "pos", label: "POS" },
];

const searchableFields: Array<keyof Agency> = ["username", "name"];

function AgencyListPage() {
  const { theme } = useTheme();
  const [filteredData, setFilteredData] = useState<Agency[]>(agencies);
  const [selectedAgentType, setSelectedAgentType] = useState<FilterOption>(
    agentTypeOptions[0]
  );

  const { query, setPlaceholder, resetPlaceholder } = useSearch();

  useEffect(() => {
    setPlaceholder("Search by first name or last name");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  const filterAgencies = useCallback(
    (searchQuery: string, agentType: FilterOption) => {
      const searchTerm = searchQuery.trim().toLowerCase();

      return agencies.filter((agency) => {
        // Search filter
        if (searchTerm) {
          const matchesSearch = searchableFields.some((field) =>
            String(agency[field] ?? "")
              .toLowerCase()
              .includes(searchTerm)
          );

          if (!matchesSearch) {
            return false;
          }
        }

        // Agent type filter
        if (agentType.value !== "all") {
          const matchesType =
            agency.agentType.toLowerCase().replace(" ", "-") ===
            agentType.value;
          if (!matchesType) {
            return false;
          }
        }

        return true;
      });
    },
    []
  );

  useEffect(() => {
    setFilteredData(filterAgencies(query, selectedAgentType));
  }, [filterAgencies, query, selectedAgentType]);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Agency List" />

      <div className="flex flex-wrap items-center gap-4">
        <div className="w-full sm:w-[200px]">
          <Select
            styles={reactSelectStyles(theme)}
            options={agentTypeOptions}
            placeholder="All"
            value={selectedAgentType}
            onChange={(val) => setSelectedAgentType(val || agentTypeOptions[0])}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}

export default withAuth(AgencyListPage);

