"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { GroupBase } from "react-select";
import { Info, Send } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { withAuth } from "@/utils/withAuth";
import { useSearch } from "@/context/SearchContext";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import Button from "@/components/ui/button/Button";
import { agentsApi, normalizeApiError, usersApi } from "@/lib/api";
import { cmsApi } from "@/lib/api/modules/cms.service";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { toast } from "sonner";

import { createColumns, Agency } from "./columns";

type FilterOption = {
  value: string;
  label: string;
};

const ALL_ROLE_OPTION: FilterOption = { value: "", label: "All" };
const PAGE_SIZE = 20;

type MessageOption = {
  id: string;
  title: string;
  content: string;
};

const parseList = <T,>(input: unknown, key: string): T[] => {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === "object") {
    const record = input as Record<string, unknown>;
    if (Array.isArray(record[key])) return record[key] as T[];
    if (record.data && typeof record.data === "object") {
      const nested = record.data as Record<string, unknown>;
      if (Array.isArray(nested[key])) return nested[key] as T[];
    }
  }
  return [];
};

const toNumber = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

const toAgency = (row: Record<string, unknown>): Agency => ({
  id: String(row.id ?? row.username ?? ""),
  username: String(row.username ?? ""),
  name: String(row.name ?? `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim()),
  agentType: String(row.rolename ?? ""),
  status: Number(row.status ?? 0) === 1 ? "Active" : "Inactive",
  networkBalance: toNumber(row.network_balance),
  networkTrust: toNumber(row.network_trust_balance),
  availBalance: toNumber(row.available_balance),
  balance: toNumber(row.balance),
  commissionBalance: toNumber(row.commission_balance),
  trustUser: toNumber(row.trust_balance),
  tempBlock: Number(row.status ?? 0) !== 1,
});

function AgencyListPage() {
  const [rows, setRows] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [roleOptions, setRoleOptions] = useState<FilterOption[]>([ALL_ROLE_OPTION]);
  const [selectedRoleOption, setSelectedRoleOption] =
    useState<FilterOption>(ALL_ROLE_OPTION);

  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedRoleId, setAppliedRoleId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isSendingToAllAgents, setIsSendingToAllAgents] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [messageOptions, setMessageOptions] = useState<MessageOption[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const { query, resetQuery, setPlaceholder, resetPlaceholder } = useSearch();

  const loadAgencyRoles = async () => {
    try {
      const response = await usersApi.getAgencyRoles();
      const roleRows = parseList<Record<string, unknown>>(response, "data");
      const options = roleRows
        .map((role) => {
          const id = String(role.id ?? "");
          const name = String(role.name ?? "");
          if (!id || !name) return null;
          return {
            value: id,
            label: name,
          } satisfies FilterOption;
        })
        .filter((option): option is FilterOption => Boolean(option));

      setRoleOptions([ALL_ROLE_OPTION, ...options]);
    } catch (err) {
      const apiError = normalizeApiError(err);
      setError(apiError.message ?? "Failed to load agency roles");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem("agency-list-cache", JSON.stringify(rows));
  }, [rows]);

  useEffect(() => {
    setPlaceholder("Search by Name or Username");
    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await loadAgencyRoles();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = () => {
    setAppliedSearch(query.trim());
    setAppliedRoleId(selectedRoleOption.value);
    setPage(1);
    setHasSearched(true);
  };

  const handleClear = () => {
    resetQuery();
    setSelectedRoleOption(ALL_ROLE_OPTION);
    setAppliedSearch("");
    setAppliedRoleId("");
    setRows([]);
    setTotal(0);
    setTotalPages(1);
    setPage(1);
    setError(null);
    setHasSearched(false);
  };

  useEffect(() => {
    if (!hasSearched) return;
    let cancelled = false;

    const fetchAgencies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await agentsApi.getAgents({
          page,
          search: appliedSearch,
          agent_type: appliedRoleId ? Number(appliedRoleId) : "",
          state_id: "",
        });

        if (cancelled) return;

        const payload = response as {
          data?: {
            data?: unknown[];
            meta?: {
              page?: number;
              total?: number;
              lastPage?: number;
            };
          };
        };

        const list = Array.isArray(payload?.data?.data) ? payload.data.data : [];
        const mapped = list.map((item) =>
          toAgency((item as Record<string, unknown>) ?? {})
        );

        setRows(mapped);
        setTotal(toNumber(payload?.data?.meta?.total));
        setTotalPages(toNumber(payload?.data?.meta?.lastPage) || 1);
      } catch (err) {
        if (cancelled) return;
        const apiError = normalizeApiError(err);
        setError(apiError.message ?? "Failed to fetch agencies");
        setRows([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchAgencies();
    return () => {
      cancelled = true;
    };
  }, [appliedRoleId, appliedSearch, hasSearched, page]);

  const fetchMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const data = await cmsApi.fetchMessages();
      const rows = Array.isArray(data)
        ? data
        : Array.isArray((data as { data?: unknown[] })?.data)
          ? ((data as { data: unknown[] }).data ?? [])
          : [];

      const parsed = rows
        .map((item) => {
          const row = (item ?? {}) as Record<string, unknown>;
          const id = String(row.id ?? "");
          const title = String(row.title ?? "");
          const content = String(row.content ?? "");
          if (!id || !title) return null;
          return { id, title, content } satisfies MessageOption;
        })
        .filter((option): option is MessageOption => Boolean(option));

      setMessageOptions(parsed);
    } catch {
      setMessageOptions([]);
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const openSendToAgentModal = async (agency: Agency) => {
    setIsSendingToAllAgents(false);
    setSelectedAgency(agency);
    setSelectedMessageId("");
    setIsMessageModalOpen(true);
    await fetchMessages();
  };

  const openSendToAllAgentsModal = async () => {
    setIsSendingToAllAgents(true);
    setSelectedAgency(null);
    setSelectedMessageId("");
    setIsMessageModalOpen(true);
    await fetchMessages();
  };

  const selectedMessage = messageOptions.find((message) => message.id === selectedMessageId) ?? null;

  const handleSendMessage = () => {
    if (!selectedMessageId) {
      toast.error("Please select a message");
      return;
    }

    if (isSendingToAllAgents) {
      toast.info(`Send-to-all endpoint pending. Selected: "${selectedMessage?.title ?? "message"}".`);
    } else {
      toast.info(
        `Send-to-agent endpoint pending for ${selectedAgency?.username ?? "agent"}. Selected: "${selectedMessage?.title ?? "message"}".`
      );
    }

    setIsMessageModalOpen(false);
  };

  const tableColumns = createColumns({
    onSendToAgent: (agency) => {
      void openSendToAgentModal(agency);
    },
    onSendToAllAgents: () => {
      void openSendToAllAgentsModal();
    },
    onToggleTempBlock: (agency) => {
      setRows((prev) =>
        prev.map((row) =>
          row.id === agency.id
            ? {
                ...row,
                tempBlock: !row.tempBlock,
                status: row.tempBlock ? "Active" : "Inactive",
              }
            : row
        )
      );
      toast.success(
        agency.tempBlock
          ? `${agency.username} is now unblocked`
          : `${agency.username} is now temporarily blocked`
      );
    },
  });

  const paginationLabel = useMemo(
    () => `Page ${page} of ${totalPages} (${total} total rows)`,
    [page, total, totalPages]
  );

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Agency List" />

      <span className="mb-2 flex items-center gap-1 text-gray-500 dark:text-gray-400">
        <Info className="h-4 w-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use the global search to filter by Name or Username
        </p>
      </span>

      <TableFilterToolbar<FilterOption, false, GroupBase<FilterOption>>
        selectProps={{
          options: roleOptions,
          value: selectedRoleOption,
          onChange: (option) => {
            setSelectedRoleOption(option ?? ALL_ROLE_OPTION);
          },
          onMenuOpen: () => {
            if (roleOptions.length <= 1) {
              void loadAgencyRoles();
            }
          },
          isMulti: false,
          placeholder: "All",
          containerClassName: "w-full sm:w-[260px]",
        }}
        actions={{
          onSearch: handleSearch,
          onClear: handleClear,
        }}
        isLoading={isLoading}
      />

      {!hasSearched ? (
        <div className="flex justify-center py-8 text-gray-500">Search to see data.</div>
      ) : (
        <>
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <div className="mb-3 flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void openSendToAllAgentsModal();
              }}
              className="text-emerald-600 hover:bg-emerald-50"
              title="Send message to all agents"
              aria-label="Send message to all agents"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <DataTable
            columns={tableColumns}
            data={rows}
            loading={isLoading}
            pageSize={PAGE_SIZE}
            hidePagination
          />
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">{paginationLabel}</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(1)}
                disabled={page <= 1 || isLoading}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages || isLoading}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages || isLoading}
              >
                Last
              </Button>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} size="lg">
        <ModalHeader>
          {isSendingToAllAgents
            ? "Send Message to All Agents"
            : `Send Message to ${selectedAgency?.username ?? "Agent"}`}
        </ModalHeader>
        <ModalBody className="space-y-4 py-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Select Message
            </label>
            <select
              value={selectedMessageId}
              onChange={(event) => setSelectedMessageId(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              disabled={isLoadingMessages}
            >
              <option value="">
                {isLoadingMessages ? "Loading messages..." : "Choose a message"}
              </option>
              {messageOptions.map((message) => (
                <option key={message.id} value={message.id}>
                  {message.title}
                </option>
              ))}
            </select>
          </div>

          {selectedMessage ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{selectedMessage.title}</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{selectedMessage.content}</p>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setIsMessageModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!selectedMessageId || isLoadingMessages || messageOptions.length === 0}
            >
              Send
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default withAuth(AgencyListPage);
