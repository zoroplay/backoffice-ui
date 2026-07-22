"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Download, Lock, Send, Users } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { withAuth } from "@/utils/withAuth";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";
import {
  asRecord,
  clientId,
  money,
  paginationFrom,
  rowValue,
  toNumber,
  type AnyRecord,
  type Pagination,
} from "@/app/(admin)/tickets/components/ticketApiHelpers";

type AgencyRow = {
  id: string;
  username: string;
  name: string;
  agentType: string;
  statusCode: number;
  networkBalance: number;
  networkTrust: number;
  availableBalance: number;
  balance: number;
  commissionBalance: number;
  trustBalance: number;
  raw: AnyRecord;
};

type RoleOption = {
  id: string;
  name: string;
};

type MessageMode = "single" | "selected" | null;

const emptyPagination: Pagination = {
  total: 0,
  per_page: 20,
  from: 0,
  to: 0,
  current_page: 1,
  last_page: 1,
};

function mapAgency(value: unknown, index: number): AgencyRow {
  const agent = asRecord(value);

  return {
    id: String(rowValue(agent, ["id"], `agent-${index}`)),
    username: String(rowValue(agent, ["username"])),
    name: String(rowValue(agent, ["name"])),
    agentType: String(rowValue(agent, ["rolename", "role", "agentType"])),
    statusCode: toNumber(agent.status),
    networkBalance: toNumber(agent.network_balance ?? agent.networkBalance),
    networkTrust: toNumber(agent.network_trust_balance ?? agent.networkTrust),
    availableBalance: toNumber(agent.available_balance ?? agent.availBalance),
    balance: toNumber(agent.balance),
    commissionBalance: toNumber(agent.commission_balance ?? agent.commissionBalance),
    trustBalance: toNumber(agent.trust_balance ?? agent.trustUser),
    raw: agent,
  };
}

function mapRole(value: unknown, index: number): RoleOption {
  const role = asRecord(value);
  return {
    id: String(rowValue(role, ["id"], `role-${index}`)),
    name: String(rowValue(role, ["name"])),
  };
}

function AgencyListPage() {
  const [rows, setRows] = useState<AgencyRow[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [search, setSearch] = useState("");
  const [agentType, setAgentType] = useState("");
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<AgencyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [messageMode, setMessageMode] = useState<MessageMode>(null);
  const [messageTarget, setMessageTarget] = useState<AgencyRow | null>(null);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageDescription, setMessageDescription] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const allSelected = rows.length > 0 && selectedIds.length === rows.length;
  const sendModalTitle = useMemo(() => {
    if (messageMode === "single") {
      return `Send Message to ${messageTarget?.name || messageTarget?.username || "Agent"}`;
    }
    if (messageMode === "selected") {
      return `Send Message to Selected Agents (${selectedRows.length})`;
    }
    return "Send Message";
  }, [messageMode, messageTarget, selectedRows.length]);

  async function loadRoles() {
    const response = await GETREQUEST<any>("/admin/roles/agency");
    if (!response.ok) return;

    const body = asRecord(response.data);
    const list = Array.isArray(body.data) ? body.data : Array.isArray(response.data) ? response.data : [];
    setRoles(list.map(mapRole));
  }

  async function loadData(page = 1) {
    setLoading(true);
    const response = await POSTREQUEST<any>(
      `/admin/retail/agents?page=${page}&search=${encodeURIComponent(search)}`,
      { search, agent_type: agentType, state_id: "" }
    );
    setLoading(false);

    const body = asRecord(response.data);
    const data = asRecord(body.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const list = Array.isArray(data.data) ? data.data : [];
    const mappedRows = list.map(mapAgency);
    setRows(mappedRows);
    setPagination(
      paginationFrom(
        {
          total: asRecord(data.meta).total,
          per_page: asRecord(data.meta).perPage,
          current_page: page,
          last_page: asRecord(data.meta).lastPage,
          from: mappedRows.length ? (page - 1) * toNumber(asRecord(data.meta).perPage, 20) + 1 : 0,
          to: mappedRows.length
            ? (page - 1) * toNumber(asRecord(data.meta).perPage, 20) + mappedRows.length
            : 0,
        },
        page,
        mappedRows.length
      )
    );
    setSelectedIds([]);
    setSelectedRows([]);
  }

  async function updateStatus(agent: AgencyRow, action: 1 | 2) {
    if (!window.confirm("Are you sure?")) return;

    setUpdatingId(agent.id);
    const response = await GETREQUEST<any>(
      `/api/admin/agent-management/update-status?id=${agent.id}&action=${action}`
    );
    setUpdatingId(null);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    toast.success(body.message || "Agent status updated");
    setRows((current) =>
      current.map((item) => (item.id === agent.id ? { ...item, statusCode: action } : item))
    );
  }

  function toggleAll(checked: boolean) {
    if (!checked) {
      setSelectedIds([]);
      setSelectedRows([]);
      return;
    }

    setSelectedIds(rows.map((row) => row.id));
    setSelectedRows(rows);
  }

  function toggleRow(agent: AgencyRow, checked: boolean) {
    if (checked) {
      setSelectedIds((current) => Array.from(new Set([...current, agent.id])));
      setSelectedRows((current) =>
        current.some((item) => item.id === agent.id) ? current : [...current, agent]
      );
      return;
    }

    setSelectedIds((current) => current.filter((id) => id !== agent.id));
    setSelectedRows((current) => current.filter((item) => item.id !== agent.id));
  }

  function openMessage(mode: Exclude<MessageMode, null>, agent?: AgencyRow) {
    if (mode === "selected" && !selectedRows.length) {
      toast.error("No agent was selected");
      return;
    }

    setMessageMode(mode);
    setMessageTarget(agent ?? null);
    setMessageTitle("");
    setMessageDescription("");
  }

  async function sendMessage() {
    if (!messageTitle || !messageDescription) {
      toast.error("Title and description are required");
      return;
    }

    const userIds =
      messageMode === "single" && messageTarget
        ? [Number(messageTarget.id)]
        : selectedRows.map((agent) => Number(agent.id));

    if (!userIds.length) {
      toast.error("No selected agents available to send message");
      return;
    }

    if (messageMode === "selected" && !window.confirm(`Send message to ${userIds.length} selected agent(s)?`)) {
      return;
    }

    setSendingMessage(true);
    const payload =
      messageMode === "single"
        ? { userId: userIds[0], title: messageTitle, description: messageDescription }
        : { userIds, title: messageTitle, description: messageDescription };
    const response = await POSTREQUEST<any>("/admin/handle-notification", payload);
    setSendingMessage(false);

    const body = asRecord(response.data);
    if (!response.ok || body.status === false || body.success === false) {
      toast.error(response.error || body.message || "Unable to send message");
      return;
    }

    toast.success("Notifications sent successfully");
    setMessageMode(null);
  }

  function exportToCsv() {
    const headers = [
      "Username",
      "Name",
      "Agent Type",
      "Status",
      "Network Balance",
      "Network Trust",
      "Avail. Balance",
      "Balance",
      "Trust User",
    ];
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        [
          row.username,
          row.name,
          row.agentType,
          row.statusCode === 1 ? "Active" : "Inactive",
          row.networkBalance,
          row.networkTrust,
          row.availableBalance,
          row.balance,
          row.trustBalance,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "agency_list.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    void loadRoles();
    void loadData(1);
  }, []);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Agency List" />

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form
          className="grid gap-4 md:grid-cols-[240px_minmax(240px,1fr)_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            void loadData(1);
          }}
        >
          <select
            value={agentType}
            onChange={(event) => setAgentType(event.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">All</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by First name or last name"
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-10 rounded-md bg-warning-500 px-5 text-sm font-medium text-white hover:bg-warning-600 disabled:opacity-50"
          >
            Go!
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-wrap items-center justify-end gap-2 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <button
            type="button"
            disabled={!selectedRows.length}
            onClick={() => openMessage("selected")}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-info-500 px-3 text-sm font-medium text-white hover:bg-info-600 disabled:opacity-50"
            title="Send message to selected agents"
          >
            <Users size={16} />
            Send Selected ({selectedRows.length})
          </button>
          <button
            type="button"
            onClick={exportToCsv}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
            title="Export to CSV"
          >
            <Download size={16} />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) => toggleAll(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </th>
                {[
                  "Username",
                  "Name",
                  "Agent Type",
                  "Status",
                  "Network Balance",
                  "Network Trust",
                  "Avail. Balance",
                  "Balance",
                  "Commission Balance",
                  "Trust User",
                  "Temp. Block",
                  "Message",
                ].map((head) => (
                  <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={(event) => toggleRow(row, event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                    <Link href={`/network/agent/${row.id}`}>{row.username}</Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                    <Link href={`/network/agent/${row.id}`}>{row.name}</Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.agentType}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{row.statusCode === 1 ? "Active" : "Inactive"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.networkBalance)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.networkTrust)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.availableBalance)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.balance)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.commissionBalance)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.trustBalance)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/network/agent/${row.id}`} className="text-green-600 dark:text-green-300" title="Top Up">
                        NGN
                      </Link>
                      {row.statusCode !== 2 ? (
                        <button
                          type="button"
                          disabled={updatingId === row.id}
                          onClick={() => void updateStatus(row, 2)}
                          className="text-red-600 disabled:opacity-50 dark:text-red-300"
                          title="Deactivate"
                        >
                          <Lock size={16} />
                        </button>
                      ) : null}
                      {row.statusCode !== 1 ? (
                        <button
                          type="button"
                          disabled={updatingId === row.id}
                          onClick={() => void updateStatus(row, 1)}
                          className="text-green-600 disabled:opacity-50 dark:text-green-300"
                          title="Activate"
                        >
                          <Check size={16} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openMessage("single", row)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-info-500 text-white hover:bg-info-600"
                      title="Send to agent"
                    >
                      <Send size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    {loading ? "Loading agencies" : "No record found"}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <span>
            Showing{" "}
            {pagination.total
              ? `${pagination.from} to ${pagination.to} of ${pagination.total}`
              : rows.length}{" "}
            entries
          </span>
          <button
            type="button"
            disabled={pagination.current_page <= 1 || loading}
            onClick={() => void loadData(pagination.current_page - 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
          >
            Previous
          </button>
          <span>Page {pagination.current_page} of {pagination.last_page ?? 1}</span>
          <button
            type="button"
            disabled={pagination.current_page >= (pagination.last_page ?? 1) || loading}
            onClick={() => void loadData(pagination.current_page + 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
          >
            Next
          </button>
        </div>
      </section>

      {messageMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{sendModalTitle}</h2>
            </div>
            <form
              className="space-y-4 p-5"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</span>
                <input
                  value={messageTitle}
                  onChange={(event) => setMessageTitle(event.target.value)}
                  placeholder="Enter message title"
                  className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</span>
                <input
                  value={messageDescription}
                  onChange={(event) => setMessageDescription(event.target.value)}
                  placeholder="Enter message description"
                  className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMessageMode(null)}
                  className="h-10 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="h-10 rounded-md bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {sendingMessage ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default withAuth(AgencyListPage);
