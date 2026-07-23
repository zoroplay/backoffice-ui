"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GETREQUEST, POSTREQUEST, DELETEREQUEST } from "@/utils/base_request";
import { withAuth } from "@/utils/withAuth";

type AnyRecord = Record<string, any>;
type CashflowTab = "cashbooks" | "cash-in" | "cash-out" | "expenses" | "settings";
type ModalType = "cash-in" | "cash-out" | "expense" | "expense-type" | "expense-category" | null;

const tabs: Array<{ value: CashflowTab; label: string }> = [
  { value: "cashbooks", label: "CashBooks" },
  { value: "cash-in", label: "Cash In" },
  { value: "cash-out", label: "Cash Out" },
  { value: "expenses", label: "Expenses" },
  { value: "settings", label: "Settings" },
];

const statusOptions = [
  { value: "", label: "All" },
  { value: "1", label: "Approved" },
  { value: "0", label: "Pending" },
];

function clientId() {
  return process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
}

function todayDmy() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(new Date())
    .replace(/\//g, "-");
}

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? (value as AnyRecord) : {};
}

function recordsFrom(value: unknown): AnyRecord[] {
  const body = asRecord(value);
  const data = body.data;
  if (Array.isArray(data)) return data.map(asRecord);
  if (Array.isArray(data?.data)) return data.data.map(asRecord);
  if (Array.isArray(body.results)) return body.results.map(asRecord);
  if (Array.isArray(value)) return value.map(asRecord);
  return [];
}

function successFrom(value: unknown) {
  const body = asRecord(value);
  return body.success !== false;
}

function messageFrom(value: unknown, fallback: string) {
  const body = asRecord(value);
  return String(body.message || body.error || fallback);
}

function rowValue(row: AnyRecord, keys: string[], fallback = "-") {
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return fallback;
}

function branchName(row: AnyRecord) {
  const branch = asRecord(row.branch);
  return String(rowValue(branch, ["username", "name", "email"], rowValue(row, ["branch_name", "branchName", "branch_id"], "Not Available")));
}

function statusLabel(value: unknown) {
  const status = String(value ?? "");
  if (status === "1" || status.toLowerCase() === "approved") return "Approved";
  if (status === "2" || status.toLowerCase() === "rejected") return "Rejected";
  return "Pending";
}

function statusClass(value: unknown) {
  const label = statusLabel(value);
  if (label === "Approved") return "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300";
  if (label === "Rejected") return "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300";
  return "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
}

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB").format(date);
}

function money(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? `NGN ${amount.toLocaleString()}` : String(value ?? "-");
}

const blankMovementForm = {
  date: todayDmy(),
  branch_id: "",
  amount: "",
  comment: "",
};

function CashflowPage() {
  const [activeTab, setActiveTab] = useState<CashflowTab>("cashbooks");
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<AnyRecord[]>([]);
  const [cashbooks, setCashbooks] = useState<AnyRecord[]>([]);
  const [cashIns, setCashIns] = useState<AnyRecord[]>([]);
  const [cashOuts, setCashOuts] = useState<AnyRecord[]>([]);
  const [expenses, setExpenses] = useState<AnyRecord[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<AnyRecord[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<AnyRecord[]>([]);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [saving, setSaving] = useState(false);
  const [movementForm, setMovementForm] = useState(blankMovementForm);
  const [expenseForm, setExpenseForm] = useState({
    expense_type_id: "",
    branch_id: "",
    amount: "",
    comment: "",
  });
  const [expenseTypeForm, setExpenseTypeForm] = useState({
    title: "",
    category_id: "",
    amount: "",
  });
  const [expenseCategoryForm, setExpenseCategoryForm] = useState({
    title: "",
    description: "",
  });
  const [filters, setFilters] = useState({
    branch_id: "",
    status: "",
    date: todayDmy(),
    start_date: todayDmy(),
    end_date: todayDmy(),
  });

  const agentOptions = useMemo(
    () =>
      agents.map((agent) => ({
        id: String(rowValue(agent, ["id"], "")),
        name: String(rowValue(agent, ["name", "username", "email"], "Unnamed branch")),
      })),
    [agents]
  );

  const loadAgents = useCallback(async () => {
    const response = await POSTREQUEST<any>(`/admin/retail/${clientId()}/agents`, {});
    if (!response.ok || !successFrom(response.data)) {
      toast.error(response.error || messageFrom(response.data, "Unable to fetch branches"));
      return;
    }
    setAgents(recordsFrom(response.data));
  }, []);

  const loadCashbooks = useCallback(async () => {
    const response = await GETREQUEST<any>("shop/cashbook/all-shops");
    if (!response.ok || !successFrom(response.data)) {
      toast.error(response.error || messageFrom(response.data, "Unable to fetch cashbooks"));
      setCashbooks([]);
      return;
    }
    setCashbooks(recordsFrom(response.data));
  }, []);

  const loadCashIn = useCallback(async () => {
    const response = await GETREQUEST<any>("/api/cash-in");
    if (!response.ok || !successFrom(response.data)) {
      toast.error(response.error || messageFrom(response.data, "Unable to fetch cash in"));
      setCashIns([]);
      return;
    }
    setCashIns(recordsFrom(response.data));
  }, []);

  const loadCashOut = useCallback(async () => {
    const response = await GETREQUEST<any>("/api/cash-out");
    if (!response.ok || !successFrom(response.data)) {
      toast.error(response.error || messageFrom(response.data, "Unable to fetch cash out"));
      setCashOuts([]);
      return;
    }
    setCashOuts(recordsFrom(response.data));
  }, []);

  const loadExpenses = useCallback(async () => {
    const response = await GETREQUEST<any>("/api/expenses");
    if (!response.ok || !successFrom(response.data)) {
      toast.error(response.error || messageFrom(response.data, "Unable to fetch expenses"));
      setExpenses([]);
      return;
    }
    setExpenses(recordsFrom(response.data));
  }, []);

  const loadExpenseSettings = useCallback(async () => {
    const [categoriesResponse, typesResponse] = await Promise.all([
      GETREQUEST<any>("/api/expenses/categories"),
      GETREQUEST<any>("/api/expenses/types"),
    ]);

    if (!categoriesResponse.ok || !successFrom(categoriesResponse.data)) {
      toast.error(categoriesResponse.error || messageFrom(categoriesResponse.data, "Unable to fetch expense categories"));
      setExpenseCategories([]);
    } else {
      setExpenseCategories(recordsFrom(categoriesResponse.data));
    }

    if (!typesResponse.ok || !successFrom(typesResponse.data)) {
      toast.error(typesResponse.error || messageFrom(typesResponse.data, "Unable to fetch expense types"));
      setExpenseTypes([]);
    } else {
      setExpenseTypes(recordsFrom(typesResponse.data));
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadAgents(), loadCashbooks(), loadCashIn(), loadCashOut(), loadExpenses(), loadExpenseSettings()]);
    setLoading(false);
  }, [loadAgents, loadCashbooks, loadCashIn, loadCashOut, loadExpenses, loadExpenseSettings]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  async function saveMovement(kind: "cash-in" | "cash-out") {
    if (!movementForm.branch_id || !movementForm.amount) {
      toast.error("Branch and amount are required");
      return;
    }

    setSaving(true);
    const endpoint = kind === "cash-in" ? "/api/cash-in/store" : "/api/cash-out/store";
    const response = await POSTREQUEST<any>(endpoint, movementForm);
    setSaving(false);

    if (!response.ok || !successFrom(response.data)) {
      toast.error(response.error || messageFrom(response.data, "An Error occured!"));
      return;
    }

    toast.success(kind === "cash-in" ? "CashIn saved!" : "CashOut saved!");
    closeModal();
    await (kind === "cash-in" ? loadCashIn() : loadCashOut());
  }

  async function saveExpense() {
    if (!expenseForm.expense_type_id || !expenseForm.branch_id || !expenseForm.amount) {
      toast.error("Expense, branch, and amount are required");
      return;
    }

    setSaving(true);
    const response = await POSTREQUEST<any>("/api/expenses/store", expenseForm);
    setSaving(false);

    if (!response.ok || !successFrom(response.data)) {
      toast.error(response.error || messageFrom(response.data, "An Error occured!"));
      return;
    }

    toast.success("Transaction was successful");
    closeModal();
    await loadExpenses();
  }

  async function saveExpenseCategory() {
    if (!expenseCategoryForm.title) {
      toast.error("Category title is required");
      return;
    }

    setSaving(true);
    const response = await POSTREQUEST<any>("/api/expenses/categories/store", expenseCategoryForm);
    setSaving(false);

    if (!response.ok || !successFrom(response.data)) {
      toast.error(response.error || messageFrom(response.data, "Unable to save category"));
      return;
    }

    toast.success("Expense category saved");
    closeModal();
    await loadExpenseSettings();
  }

  async function saveExpenseType() {
    if (!expenseTypeForm.title || !expenseTypeForm.category_id || !expenseTypeForm.amount) {
      toast.error("Title, category, and amount are required");
      return;
    }

    setSaving(true);
    const response = await POSTREQUEST<any>("/api/expenses/types/store", expenseTypeForm);
    setSaving(false);

    if (!response.ok || !successFrom(response.data)) {
      toast.error(response.error || messageFrom(response.data, "Unable to save expense type"));
      return;
    }

    toast.success("Expense type saved");
    closeModal();
    await loadExpenseSettings();
  }

  async function updateCashIn(id: unknown, status: "approve" | "reject", row: AnyRecord) {
    if (!window.confirm("You will not be able to undo this action")) return;

    setLoading(true);
    const response = await POSTREQUEST<any>(`api/cash-in/update/${id}/${status}`, row);
    setLoading(false);

    if (!response.ok || !successFrom(response.data)) {
      toast.error(response.error || messageFrom(response.data, "Unable to update item"));
      return;
    }

    toast.success("Item has been updated");
    await loadCashIn();
  }

  async function updateExpense(id: unknown, status: "approve" | "reject") {
    if (!window.confirm("You will not be able to undo this action")) return;

    setLoading(true);
    const response = await POSTREQUEST<any>(`/api/expenses/update/${id}/${status}`, {});
    setLoading(false);

    if (!response.ok || !successFrom(response.data)) {
      toast.error(response.error || messageFrom(response.data, "Unable to update expense"));
      return;
    }

    toast.success("Transaction was successful");
    await loadExpenses();
  }

  async function deleteRow(kind: "cash-in" | "cash-out" | "expense", id: unknown) {
    if (!window.confirm("You will not be able to recover this item")) return;

    const endpoints = {
      "cash-in": `/api/cash-in/delete/${id}`,
      "cash-out": `/api/cash-out/delete/${id}`,
      expense: `/api/expenses/delete/${id}`,
    };

    setLoading(true);
    const response = await DELETEREQUEST<any>(endpoints[kind]);
    setLoading(false);

    if (!response.ok || !successFrom(response.data)) {
      toast.error(response.error || messageFrom(response.data, "Unable to delete item"));
      return;
    }

    toast.success("Item has been removed");
    if (kind === "cash-in") await loadCashIn();
    if (kind === "cash-out") await loadCashOut();
    if (kind === "expense") await loadExpenses();
  }

  function openMovementModal(kind: "cash-in" | "cash-out") {
    setMovementForm(blankMovementForm);
    setModalType(kind);
  }

  function closeModal() {
    setModalType(null);
    setMovementForm(blankMovementForm);
    setExpenseForm({ expense_type_id: "", branch_id: "", amount: "", comment: "" });
    setExpenseTypeForm({ title: "", category_id: "", amount: "" });
    setExpenseCategoryForm({ title: "", description: "" });
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Cash Books" />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Cashflow</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage branch cashbooks, cash-in, cash-out, expenses, and expense settings using the Nuxt banking workflows.
            </p>
          </div>
          <Button type="button" variant="outline" startIcon={<RefreshCw size={16} />} onClick={() => void refreshAll()} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CashflowTab)}>
        <TabsList className="h-auto flex-wrap rounded-lg border border-gray-200 bg-gray-50 p-1.5 dark:border-gray-800 dark:bg-gray-900">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="rounded-md px-4 py-2 text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="cashbooks" className="mt-4 space-y-4">
          <CashbookFilters filters={filters} agents={agentOptions} onChange={setFilters} onApply={() => void loadCashbooks()} />
          <Section title="Cashbooks">
            <Table
              columns={["Date", "Branch", "Normal Sales", "Normal Payout", "Virtual Sales", "Virtual Payout", "Closing Balance", "Status"]}
              rows={cashbooks.map((row) => [
                filters.date,
                rowValue(row, ["username", "name"], branchName(row)),
                money(asRecord(row.report).normal_sales),
                money(asRecord(row.report).normal_payout),
                money(asRecord(row.report).virtual_sales),
                money(asRecord(row.report).virtual_payout),
                money(asRecord(row.report).closing_balance),
                "",
              ])}
              loading={loading}
            />
          </Section>
        </TabsContent>

        <TabsContent value="cash-in" className="mt-4 space-y-4">
          <MovementToolbar filters={filters} agents={agentOptions} title="Cash In" onChange={setFilters} onAdd={() => openMovementModal("cash-in")} onApply={() => void loadCashIn()} />
          <Section title="Cash In">
            <Table
              columns={["Date", "Branch", "Amount", "Comment", "Status", "Action"]}
              rows={cashIns.map((row) => [
                formatDate(row.created_at),
                branchName(row),
                money(row.amount),
                String(row.comment || "No Comment"),
                <StatusBadge key="status" value={row.status} />,
                <RowActions key="actions" pendingOnly status={row.status} onApprove={() => void updateCashIn(row.id, "approve", row)} onReject={() => void updateCashIn(row.id, "reject", row)} onDelete={() => void deleteRow("cash-in", row.id)} />,
              ])}
              loading={loading}
            />
          </Section>
        </TabsContent>

        <TabsContent value="cash-out" className="mt-4 space-y-4">
          <MovementToolbar filters={filters} agents={agentOptions} title="Cash Out" onChange={setFilters} onAdd={() => openMovementModal("cash-out")} onApply={() => void loadCashOut()} />
          <Section title="Cash Out">
            <Table
              columns={["Date", "Branch", "Amount", "Comment", "Status", "Action"]}
              rows={cashOuts.map((row) => [
                formatDate(row.created_at),
                branchName(row),
                money(row.amount),
                String(row.comment || "No Comment"),
                <StatusBadge key="status" value={row.status} />,
                <div key="actions" className="flex justify-end gap-2">
                  {String(row.status ?? "0") === "0" ? (
                    <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200" onClick={() => void deleteRow("cash-out", row.id)}>
                      Delete
                    </button>
                  ) : null}
                </div>,
              ])}
              loading={loading}
            />
          </Section>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4 space-y-4">
          <MovementToolbar filters={filters} agents={agentOptions} title="Expenses" onChange={setFilters} onAdd={() => setModalType("expense")} onApply={() => void loadExpenses()} />
          <Section title="Expenses">
            <Table
              columns={["Expense", "Branch", "Requested By", "Amount", "Status", "Approved By", "Action"]}
              rows={expenses.map((row) => [
                String(rowValue(asRecord(row.expense_type), ["title"], row.expense_type_id)),
                branchName(row),
                String(rowValue(asRecord(row.branch), ["username"], row.branch_id)),
                money(row.amount),
                <StatusBadge key="status" value={row.status} />,
                String(rowValue(asRecord(row.approved_by), ["username"], "-")),
                <RowActions key="actions" pendingOnly status={row.status} onApprove={() => void updateExpense(row.id, "approve")} onReject={() => void updateExpense(row.id, "reject")} onDelete={() => void deleteRow("expense", row.id)} />,
              ])}
              loading={loading}
            />
          </Section>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 grid gap-4 xl:grid-cols-2">
          <Section
            title="Expense Type"
            action={<Button type="button" size="sm" startIcon={<Plus size={16} />} onClick={() => setModalType("expense-type")}>New Expense Type</Button>}
          >
            <Table
              columns={["Title", "Category", "Amount", "Action"]}
              rows={expenseTypes.map((row) => [
                String(row.title ?? "-"),
                String(rowValue(asRecord(row.category), ["title"], row.category_id)),
                money(row.amount),
                <button key="edit" type="button" className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200">Edit</button>,
              ])}
              loading={loading}
            />
          </Section>
          <Section
            title="Expense Category"
            action={<Button type="button" size="sm" startIcon={<Plus size={16} />} onClick={() => setModalType("expense-category")}>New Expense Category</Button>}
          >
            <Table
              columns={["Title", "Description", "Action"]}
              rows={expenseCategories.map((row) => [
                String(row.title ?? "-"),
                String(row.description ?? "-"),
                <button key="edit" type="button" className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200">Edit</button>,
              ])}
              loading={loading}
            />
          </Section>
        </TabsContent>
      </Tabs>

      <CashflowModal
        modalType={modalType}
        agents={agentOptions}
        expenseTypes={expenseTypes}
        expenseCategories={expenseCategories}
        movementForm={movementForm}
        expenseForm={expenseForm}
        expenseTypeForm={expenseTypeForm}
        expenseCategoryForm={expenseCategoryForm}
        saving={saving}
        onClose={closeModal}
        onMovementChange={setMovementForm}
        onExpenseChange={setExpenseForm}
        onExpenseTypeChange={setExpenseTypeForm}
        onExpenseCategoryChange={setExpenseCategoryForm}
        onSaveMovement={saveMovement}
        onSaveExpense={saveExpense}
        onSaveExpenseType={saveExpenseType}
        onSaveExpenseCategory={saveExpenseCategory}
      />
    </div>
  );
}

function CashbookFilters({
  filters,
  agents,
  onChange,
  onApply,
}: {
  filters: AnyRecord;
  agents: Array<{ id: string; name: string }>;
  onChange: (filters: any) => void;
  onApply: () => void;
}) {
  return (
    <FilterShell>
      <SelectField label="Branch" value={filters.branch_id} onChange={(branch_id) => onChange((prev: AnyRecord) => ({ ...prev, branch_id }))} options={agents} />
      <TextField label="Date" value={filters.date} onChange={(date) => onChange((prev: AnyRecord) => ({ ...prev, date }))} />
      <SelectField label="Status" value={filters.status} onChange={(status) => onChange((prev: AnyRecord) => ({ ...prev, status }))} options={statusOptions} />
      <div className="flex items-end">
        <Button type="button" onClick={onApply}>Apply</Button>
      </div>
    </FilterShell>
  );
}

function MovementToolbar({
  filters,
  agents,
  title,
  onChange,
  onAdd,
  onApply,
}: {
  filters: AnyRecord;
  agents: Array<{ id: string; name: string }>;
  title: string;
  onChange: (filters: any) => void;
  onAdd: () => void;
  onApply: () => void;
}) {
  return (
    <FilterShell>
      <div className="flex items-end">
        <Button type="button" variant="outline" startIcon={<Plus size={16} />} onClick={onAdd}>Add</Button>
      </div>
      <SelectField label="Branch" value={filters.branch_id} onChange={(branch_id) => onChange((prev: AnyRecord) => ({ ...prev, branch_id }))} options={agents} />
      <TextField label="From" value={filters.start_date} onChange={(start_date) => onChange((prev: AnyRecord) => ({ ...prev, start_date }))} />
      <TextField label="To" value={filters.end_date} onChange={(end_date) => onChange((prev: AnyRecord) => ({ ...prev, end_date }))} />
      <SelectField label="Status" value={filters.status} onChange={(status) => onChange((prev: AnyRecord) => ({ ...prev, status }))} options={statusOptions} />
      <div className="flex items-end">
        <Button type="button" onClick={onApply}>Apply {title}</Button>
      </div>
    </FilterShell>
  );
}

function FilterShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">{children}</div>
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2" />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ id?: string; value?: string; name?: string; label?: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      >
        <option value="">Select ...</option>
        {options.map((option) => {
          const optionValue = String(option.id ?? option.value ?? "");
          return (
            <option key={optionValue || String(option.name ?? option.label)} value={optionValue}>
              {option.name ?? option.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Table({ columns, rows, loading }: { columns: string[]; rows: React.ReactNode[][]; loading: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {columns.map((column) => (
              <th key={column} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
          {loading ? (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
          ) : rows.length ? (
            rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">No record found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ value }: { value: unknown }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(value)}`}>{statusLabel(value)}</span>;
}

function RowActions({
  status,
  pendingOnly,
  onApprove,
  onReject,
  onDelete,
}: {
  status: unknown;
  pendingOnly?: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  const isPending = String(status ?? "0") === "0" || statusLabel(status) === "Pending";
  return (
    <div className="flex justify-end gap-2">
      {!pendingOnly || isPending ? (
        <>
          <button className="rounded-md border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 dark:border-green-500/30 dark:text-green-300" onClick={onApprove}>Approve</button>
          <button className="rounded-md border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:text-amber-300" onClick={onReject}>Reject</button>
        </>
      ) : null}
      <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 dark:border-red-500/30 dark:text-red-300" onClick={onDelete}>
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function CashflowModal({
  modalType,
  agents,
  expenseTypes,
  expenseCategories,
  movementForm,
  expenseForm,
  expenseTypeForm,
  expenseCategoryForm,
  saving,
  onClose,
  onMovementChange,
  onExpenseChange,
  onExpenseTypeChange,
  onExpenseCategoryChange,
  onSaveMovement,
  onSaveExpense,
  onSaveExpenseType,
  onSaveExpenseCategory,
}: {
  modalType: ModalType;
  agents: Array<{ id: string; name: string }>;
  expenseTypes: AnyRecord[];
  expenseCategories: AnyRecord[];
  movementForm: typeof blankMovementForm;
  expenseForm: AnyRecord;
  expenseTypeForm: AnyRecord;
  expenseCategoryForm: AnyRecord;
  saving: boolean;
  onClose: () => void;
  onMovementChange: (form: any) => void;
  onExpenseChange: (form: any) => void;
  onExpenseTypeChange: (form: any) => void;
  onExpenseCategoryChange: (form: any) => void;
  onSaveMovement: (kind: "cash-in" | "cash-out") => void;
  onSaveExpense: () => void;
  onSaveExpenseType: () => void;
  onSaveExpenseCategory: () => void;
}) {
  const title =
    modalType === "cash-in" ? "New Cash In" :
    modalType === "cash-out" ? "New Cash Out" :
    modalType === "expense" ? "New Expense" :
    modalType === "expense-type" ? "New Expense Type" :
    modalType === "expense-category" ? "New Expense Category" : "";

  return (
    <Modal isOpen={Boolean(modalType)} onClose={onClose} size="lg" closeOnBackdrop={false}>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        {modalType === "cash-in" || modalType === "cash-out" ? (
          <div className="space-y-4">
            <FormInput label="Date" value={movementForm.date} onChange={(date) => onMovementChange((prev: AnyRecord) => ({ ...prev, date }))} />
            <FormSelect label="Branch" value={movementForm.branch_id} options={agents} onChange={(branch_id) => onMovementChange((prev: AnyRecord) => ({ ...prev, branch_id }))} />
            <FormInput label="Amount" value={movementForm.amount} onChange={(amount) => onMovementChange((prev: AnyRecord) => ({ ...prev, amount }))} />
            <FormTextArea label="Comment" value={movementForm.comment} onChange={(comment) => onMovementChange((prev: AnyRecord) => ({ ...prev, comment }))} />
          </div>
        ) : null}

        {modalType === "expense" ? (
          <div className="space-y-4">
            <FormSelect
              label="Expense"
              value={expenseForm.expense_type_id}
              options={expenseTypes.map((type) => ({ id: String(type.id ?? ""), name: String(type.title ?? "Untitled") }))}
              onChange={(expense_type_id) => onExpenseChange((prev: AnyRecord) => ({ ...prev, expense_type_id }))}
            />
            <FormSelect label="Branch" value={expenseForm.branch_id} options={agents} onChange={(branch_id) => onExpenseChange((prev: AnyRecord) => ({ ...prev, branch_id }))} />
            <FormInput label="Amount" value={expenseForm.amount} onChange={(amount) => onExpenseChange((prev: AnyRecord) => ({ ...prev, amount }))} />
            <FormTextArea label="Comment" value={expenseForm.comment} onChange={(comment) => onExpenseChange((prev: AnyRecord) => ({ ...prev, comment }))} />
          </div>
        ) : null}

        {modalType === "expense-type" ? (
          <div className="space-y-4">
            <FormInput label="Title" value={expenseTypeForm.title} onChange={(title) => onExpenseTypeChange((prev: AnyRecord) => ({ ...prev, title }))} />
            <FormSelect
              label="Category"
              value={expenseTypeForm.category_id}
              options={expenseCategories.map((category) => ({ id: String(category.id ?? ""), name: String(category.title ?? "Untitled") }))}
              onChange={(category_id) => onExpenseTypeChange((prev: AnyRecord) => ({ ...prev, category_id }))}
            />
            <FormInput label="Amount" value={expenseTypeForm.amount} onChange={(amount) => onExpenseTypeChange((prev: AnyRecord) => ({ ...prev, amount }))} />
          </div>
        ) : null}

        {modalType === "expense-category" ? (
          <div className="space-y-4">
            <FormInput label="Title" value={expenseCategoryForm.title} onChange={(title) => onExpenseCategoryChange((prev: AnyRecord) => ({ ...prev, title }))} />
            <FormTextArea label="Description" value={expenseCategoryForm.description} onChange={(description) => onExpenseCategoryChange((prev: AnyRecord) => ({ ...prev, description }))} />
          </div>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          type="button"
          disabled={saving}
          onClick={() => {
            if (modalType === "cash-in" || modalType === "cash-out") onSaveMovement(modalType);
            if (modalType === "expense") onSaveExpense();
            if (modalType === "expense-type") onSaveExpenseType();
            if (modalType === "expense-category") onSaveExpenseCategory();
          }}
        >
          {saving ? "Submitting..." : "Submit"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function FormInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function FormTextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <TextArea value={value} onChange={(value) => onChange(value)} rows={3} />
    </div>
  );
}

function FormSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ id: string; name: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      >
        <option value="">Select ...</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.name}</option>
        ))}
      </select>
    </div>
  );
}

export default withAuth(CashflowPage);
