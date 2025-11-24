"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { Range } from "react-date-range";
import type { SingleValue } from "react-select";
import { DollarSign, Calendar, CheckCircle2, Gift } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DateRangeFilter, defaultDateRange } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAuth } from "@/utils/withAuth";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";

import { columns, Commission } from "./columns";
import {
  weeklyCommissions,
  paidCommissions,
  bonusCommissions,
  sportOptions,
} from "./data";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";

const cloneRange = (range: Range) => ({
  startDate: range.startDate ? new Date(range.startDate) : undefined,
  endDate: range.endDate ? new Date(range.endDate) : undefined,
  key: "selection",
}) satisfies Range;

type SportOption = {
  value: string;
  label: string;
};

function CommissionsPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("weekly");

  const [selectedSport, setSelectedSport] = useState<SportOption | null>(null);
  const [appliedSport, setAppliedSport] = useState<string>("");

  const [selectedRange, setSelectedRange] = useState<Range>(() => cloneRange(defaultDateRange));
  const [appliedRange, setAppliedRange] = useState<Range>(() => cloneRange(defaultDateRange));

  const [weeklyData, setWeeklyData] = useState<Commission[]>(weeklyCommissions);
  const [paidData, setPaidData] = useState<Commission[]>(paidCommissions);
  const [bonusData, setBonusData] = useState<Commission[]>(bonusCommissions);
  
  const [rowSelection, setRowSelection] = useState({});

  const filterCommissions = useCallback(
    (dataset: Commission[], sportValue: string, range: Range) => {
      return dataset.filter((record) => {
        const matchesSport = !sportValue || record.sport === sportValue;

        const matchesDate = (() => {
          if (!range?.startDate || !range?.endDate) {
            return true;
          }

          const recordDate = new Date(record.reportDate);
          if (Number.isNaN(recordDate.getTime())) {
            return true;
          }

          const start = new Date(range.startDate);
          const end = new Date(range.endDate);

          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          return recordDate >= start && recordDate <= end;
        })();

        return matchesSport && matchesDate;
      });
    },
    []
  );

  useEffect(() => {
    setWeeklyData(filterCommissions(weeklyCommissions, appliedSport, appliedRange));
    setPaidData(filterCommissions(paidCommissions, appliedSport, appliedRange));
    setBonusData(filterCommissions(bonusCommissions, appliedSport, appliedRange));
  }, [appliedRange, appliedSport, filterCommissions]);

  const applyFilters = () => {
    const normalizedRange =
      selectedRange.startDate && selectedRange.endDate
        ? cloneRange(selectedRange)
        : cloneRange(defaultDateRange);

    setAppliedSport(selectedSport?.value ?? "");
    setAppliedRange(normalizedRange);
  };

  const clearFilters = () => {
    const resetSelectedRange = cloneRange(defaultDateRange);
    const resetAppliedRange = cloneRange(defaultDateRange);
    setSelectedSport(null);
    setAppliedSport("");
    setSelectedRange(resetSelectedRange);
    setAppliedRange(resetAppliedRange);
  };

  const getTableData = () => {
    switch (activeTab) {
      case "weekly":
        return weeklyData;
      case "paid":
        return paidData;
      case "bonus":
      default:
        return bonusData;
    }
  };

  const handlePayAllAgents = () => {
    console.log("Pay all agents triggered", { tab: activeTab });
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Commissions Report" />

      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="weekly" className="w-full">
        <TabsList className="mb-6 h-auto bg-gradient-to-r from-gray-50 to-gray-100 p-1.5 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <TabsTrigger 
            value="weekly" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-blue-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:border-blue-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 rounded-lg"
          >
            <Calendar className="h-4 w-4" />
            Weekly Commissions
          </TabsTrigger>
          <TabsTrigger 
            value="paid" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-green-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:border-green-700 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 rounded-lg"
          >
            <CheckCircle2 className="h-4 w-4" />
            Paid Commissions
          </TabsTrigger>
          <TabsTrigger 
            value="bonus" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-purple-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:border-purple-700 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 rounded-lg"
          >
            <Gift className="h-4 w-4" /> 
            Bonus Commissions
          </TabsTrigger>
        </TabsList>

         

        <TableFilterToolbar<SportOption>
          dateRange={selectedRange}
          onDateRangeChange={setSelectedRange}
          actions={{
            onSearch: applyFilters,
            onClear: clearFilters,
          }}
          selectProps={{
            options: sportOptions,
            placeholder: "Sport",
            value: selectedSport,
            onChange: (option: SingleValue<SportOption>) => setSelectedSport(option ?? null),
            isClearable: true,
            containerClassName: "max-w-[22rem]",
          }}
        />
            
        <div className="flex justify-end my-4">
              <Button
                variant="primary"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600"
                onClick={handlePayAllAgents}
              >
                <DollarSign className="h-4 w-4" />
                Pay All Agents
              </Button>
          </div>
        <TabsContent value="weekly" className="mt-0">
          <div>          
            <DataTable 
              columns={columns} 
              data={getTableData()} 
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
            />
          </div>
        </TabsContent>

        <TabsContent value="paid" className="mt-0">
          <div>            
            <DataTable 
              columns={columns} 
              data={getTableData()} 
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
            />
          </div>
        </TabsContent>

        <TabsContent value="bonus" className="mt-0">
           <div>            
            <DataTable 
              columns={columns} 
              data={getTableData()} 
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default withAuth(CommissionsPage);

