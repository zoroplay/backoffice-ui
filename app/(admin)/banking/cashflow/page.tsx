"use client";

import React, { useCallback, useMemo, useState } from "react";
import Select, { MultiValue, type GroupBase } from "react-select";
import type { Range } from "react-date-range";
import { Plus } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { defaultDateRange } from "@/components/common/DateRangeFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAuth } from "@/utils/withAuth";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import Form from "@/components/form/Form";
import TextArea from "@/components/form/input/TextArea";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal/Modal";
import Button from "@/components/ui/button/Button";

import {
  createCashbooksColumns,
  createCashinColumns,
  createCashoutColumns,
  createExpensesColumns,
  createExpenseTypeColumns,
  createExpenseCategoryColumns,
} from "./columns";
import {
  cashBooks,
  cashIns,
  cashOuts,
  expenses,
  expenseTypes,
  expenseCategories,
  type CashBook,
  type CashIn,
  type CashInStatus,
  type CashOut,
  type CashOutStatus,
  type Expense,
  type ExpenseType,
  type ExpenseCategory,
} from "./data";

type FilterOption = {
  value: string;
  label: string;
};

type StatusOption<T extends string> = {
  value: T;
  label: string;
};

const cashInStatusOptions: StatusOption<CashInStatus>[] = [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

const cashOutStatusOptions: StatusOption<CashOutStatus>[] = [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

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
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("cashbooks");

  const [cashBooksData, setCashBooksData] = useState<CashBook[]>(cashBooks);
  const [cashInsData, setCashInsData] = useState<CashIn[]>(cashIns);
  const [cashOutsData, setCashOutsData] = useState<CashOut[]>(cashOuts);
  const [expensesData, setExpensesData] = useState<Expense[]>(expenses);
  const [expenseTypesData, setExpenseTypesData] = useState<ExpenseType[]>(expenseTypes);
  const [expenseCategoriesData, setExpenseCategoriesData] =
    useState<ExpenseCategory[]>(expenseCategories);

  // CashBooks filters
  const [cashbookFilters, setCashbookFilters] = useState<FilterOption[]>([]);
  const [cashbookDateRange, setCashbookDateRange] = useState<Range>(defaultDateRange);
  const [appliedCashbookFilters, setAppliedCashbookFilters] = useState<FilterOption[]>([]);
  const [appliedCashbookDateRange, setAppliedCashbookDateRange] = useState<Range>(defaultDateRange);
  const [filteredCashbooks, setFilteredCashbooks] = useState<CashBook[]>(cashBooksData);

  // Cash In filters
  const [cashinFilters, setCashinFilters] = useState<FilterOption[]>([]);
  const [cashinDateRange, setCashinDateRange] = useState<Range>(defaultDateRange);
  const [appliedCashinFilters, setAppliedCashinFilters] = useState<FilterOption[]>([]);
  const [appliedCashinDateRange, setAppliedCashinDateRange] = useState<Range>(defaultDateRange);
  const [filteredCashIns, setFilteredCashIns] = useState<CashIn[]>(cashInsData);

  // Cash Out filters
  const [cashoutFilters, setCashoutFilters] = useState<FilterOption[]>([]);
  const [cashoutDateRange, setCashoutDateRange] = useState<Range>(defaultDateRange);
  const [appliedCashoutFilters, setAppliedCashoutFilters] = useState<FilterOption[]>([]);
  const [appliedCashoutDateRange, setAppliedCashoutDateRange] = useState<Range>(defaultDateRange);
  const [filteredCashOuts, setFilteredCashOuts] = useState<CashOut[]>(cashOutsData);

  // Expenses filters
  const [expenseFilters, setExpenseFilters] = useState<FilterOption[]>([]);
  const [expenseDateRange, setExpenseDateRange] = useState<Range>(defaultDateRange);
  const [appliedExpenseFilters, setAppliedExpenseFilters] = useState<FilterOption[]>([]);
  const [appliedExpenseDateRange, setAppliedExpenseDateRange] = useState<Range>(defaultDateRange);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>(expensesData);

  const [selectedCashBook, setSelectedCashBook] = useState<CashBook | null>(null);
  const [isCashBookModalOpen, setIsCashBookModalOpen] = useState(false);

  const [editingCashIn, setEditingCashIn] = useState<CashIn | null>(null);
  const [isCashInModalOpen, setIsCashInModalOpen] = useState(false);
  const [cashInForm, setCashInForm] = useState({
    branch: "",
    amount: "",
    comment: "",
    status: cashInStatusOptions[0] as StatusOption<CashInStatus> | null,
  });

  const [editingCashOut, setEditingCashOut] = useState<CashOut | null>(null);
  const [isCashOutModalOpen, setIsCashOutModalOpen] = useState(false);
  const [cashOutForm, setCashOutForm] = useState({
    branch: "",
    amount: "",
    comment: "",
    status: cashOutStatusOptions[0] as StatusOption<CashOutStatus> | null,
  });

  const [editingExpenseType, setEditingExpenseType] = useState<ExpenseType | null>(null);
  const [isExpenseTypeModalOpen, setIsExpenseTypeModalOpen] = useState(false);
  const [expenseTypeForm, setExpenseTypeForm] = useState({
    title: "",
    category: "",
    amount: "",
  });

  const [editingExpenseCategory, setEditingExpenseCategory] = useState<ExpenseCategory | null>(null);
  const [isExpenseCategoryModalOpen, setIsExpenseCategoryModalOpen] = useState(false);
  const [expenseCategoryForm, setExpenseCategoryForm] = useState({
    title: "",
    description: "",
  });

  // Handle filter selection with one-per-group constraint
  const handleMultiSelectChange = useCallback((selected: MultiValue<FilterOption>) => {
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
    return Array.from(categoryMap.values());
  }, []);

  const filterCashbooks = useCallback(
    (filters: FilterOption[], range: Range) => {
      return cashBooksData.filter((row) => {
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
    [cashBooksData]
  );

  const filterCashIns = useCallback(
    (filters: FilterOption[], range: Range) => {
      return cashInsData.filter((row) => {
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
    [cashInsData]
  );

  const filterCashOuts = useCallback(
    (filters: FilterOption[], range: Range) => {
      return cashOutsData.filter((row) => {
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
    [cashOutsData]
  );

  const filterExpenses = useCallback(
    (filters: FilterOption[], range: Range) => {
      return expensesData.filter((row) => {
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
    [expensesData]
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
    switch (activeTab) {
      case "cashbooks": {
        const nextRange =
          cashbookDateRange.startDate && cashbookDateRange.endDate
            ? cashbookDateRange
            : defaultDateRange;
        setAppliedCashbookFilters(cashbookFilters);
        setAppliedCashbookDateRange(nextRange);
        break;
      }
      case "cashin": {
        const nextRange =
          cashinDateRange.startDate && cashinDateRange.endDate
            ? cashinDateRange
            : defaultDateRange;
        setAppliedCashinFilters(cashinFilters);
        setAppliedCashinDateRange(nextRange);
        break;
      }
      case "cashout": {
        const nextRange =
          cashoutDateRange.startDate && cashoutDateRange.endDate
            ? cashoutDateRange
            : defaultDateRange;
        setAppliedCashoutFilters(cashoutFilters);
        setAppliedCashoutDateRange(nextRange);
        break;
      }
      case "expenses": {
        const nextRange =
          expenseDateRange.startDate && expenseDateRange.endDate
            ? expenseDateRange
            : defaultDateRange;
        setAppliedExpenseFilters(expenseFilters);
        setAppliedExpenseDateRange(nextRange);
        break;
      }
      default:
        break;
    }
  };

  const clearFilters = () => {
    switch (activeTab) {
      case "cashbooks":
        setCashbookFilters([]);
        setCashbookDateRange(defaultDateRange);
        setAppliedCashbookFilters([]);
        setAppliedCashbookDateRange(defaultDateRange);
        setFilteredCashbooks(cashBooksData);
        break;
      case "cashin":
        setCashinFilters([]);
        setCashinDateRange(defaultDateRange);
        setAppliedCashinFilters([]);
        setAppliedCashinDateRange(defaultDateRange);
        setFilteredCashIns(cashInsData);
        break;
      case "cashout":
        setCashoutFilters([]);
        setCashoutDateRange(defaultDateRange);
        setAppliedCashoutFilters([]);
        setAppliedCashoutDateRange(defaultDateRange);
        setFilteredCashOuts(cashOutsData);
        break;
      case "expenses":
        setExpenseFilters([]);
        setExpenseDateRange(defaultDateRange);
        setAppliedExpenseFilters([]);
        setAppliedExpenseDateRange(defaultDateRange);
        setFilteredExpenses(expensesData);
        break;
      default:
        break;
    }
  };

  const handleViewCashBook = useCallback((row: CashBook) => {
    setSelectedCashBook(row);
    setIsCashBookModalOpen(true);
  }, []);

  const closeCashBookModal = useCallback(() => {
    setIsCashBookModalOpen(false);
    setSelectedCashBook(null);
  }, []);

  const handleCreateCashIn = useCallback(() => {
    setEditingCashIn(null);
    setCashInForm({
      branch: cashInsData[0]?.branch ?? "",
      amount: "",
      comment: "",
      status: cashInStatusOptions[0],
    });
    setIsCashInModalOpen(true);
  }, [cashInsData]);

  const closeCashInModal = useCallback(() => {
    setIsCashInModalOpen(false);
    setEditingCashIn(null);
  }, []);

  const handleEditCashIn = useCallback((row: CashIn) => {
    setEditingCashIn(row);
    setCashInForm({
      branch: row.branch,
      amount: row.amount.toString(),
      comment: row.comment,
      status: cashInStatusOptions.find((option) => option.value === row.status) ?? cashInStatusOptions[0],
    });
    setIsCashInModalOpen(true);
  }, []);

  const handleSaveCashIn = useCallback(() => {
    if (!cashInForm.branch.trim()) {
      alert("Please provide a branch.");
      return;
    }

    const amountValue = Number(cashInForm.amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    setCashInsData((prev) => {
      if (editingCashIn) {
        return prev.map((item) =>
          item.id === editingCashIn.id
            ? {
                ...item,
                branch: cashInForm.branch,
                amount: amountValue,
                comment: cashInForm.comment,
                status: (cashInForm.status?.value ?? item.status) as CashInStatus,
              }
            : item
        );
      }

      const newEntry: CashIn = {
        id: `cashin-${Date.now()}`,
        date: new Date().toISOString(),
        branch: cashInForm.branch,
        amount: amountValue,
        comment: cashInForm.comment,
        status: (cashInForm.status?.value ?? "Pending") as CashInStatus,
      };
      return [newEntry, ...prev];
    });

    setIsCashInModalOpen(false);
    setEditingCashIn(null);
  }, [cashInForm, editingCashIn]);

  const handleDeleteCashIn = useCallback((row: CashIn) => {
    const confirmed = window.confirm(`Delete cash in record for ${row.branch}?`);
    if (!confirmed) return;
    setCashInsData((prev) => prev.filter((item) => item.id !== row.id));
    setFilteredCashIns((prev) => prev.filter((item) => item.id !== row.id));
  }, []);

  const handleCreateCashOut = useCallback(() => {
    setEditingCashOut(null);
    setCashOutForm({
      branch: cashOutsData[0]?.branch ?? "",
      amount: "",
      comment: "",
      status: cashOutStatusOptions[0],
    });
    setIsCashOutModalOpen(true);
  }, [cashOutsData]);

  const closeCashOutModal = useCallback(() => {
    setIsCashOutModalOpen(false);
    setEditingCashOut(null);
  }, []);

  const handleEditCashOut = useCallback((row: CashOut) => {
    setEditingCashOut(row);
    setCashOutForm({
      branch: row.branch,
      amount: row.amount.toString(),
      comment: row.comment,
      status: cashOutStatusOptions.find((option) => option.value === row.status) ?? cashOutStatusOptions[0],
    });
    setIsCashOutModalOpen(true);
  }, []);

  const handleSaveCashOut = useCallback(() => {
    if (!cashOutForm.branch.trim()) {
      alert("Please provide a branch.");
      return;
    }

    const amountValue = Number(cashOutForm.amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    setCashOutsData((prev) => {
      if (editingCashOut) {
        return prev.map((item) =>
          item.id === editingCashOut.id
            ? {
                ...item,
                branch: cashOutForm.branch,
                amount: amountValue,
                comment: cashOutForm.comment,
                status: (cashOutForm.status?.value ?? item.status) as CashOutStatus,
              }
            : item
        );
      }

      const newEntry: CashOut = {
        id: `cashout-${Date.now()}`,
        date: new Date().toISOString(),
        branch: cashOutForm.branch,
        amount: amountValue,
        comment: cashOutForm.comment,
        status: (cashOutForm.status?.value ?? "Pending") as CashOutStatus,
      };
      return [newEntry, ...prev];
    });

    setIsCashOutModalOpen(false);
    setEditingCashOut(null);
  }, [cashOutForm, editingCashOut]);

  const handleDeleteCashOut = useCallback((row: CashOut) => {
    const confirmed = window.confirm(`Delete cash out record for ${row.branch}?`);
    if (!confirmed) return;
    setCashOutsData((prev) => prev.filter((item) => item.id !== row.id));
    setFilteredCashOuts((prev) => prev.filter((item) => item.id !== row.id));
  }, []);

  const handleApproveExpense = useCallback((row: Expense) => {
    setExpensesData((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? {
              ...item,
              status: "Approved",
              approvedBy: "System Admin",
              approvedAt: new Date().toISOString(),
            }
          : item
      )
    );
  }, []);

  const handleRejectExpense = useCallback((row: Expense) => {
    setExpensesData((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? {
              ...item,
              status: "Rejected",
              approvedBy: "System Admin",
              approvedAt: new Date().toISOString(),
            }
          : item
      )
    );
  }, []);

  const handleCreateExpenseType = useCallback(() => {
    setEditingExpenseType(null);
    setExpenseTypeForm({
      title: "",
      category: "",
      amount: "",
    });
    setIsExpenseTypeModalOpen(true);
  }, []);

  const closeExpenseTypeModal = useCallback(() => {
    setIsExpenseTypeModalOpen(false);
    setEditingExpenseType(null);
  }, []);

  const handleEditExpenseType = useCallback((row: ExpenseType) => {
    setEditingExpenseType(row);
    setExpenseTypeForm({
      title: row.title,
      category: row.category,
      amount: row.amount.toString(),
    });
    setIsExpenseTypeModalOpen(true);
  }, []);

  const handleSaveExpenseType = useCallback(() => {
    if (!expenseTypeForm.title.trim() || !expenseTypeForm.category.trim()) {
      alert("Please provide title and category.");
      return;
    }

    const amountValue = Number(expenseTypeForm.amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    setExpenseTypesData((prev) => {
      if (editingExpenseType) {
        return prev.map((item) =>
          item.id === editingExpenseType.id
            ? {
                ...item,
                title: expenseTypeForm.title,
                category: expenseTypeForm.category,
                amount: amountValue,
              }
            : item
        );
      }

      const newEntry: ExpenseType = {
        id: `expense-type-${Date.now()}`,
        title: expenseTypeForm.title,
        category: expenseTypeForm.category,
        amount: amountValue,
      };

      return [newEntry, ...prev];
    });

    setIsExpenseTypeModalOpen(false);
    setEditingExpenseType(null);
  }, [editingExpenseType, expenseTypeForm]);

  const handleDeleteExpenseType = useCallback((row: ExpenseType) => {
    const confirmed = window.confirm(`Delete expense type "${row.title}"?`);
    if (!confirmed) return;
    setExpenseTypesData((prev) => prev.filter((item) => item.id !== row.id));
  }, []);

  const handleCreateExpenseCategory = useCallback(() => {
    setEditingExpenseCategory(null);
    setExpenseCategoryForm({
      title: "",
      description: "",
    });
    setIsExpenseCategoryModalOpen(true);
  }, []);

  const closeExpenseCategoryModal = useCallback(() => {
    setIsExpenseCategoryModalOpen(false);
    setEditingExpenseCategory(null);
  }, []);

  const handleEditExpenseCategory = useCallback((row: ExpenseCategory) => {
    setEditingExpenseCategory(row);
    setExpenseCategoryForm({
      title: row.title,
      description: row.description,
    });
    setIsExpenseCategoryModalOpen(true);
  }, []);

  const handleSaveExpenseCategory = useCallback(() => {
    if (!expenseCategoryForm.title.trim()) {
      alert("Please provide a title.");
      return;
    }

    setExpenseCategoriesData((prev) => {
      if (editingExpenseCategory) {
        return prev.map((item) =>
          item.id === editingExpenseCategory.id
            ? {
                ...item,
                title: expenseCategoryForm.title,
                description: expenseCategoryForm.description,
              }
            : item
        );
      }

      const newEntry: ExpenseCategory = {
        id: `expense-category-${Date.now()}`,
        title: expenseCategoryForm.title,
        description: expenseCategoryForm.description,
      };
      return [newEntry, ...prev];
    });

    setIsExpenseCategoryModalOpen(false);
    setEditingExpenseCategory(null);
  }, [editingExpenseCategory, expenseCategoryForm]);

  const handleDeleteExpenseCategory = useCallback((row: ExpenseCategory) => {
    const confirmed = window.confirm(`Delete expense category "${row.title}"?`);
    if (!confirmed) return;
    setExpenseCategoriesData((prev) => prev.filter((item) => item.id !== row.id));
  }, []);

  const cashbookColumns = useMemo(
    () =>
      createCashbooksColumns({
        onView: handleViewCashBook,
      }),
    [handleViewCashBook]
  );

  const cashInColumns = useMemo(
    () =>
      createCashinColumns({
        onEdit: handleEditCashIn,
        onDelete: handleDeleteCashIn,
      }),
    [handleDeleteCashIn, handleEditCashIn]
  );

  const cashOutColumns = useMemo(
    () =>
      createCashoutColumns({
        onEdit: handleEditCashOut,
        onDelete: handleDeleteCashOut,
      }),
    [handleDeleteCashOut, handleEditCashOut]
  );

  const expensesColumns = useMemo(
    () =>
      createExpensesColumns({
        onApprove: handleApproveExpense,
        onReject: handleRejectExpense,
      }),
    [handleApproveExpense, handleRejectExpense]
  );

  const expenseTypeColumns = useMemo(
    () =>
      createExpenseTypeColumns({
        onEdit: handleEditExpenseType,
        onDelete: handleDeleteExpenseType,
      }),
    [handleDeleteExpenseType, handleEditExpenseType]
  );

  const expenseCategoryColumns = useMemo(
    () =>
      createExpenseCategoryColumns({
        onEdit: handleEditExpenseCategory,
        onDelete: handleDeleteExpenseCategory,
      }),
    [handleDeleteExpenseCategory, handleEditExpenseCategory]
  );

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
          <div className="mb-6">
            <TableFilterToolbar<FilterOption, true, GroupBase<FilterOption>>
              dateRange={cashbookDateRange}
              onDateRangeChange={setCashbookDateRange}
              actions={{
                onSearch: applyFilters,
                onClear: clearFilters,
              }}
              selectProps={{
                containerClassName: "max-w-[22rem]",
                options: cashbookFilterOptions,
                placeholder: "Filter by Branch, Status",
                value: cashbookFilters,
                onChange: (selected: MultiValue<FilterOption>) =>
                  setCashbookFilters(handleMultiSelectChange(selected)),
                isMulti: true,
              }}
            />          
          </div>

          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 dark:border-gray-700">
              <h2 className="text-base font-semibold text-white">Cashbooks</h2>
            </div>
            <div className="p-4">
              <DataTable columns={cashbookColumns} data={filteredCashbooks} />
            </div>
          </div>
        </TabsContent>

        {/* Cash In Tab */}
        <TabsContent value="cashin" className="mt-0">
          <div className="mb-6 flex flex-col space-y-2">
            <div className="flex flex-wrap items-center gap-4 self-end">
              <button
                type="button"
                onClick={handleCreateCashIn}
                className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>              
            </div>
            <TableFilterToolbar<FilterOption, true, GroupBase<FilterOption>>
              dateRange={cashinDateRange}
              onDateRangeChange={setCashinDateRange}
              actions={{
                onSearch: applyFilters,
                onClear: clearFilters,
              }}
              selectProps={{
                containerClassName: "max-w-[22rem]",
                options: cashinCashoutFilterOptions,
                placeholder: "Filter by Branch, Status",
                value: cashinFilters,
                onChange: (selected: MultiValue<FilterOption>) =>
                  setCashinFilters(handleMultiSelectChange(selected)),
                isMulti: true,
              }}
            />  

          </div>

          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 dark:border-gray-700">
              <h2 className="text-base font-semibold text-white">Cash In</h2>
            </div>
            <div className="p-4">
              <DataTable columns={cashInColumns} data={filteredCashIns} />
            </div>
          </div>
        </TabsContent>

        {/* Cash Out Tab */}
        <TabsContent value="cashout">
          <div className="mb-6 flex flex-col space-y-2">
            <div className="flex flex-wrap items-center justify-end gap-4">
              <button
                type="button"
                onClick={handleCreateCashOut}
                className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
            <TableFilterToolbar<FilterOption, true, GroupBase<FilterOption>>
              dateRange={cashoutDateRange}
              onDateRangeChange={setCashoutDateRange}
              actions={{
                onSearch: applyFilters,
                onClear: clearFilters,
              }}
              selectProps={{
                containerClassName: "max-w-[22rem]",
                options: cashinCashoutFilterOptions,
                placeholder: "Filter by Branch, Status",
                value: cashoutFilters,
                onChange: (selected: MultiValue<FilterOption>) =>
                  setCashoutFilters(handleMultiSelectChange(selected)),
                isMulti: true,
              }}
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 dark:border-gray-700">
              <h2 className="text-base font-semibold text-white">Cash Out</h2>
            </div>
            <div className="p-4">
              <DataTable columns={cashOutColumns} data={filteredCashOuts} />
            </div>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-4">
         
            <TableFilterToolbar<FilterOption, true, GroupBase<FilterOption>>
              dateRange={expenseDateRange}
              onDateRangeChange={setExpenseDateRange}
              actions={{
                onSearch: applyFilters,
                onClear: clearFilters,
              }}
              selectProps={{
                containerClassName: "max-w-[22rem]",
                options: expenseFilterOptions,
                placeholder: "Filter by Branch, Status",
                value: expenseFilters,
                onChange: (selected: MultiValue<FilterOption>) =>
                  setExpenseFilters(handleMultiSelectChange(selected)),
                isMulti: true,
              }}
            />
          

          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 mt-4">
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
                <button
                  type="button"
                  onClick={handleCreateExpenseType}
                  className="inline-flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                >
                  New Expense Type
                </button>
              </div>
              <div className="p-4">
                <DataTable columns={expenseTypeColumns} data={expenseTypesData} />
              </div>
            </div>

            {/* Expense Category */}
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Expense Category
                </h3>
                <button
                  type="button"
                  onClick={handleCreateExpenseCategory}
                  className="inline-flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                >
                  New Expense Category
                </button>
              </div>
              <div className="p-4">
                <DataTable columns={expenseCategoryColumns} data={expenseCategoriesData} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Modal isOpen={isCashBookModalOpen} onClose={closeCashBookModal} size="md">
        <ModalHeader>Cashbook Summary</ModalHeader>
        <ModalBody>
          {selectedCashBook && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Date</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{selectedCashBook.date}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Branch</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{selectedCashBook.branch}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Normal Sales</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ₦{selectedCashBook.normalSales.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Normal Payout</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ₦{selectedCashBook.normalPayout.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Virtual Sales</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ₦{selectedCashBook.virtualSales.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Virtual Payout</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ₦{selectedCashBook.virtualPayout.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/60">
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Closing Balance</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  ₦{selectedCashBook.closingBalance.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={closeCashBookModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isCashInModalOpen} onClose={closeCashInModal} size="md">
        <ModalHeader>{editingCashIn ? "Edit Cash In" : "Add Cash In"}</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              handleSaveCashIn();
            }}
            className="space-y-4"
          >
            <div>
              <Label>Branch</Label>
              <Input
                value={cashInForm.branch}
                onChange={(event) =>
                  setCashInForm((prev) => ({ ...prev, branch: event.target.value }))
                }
                placeholder="Branch name"
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                min={0}
                value={cashInForm.amount}
                onChange={(event) =>
                  setCashInForm((prev) => ({ ...prev, amount: event.target.value }))
                }
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label>Comment</Label>
              <TextArea
                rows={3}
                value={cashInForm.comment}
                onChange={(value) => setCashInForm((prev) => ({ ...prev, comment: value }))}
                placeholder="Add notes"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select<StatusOption<CashInStatus>, false>
                styles={reactSelectStyles(theme)}
                options={cashInStatusOptions}
                value={cashInForm.status}
                onChange={(option) =>
                  setCashInForm((prev) => ({ ...prev, status: option ?? cashInStatusOptions[0] }))
                }
              />
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={closeCashInModal}>
            Cancel
          </Button>
          <Button onClick={handleSaveCashIn}>{editingCashIn ? "Update" : "Save"}</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isCashOutModalOpen} onClose={closeCashOutModal} size="md">
        <ModalHeader>{editingCashOut ? "Edit Cash Out" : "Add Cash Out"}</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              handleSaveCashOut();
            }}
            className="space-y-4"
          >
            <div>
              <Label>Branch</Label>
              <Input
                value={cashOutForm.branch}
                onChange={(event) =>
                  setCashOutForm((prev) => ({ ...prev, branch: event.target.value }))
                }
                placeholder="Branch name"
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                min={0}
                value={cashOutForm.amount}
                onChange={(event) =>
                  setCashOutForm((prev) => ({ ...prev, amount: event.target.value }))
                }
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label>Comment</Label>
              <TextArea
                rows={3}
                value={cashOutForm.comment}
                onChange={(value) => setCashOutForm((prev) => ({ ...prev, comment: value }))}
                placeholder="Add notes"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select<StatusOption<CashOutStatus>, false>
                styles={reactSelectStyles(theme)}
                options={cashOutStatusOptions}
                value={cashOutForm.status}
                onChange={(option) =>
                  setCashOutForm((prev) => ({ ...prev, status: option ?? cashOutStatusOptions[0] }))
                }
              />
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={closeCashOutModal}>
            Cancel
          </Button>
          <Button onClick={handleSaveCashOut}>{editingCashOut ? "Update" : "Save"}</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isExpenseTypeModalOpen} onClose={closeExpenseTypeModal} size="md">
        <ModalHeader>{editingExpenseType ? "Edit Expense Type" : "New Expense Type"}</ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              handleSaveExpenseType();
            }}
            className="space-y-4"
          >
            <div>
              <Label>Title</Label>
              <Input
                value={expenseTypeForm.title}
                onChange={(event) =>
                  setExpenseTypeForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Expense title"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={expenseTypeForm.category}
                onChange={(event) =>
                  setExpenseTypeForm((prev) => ({ ...prev, category: event.target.value }))
                }
                placeholder="Category"
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                min={0}
                value={expenseTypeForm.amount}
                onChange={(event) =>
                  setExpenseTypeForm((prev) => ({ ...prev, amount: event.target.value }))
                }
                placeholder="0.00"
              />
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={closeExpenseTypeModal}>
            Cancel
          </Button>
          <Button onClick={handleSaveExpenseType}>{editingExpenseType ? "Update" : "Save"}</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isExpenseCategoryModalOpen} onClose={closeExpenseCategoryModal} size="md">
        <ModalHeader>
          {editingExpenseCategory ? "Edit Expense Category" : "New Expense Category"}
        </ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(event) => {
              event.preventDefault();
              handleSaveExpenseCategory();
            }}
            className="space-y-4"
          >
            <div>
              <Label>Title</Label>
              <Input
                value={expenseCategoryForm.title}
                onChange={(event) =>
                  setExpenseCategoryForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Category title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <TextArea
                rows={3}
                value={expenseCategoryForm.description}
                onChange={(value) =>
                  setExpenseCategoryForm((prev) => ({ ...prev, description: value }))
                }
                placeholder="Describe this category"
              />
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={closeExpenseCategoryModal}>
            Cancel
          </Button>
          <Button onClick={handleSaveExpenseCategory}>
            {editingExpenseCategory ? "Update" : "Save"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default withAuth(CashBooksPage);

