"use client";

import React, { useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import type { Range } from "react-date-range";
import { Plus } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { DateRangeFilter, defaultDateRange } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAuth } from "@/utils/withAuth";

import {
  cashbooksColumns,
  cashinColumns,
  cashoutColumns,
  expensesColumns,
  expenseTypeColumns,
  expenseCategoryColumns,
} from "./columns";
import {
  cashBooks,
  cashIns,
  cashOuts,
  expenses,
  expenseTypes,
  expenseCategories,
} from "./data";

const animatedComponents = makeAnimated();

type FilterOption = {
  value: string;
  label: string;
};

const cashbookFilterOptions: Array<{ label: string; options: FilterOption[] }> = [
  {
    label: "Branch",
    options: [
      { value: "Branch:Lagos Main Branch", label: "Lagos Main Branch" },
      { value: "Branch:Abuja Branch", label: "Abuja Branch" },
      { value: "Branch:Port Harcourt Branch", label: "Port Harcourt Branch" },
      { value: "Branch:Kano Branch", label: "Kano Branch" },
      { value: "Branch:Ibadan Branch", label: "Ibadan Branch" },
      { value: "Branch:Enugu Branch", label: "Enugu Branch" },
    ],
  },
  {
    label: "Status",
    options: [
      { value: "Status:Open", label: "Open" },
      { value: "Status:Closed", label: "Closed" },
      { value: "Status:Pending", label: "Pending" },
      { value: "Status:Approved", label: "Approved" },
    ],
  },
];

const cashinCashoutFilterOptions: Array<{ label: string; options: FilterOption[] }> = [
  {
    label: "Branch",
    options: [
      { value: "Branch:Lagos Main Branch", label: "Lagos Main Branch" },
      { value: "Branch:Abuja Branch", label: "Abuja Branch" },
      { value: "Branch:Port Harcourt Branch", label: "Port Harcourt Branch" },
      { value: "Branch:Kano Branch", label: "Kano Branch" },
      { value: "Branch:Ibadan Branch", label: "Ibadan Branch" },
      { value: "Branch:Enugu Branch", label: "Enugu Branch" },
    ],
  },
  {
    label: "Status",
    options: [
      { value: "Status:Pending", label: "Pending" },
      { value: "Status:Approved", label: "Approved" },
      { value: "Status:Rejected", label: "Rejected" },
    ],
  },
];

const expenseFilterOptions: Array<{ label: string; options: FilterOption[] }> = [
  {
    label: "Branch",
    options: [
      { value: "Branch:Lagos Main Branch", label: "Lagos Main Branch" },
      { value: "Branch:Abuja Branch", label: "Abuja Branch" },
      { value: "Branch:Port Harcourt Branch", label: "Port Harcourt Branch" },
      { value: "Branch:Kano Branch", label: "Kano Branch" },
      { value: "Branch:Ibadan Branch", label: "Ibadan Branch" },
      { value: "Branch:Enugu Branch", label: "Enugu Branch" },
    ],
  },
  {
    label: "Status",
    options: [
      { value: "Status:Pending", label: "Pending" },
      { value: "Status:Approved", label: "Approved" },
      { value: "Status:Rejected", label: "Rejected" },
    ],
  },
];

function CashBooksPage() {
  const [activeTab, setActiveTab] = useState("cashbooks");

  // CashBooks filters
  const [cashbookFilters, setCashbookFilters] = useState<FilterOption[]>([]);
  const [cashbookDateRange, setCashbookDateRange] = useState<Range>(defaultDateRange);
  const [appliedCashbookFilters, setAppliedCashbookFilters] = useState<FilterOption[]>([]);
  const [appliedCashbookDateRange, setAppliedCashbookDateRange] = useState<Range>(defaultDateRange);
  const [filteredCashbooks, setFilteredCashbooks] = useState(cashBooks);

  // Cash In filters
  const [cashinFilters, setCashinFilters] = useState<FilterOption[]>([]);
  const [cashinDateRange, setCashinDateRange] = useState<Range>(defaultDateRange);
  const [appliedCashinFilters, setAppliedCashinFilters] = useState<FilterOption[]>([]);
  const [appliedCashinDateRange, setAppliedCashinDateRange] = useState<Range>(defaultDateRange);
  const [filteredCashIns, setFilteredCashIns] = useState(cashIns);

  // Cash Out filters
  const [cashoutFilters, setCashoutFilters] = useState<FilterOption[]>([]);
  const [cashoutDateRange, setCashoutDateRange] = useState<Range>(defaultDateRange);
  const [appliedCashoutFilters, setAppliedCashoutFilters] = useState<FilterOption[]>([]);
  const [appliedCashoutDateRange, setAppliedCashoutDateRange] = useState<Range>(defaultDateRange);
  const [filteredCashOuts, setFilteredCashOuts] = useState(cashOuts);

  // Expenses filters
  const [expenseFilters, setExpenseFilters] = useState<FilterOption[]>([]);
  const [expenseDateRange, setExpenseDateRange] = useState<Range>(defaultDateRange);
  const [appliedExpenseFilters, setAppliedExpenseFilters] = useState<FilterOption[]>([]);
  const [appliedExpenseDateRange, setAppliedExpenseDateRange] = useState<Range>(defaultDateRange);
  const [filteredExpenses, setFilteredExpenses] = useState(expenses);

  const handleMultiSelectChange = (
    val: any,
    setter: React.Dispatch<React.SetStateAction<FilterOption[]>>
  ) => {
    if (!val || (Array.isArray(val) && val.length === 0)) {
      setter([]);
      return;
    }

    const nextSelection = Array.isArray(val) ? [...val] : [val];
    const latest = nextSelection[nextSelection.length - 1] as FilterOption;

    if (!latest) {
      setter(nextSelection as FilterOption[]);
      return;
    }

    const categoryPrefix = latest.value.split(":")[0];
    const filtered = nextSelection.filter(
      (item) => item.value.split(":")[0] !== categoryPrefix
    );

    setter([...(filtered as FilterOption[]), latest]);
  };

  const filterCashbooks = React.useCallback(
    (filters: FilterOption[], range: Range) => {
      return cashBooks.filter((row) => {
        // Parse multi-select filters
        const selections = filters.reduce<Record<string, string>>((acc, option) => {
          if (!option?.value) return acc;
          const [category, value] = option.value.split(":");
          if (category && value) acc[category] = value;
          return acc;
        }, {});

        // Branch filter
        const matchesBranch = selections.Branch
          ? row.branch === selections.Branch
          : true;

        // Status filter
        const matchesStatus = selections.Status
          ? row.status === selections.Status
          : true;

        // Date range filter
        const matchesDate =
          range && range.startDate && range.endDate
            ? (() => {
                const rowDate = new Date(row.date);
                const start = new Date(range.startDate);
                const end = new Date(range.endDate);

                rowDate.setHours(0, 0, 0, 0);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);

                return rowDate >= start && rowDate <= end;
              })()
            : true;

        return matchesBranch && matchesStatus && matchesDate;
      });
    },
    []
  );

  const filterCashIns = React.useCallback(
    (filters: FilterOption[], range: Range) => {
      return cashIns.filter((row) => {
        // Parse multi-select filters
        const selections = filters.reduce<Record<string, string>>((acc, option) => {
          if (!option?.value) return acc;
          const [category, value] = option.value.split(":");
          if (category && value) acc[category] = value;
          return acc;
        }, {});

        // Branch filter
        const matchesBranch = selections.Branch
          ? row.branch === selections.Branch
          : true;

        // Status filter
        const matchesStatus = selections.Status
          ? row.status === selections.Status
          : true;

        // Date range filter
        const matchesDate =
          range && range.startDate && range.endDate
            ? (() => {
                const rowDate = new Date(row.date);
                const start = new Date(range.startDate);
                const end = new Date(range.endDate);

                rowDate.setHours(0, 0, 0, 0);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);

                return rowDate >= start && rowDate <= end;
              })()
            : true;

        return matchesBranch && matchesStatus && matchesDate;
      });
    },
    []
  );

  const filterCashOuts = React.useCallback(
    (filters: FilterOption[], range: Range) => {
      return cashOuts.filter((row) => {
        // Parse multi-select filters
        const selections = filters.reduce<Record<string, string>>((acc, option) => {
          if (!option?.value) return acc;
          const [category, value] = option.value.split(":");
          if (category && value) acc[category] = value;
          return acc;
        }, {});

        // Branch filter
        const matchesBranch = selections.Branch
          ? row.branch === selections.Branch
          : true;

        // Status filter
        const matchesStatus = selections.Status
          ? row.status === selections.Status
          : true;

        // Date range filter
        const matchesDate =
          range && range.startDate && range.endDate
            ? (() => {
                const rowDate = new Date(row.date);
                const start = new Date(range.startDate);
                const end = new Date(range.endDate);

                rowDate.setHours(0, 0, 0, 0);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);

                return rowDate >= start && rowDate <= end;
              })()
            : true;

        return matchesBranch && matchesStatus && matchesDate;
      });
    },
    []
  );

  const filterExpenses = React.useCallback(
    (filters: FilterOption[], range: Range) => {
      return expenses.filter((row) => {
        // Parse multi-select filters
        const selections = filters.reduce<Record<string, string>>((acc, option) => {
          if (!option?.value) return acc;
          const [category, value] = option.value.split(":");
          if (category && value) acc[category] = value;
          return acc;
        }, {});

        // Branch filter
        const matchesBranch = selections.Branch
          ? row.branch === selections.Branch
          : true;

        // Status filter
        const matchesStatus = selections.Status
          ? row.status === selections.Status
          : true;

        // Date range filter - check if expense has approvedAt date
        const matchesDate =
          range && range.startDate && range.endDate && row.approvedAt
            ? (() => {
                const rowDate = new Date(row.approvedAt);
                const start = new Date(range.startDate);
                const end = new Date(range.endDate);

                rowDate.setHours(0, 0, 0, 0);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);

                return rowDate >= start && rowDate <= end;
              })()
            : true;

        return matchesBranch && matchesStatus && matchesDate;
      });
    },
    []
  );

  React.useEffect(() => {
    setFilteredCashbooks(filterCashbooks(appliedCashbookFilters, appliedCashbookDateRange));
  }, [appliedCashbookFilters, appliedCashbookDateRange, filterCashbooks]);

  React.useEffect(() => {
    setFilteredCashIns(filterCashIns(appliedCashinFilters, appliedCashinDateRange));
  }, [appliedCashinFilters, appliedCashinDateRange, filterCashIns]);

  React.useEffect(() => {
    setFilteredCashOuts(filterCashOuts(appliedCashoutFilters, appliedCashoutDateRange));
  }, [appliedCashoutFilters, appliedCashoutDateRange, filterCashOuts]);

  React.useEffect(() => {
    setFilteredExpenses(filterExpenses(appliedExpenseFilters, appliedExpenseDateRange));
  }, [appliedExpenseFilters, appliedExpenseDateRange, filterExpenses]);

  const applyFilters = () => {
    if (activeTab === "cashbooks") {
      const nextRange = cashbookDateRange.startDate && cashbookDateRange.endDate 
        ? cashbookDateRange 
        : defaultDateRange;
      setAppliedCashbookFilters(cashbookFilters);
      setAppliedCashbookDateRange(nextRange);
    } else if (activeTab === "cashin") {
      const nextRange = cashinDateRange.startDate && cashinDateRange.endDate 
        ? cashinDateRange 
        : defaultDateRange;
      setAppliedCashinFilters(cashinFilters);
      setAppliedCashinDateRange(nextRange);
    } else if (activeTab === "cashout") {
      const nextRange = cashoutDateRange.startDate && cashoutDateRange.endDate 
        ? cashoutDateRange 
        : defaultDateRange;
      setAppliedCashoutFilters(cashoutFilters);
      setAppliedCashoutDateRange(nextRange);
    } else if (activeTab === "expenses") {
      const nextRange = expenseDateRange.startDate && expenseDateRange.endDate 
        ? expenseDateRange 
        : defaultDateRange;
      setAppliedExpenseFilters(expenseFilters);
      setAppliedExpenseDateRange(nextRange);
    }
  };

  const clearFilters = () => {
    if (activeTab === "cashbooks") {
      setCashbookFilters([]);
      setCashbookDateRange(defaultDateRange);
      setAppliedCashbookFilters([]);
      setAppliedCashbookDateRange(defaultDateRange);
      setFilteredCashbooks(cashBooks);
    } else if (activeTab === "cashin") {
      setCashinFilters([]);
      setCashinDateRange(defaultDateRange);
      setAppliedCashinFilters([]);
      setAppliedCashinDateRange(defaultDateRange);
      setFilteredCashIns(cashIns);
    } else if (activeTab === "cashout") {
      setCashoutFilters([]);
      setCashoutDateRange(defaultDateRange);
      setAppliedCashoutFilters([]);
      setAppliedCashoutDateRange(defaultDateRange);
      setFilteredCashOuts(cashOuts);
    } else if (activeTab === "expenses") {
      setExpenseFilters([]);
      setExpenseDateRange(defaultDateRange);
      setAppliedExpenseFilters([]);
      setAppliedExpenseDateRange(defaultDateRange);
      setFilteredExpenses(expenses);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Cash Books" />

      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="cashbooks" className="w-full">
        <TabsList className="mb-6 h-auto bg-gradient-to-r from-gray-50 to-gray-100 p-1.5 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
          <TabsTrigger
            value="cashbooks"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-blue-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:border-blue-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg"
          >
            CashBooks
          </TabsTrigger>
          <TabsTrigger
            value="cashin"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-green-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:border-green-700 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg"
          >
            Cash In
          </TabsTrigger>
          <TabsTrigger
            value="cashout"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-red-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:border-red-700 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg"
          >
            Cash Out
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-purple-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:border-purple-700 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg"
          >
            Expenses
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:border-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        {/* CashBooks Tab */}
        <TabsContent value="cashbooks" className="mt-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <DateRangeFilter
                range={cashbookDateRange}
                onChange={(range) => setCashbookDateRange(range)}
              />

              <div className="w-[22rem]">
                <Select
                  className="dark:text-black"
                  options={cashbookFilterOptions}
                  placeholder="Filter by Branch, Status"
                  components={animatedComponents}
                  isMulti
                  value={cashbookFilters}
                  onChange={(val) => handleMultiSelectChange(val, setCashbookFilters)}
                />
              </div>
            </div>

            <FilterActions onSearch={applyFilters} onClear={clearFilters} />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 dark:border-gray-700">
              <h2 className="text-base font-semibold text-white">Cashbooks</h2>
            </div>
            <div className="p-4">
              <DataTable columns={cashbooksColumns} data={filteredCashbooks} />
            </div>
          </div>
        </TabsContent>

        {/* Cash In Tab */}
        <TabsContent value="cashin" className="mt-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <button className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500">
                <Plus className="h-4 w-4" />
                Add
              </button>

              <DateRangeFilter
                range={cashinDateRange}
                onChange={(range) => setCashinDateRange(range)}
              />

              <div className="w-[22rem]">
                <Select
                  className="dark:text-black"
                  options={cashinCashoutFilterOptions}
                  placeholder="Filter by Branch, Status"
                  components={animatedComponents}
                  isMulti
                  value={cashinFilters}
                  onChange={(val) => handleMultiSelectChange(val, setCashinFilters)}
                />
              </div>
            </div>

            <FilterActions onSearch={applyFilters} onClear={clearFilters} />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 dark:border-gray-700">
              <h2 className="text-base font-semibold text-white">Cash In</h2>
            </div>
            <div className="p-4">
              <DataTable columns={cashinColumns} data={filteredCashIns} />
            </div>
          </div>
        </TabsContent>

        {/* Cash Out Tab */}
        <TabsContent value="cashout" className="mt-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <button className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500">
                <Plus className="h-4 w-4" />
                Add
              </button>

              <DateRangeFilter
                range={cashoutDateRange}
                onChange={(range) => setCashoutDateRange(range)}
              />

              <div className="w-[22rem]">
                <Select
                  className="dark:text-black"
                  options={cashinCashoutFilterOptions}
                  placeholder="Filter by Branch, Status"
                  components={animatedComponents}
                  isMulti
                  value={cashoutFilters}
                  onChange={(val) => handleMultiSelectChange(val, setCashoutFilters)}
                />
              </div>
            </div>

            <FilterActions onSearch={applyFilters} onClear={clearFilters} />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 dark:border-gray-700">
              <h2 className="text-base font-semibold text-white">Cash Out</h2>
            </div>
            <div className="p-4">
              <DataTable columns={cashoutColumns} data={filteredCashOuts} />
            </div>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <DateRangeFilter
                range={expenseDateRange}
                onChange={(range) => setExpenseDateRange(range)}
              />

              <div className="w-[22rem]">
                <Select
                  className="dark:text-black"
                  options={expenseFilterOptions}
                  placeholder="Filter by Branch, Status"
                  components={animatedComponents}
                  isMulti
                  value={expenseFilters}
                  onChange={(val) => handleMultiSelectChange(val, setExpenseFilters)}
                />
              </div>
            </div>

            <FilterActions onSearch={applyFilters} onClear={clearFilters} />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 dark:border-gray-700">
              <h2 className="text-base font-semibold text-white">Expense</h2>
            </div>
            <div className="p-4">
              <DataTable columns={expensesColumns} data={filteredExpenses} />
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Expense Type */}
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Expense Type
                </h3>
                <button className="inline-flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600">
                  New Expense Type
                </button>
              </div>
              <div className="p-4">
                <DataTable columns={expenseTypeColumns} data={expenseTypes} />
              </div>
            </div>

            {/* Expense Category */}
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Expense Category
                </h3>
                <button className="inline-flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600">
                  New Expense Category
                </button>
              </div>
              <div className="p-4">
                <DataTable columns={expenseCategoryColumns} data={expenseCategories} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default withAuth(CashBooksPage);

