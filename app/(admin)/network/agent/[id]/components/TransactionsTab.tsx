"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import type { Agency } from "@/app/(admin)/network/agency-list/columns";
import {
  asRecord,
  clientId,
  emptyPagination,
  money,
  paginationFrom,
  rowValue,
  toNumber,
  type Pagination,
} from "@/app/(admin)/tickets/components/ticketApiHelpers";
import { GETREQUEST } from "@/utils/base_request";

type AgentUserOption = {
  id: string;
  username: string;
};

type TransactionRow = {
  id: string;
  date: string;
  transactionId: string;
  type: string;
  operationType: string;
  description: string;
  amount: number;
  balance: number;
  status: number;
};

interface TransactionsTabProps {
  agentId: string;
  agent: Agency;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function apiDate(date: Date, endOfDay = false) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${
    endOfDay ? "23:59:59" : "00:00:00"
  }`;
}

function mapUser(value: unknown, index: number): AgentUserOption {
  const user = asRecord(value);
  return {
    id: String(rowValue(user, ["id", "userId"], `user-${index}`)),
    username: String(rowValue(user, ["username"])),
  };
}

function mapTransaction(value: unknown, index: number): TransactionRow {
  const transaction = asRecord(value);
  return {
    id: String(rowValue(transaction, ["id", "transactionId"], `transaction-${index}`)),
    date: String(rowValue(transaction, ["date", "created_at", "createdAt"])),
    transactionId: String(rowValue(transaction, ["transactionId", "transaction_id", "reference"])),
    type: String(rowValue(transaction, ["type"], "")),
    operationType: String(rowValue(transaction, ["operationType", "operation_type", "subject"])),
    description: String(rowValue(transaction, ["description"])),
    amount: toNumber(transaction.amount),
    balance: toNumber(transaction.balance),
    status: toNumber(transaction.status),
  };
}

function statusLabel(status: number) {
  if (status === 0) return "Pending";
  if (status === 1) return "Completed";
  if (status === 2) return "Cancelled";
  return "-";
}

function statusClass(status: number) {
  if (status === 1) return "text-green-600 dark:text-green-300";
  if (status === 2) return "text-gray-500 dark:text-gray-400";
  return "text-amber-600 dark:text-amber-300";
}

export default function TransactionsTab({ agentId }: TransactionsTabProps) {
  const now = new Date();
  const [users, setUsers] = useState<AgentUserOption[]>([]);
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState(apiDate(now));
  const [to, setTo] = useState(apiDate(now, true));
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    setLoadingUsers(true);
    const response = await GETREQUEST<any>(
      `/admin/retail/${clientId()}/agent-users?agentId=${agentId}&page=1&user_type=`
    );
    setLoadingUsers(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) return;

    const data = body.data;
    const list = Array.isArray(data)
      ? data
      : Array.isArray(asRecord(data).data)
        ? asRecord(data).data
        : [];
    setUsers(list.map(mapUser));
  }

  async function listTransactions(page = 1) {
    if (!userId) {
      toast.error("Please select a user to list transactions");
      return;
    }

    setLoading(true);
    const response = await GETREQUEST<any>(
      `/admin/players/${userId}/transactions?clientId=${Number(clientId())}&page=${page}&startDate=${encodeURIComponent(from)}&endDate=${encodeURIComponent(to)}`
    );
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const list = Array.isArray(body.data) ? body.data : [];
    const meta = asRecord(body.meta ?? body.pagination);
    const mappedRows = list.map(mapTransaction);
    setRows(mappedRows);
    setPagination(
      paginationFrom(
        {
          total: meta.total,
          per_page: meta.perPage ?? meta.per_page,
          current_page: meta.page ?? meta.currentPage ?? meta.current_page ?? page,
          last_page: meta.lastPage ?? meta.last_page,
          from: mappedRows.length ? (page - 1) * toNumber(meta.perPage ?? meta.per_page, 20) + 1 : 0,
          to: mappedRows.length
            ? (page - 1) * toNumber(meta.perPage ?? meta.per_page, 20) + mappedRows.length
            : 0,
        },
        page,
        mappedRows.length
      )
    );
  }

  useEffect(() => {
    void loadUsers();
  }, [agentId]);

  return (
    <div className="space-y-6">
      <form
        className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950"
        onSubmit={(event) => {
          event.preventDefault();
          void listTransactions(1);
        }}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <select
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">{loadingUsers ? "Loading users" : "Select User"}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
          <input
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <input
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
            Enable Paging
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-500 px-4 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            <Search size={16} />
            Filter
          </button>
          <button
            type="button"
            onClick={() => {
              setUserId("");
              setRows([]);
              setPagination(emptyPagination);
            }}
            className="h-10 rounded-md border border-gray-300 px-4 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
          >
            Clear all filters
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {["Date", "Transaction ID", "Operation Type", "Subject", "Description", "Amount", "Balance", "Status"].map((head) => (
                <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {rows.map((transaction) => {
              const isCredit = transaction.type === "credit";
              return (
                <tr key={transaction.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{transaction.date}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{transaction.transactionId}</td>
                  <td className={`whitespace-nowrap px-4 py-3 font-medium ${isCredit ? "text-green-600 dark:text-green-300" : "text-red-600 dark:text-red-300"}`}>
                    {transaction.type || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{transaction.operationType}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{transaction.description}</td>
                  <td className={`whitespace-nowrap px-4 py-3 font-medium ${isCredit ? "text-green-600 dark:text-green-300" : "text-red-600 dark:text-red-300"}`}>
                    {isCredit ? money(transaction.amount) : `-${money(transaction.amount)}`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(transaction.balance)}</td>
                  <td className={`whitespace-nowrap px-4 py-3 font-medium ${statusClass(transaction.status)}`}>
                    {statusLabel(transaction.status)}
                  </td>
                </tr>
              );
            })}
            {!rows.length ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {loading ? "Loading transactions" : "No record found"}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <span>Showing {pagination.total ? `${pagination.from} to ${pagination.to} of ${pagination.total}` : rows.length} entries</span>
          <button type="button" disabled={pagination.current_page <= 1 || loading} onClick={() => void listTransactions(pagination.current_page - 1)} className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700">Previous</button>
          <span>Page {pagination.current_page} of {pagination.last_page ?? 1}</span>
          <button type="button" disabled={pagination.current_page >= (pagination.last_page ?? 1) || loading} onClick={() => void listTransactions(pagination.current_page + 1)} className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700">Next</button>
        </div>
      </div>
    </div>
  );
}
