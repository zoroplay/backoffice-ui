"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import type { Range } from "react-date-range";
import type { RowSelectionState } from "@tanstack/react-table";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { withAuth } from "@/utils/withAuth";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";
import { bonusesApi, normalizeApiError } from "@/lib/api";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";

import { columns, MassBonusPlayer } from "./columns";

type FilterOption = {
  value: string;
  label: string;
};

const segmentTypeOptions: FilterOption[] = [
  { value: "1", label: "Players registered, no deposit" },
  { value: "2", label: "Players deposited" },
  { value: "3", label: "Players deposit count" },
  { value: "4", label: "Players bet amount" },
  { value: "5", label: "Players bet amount and bet type" },
];

const today = new Date();
const defaultDateRange: Range = {
  startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
  key: "selection",
};

const formatApiDateTime = (date: Date, endOfDay: boolean) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const suffix = endOfDay ? "23:59:59" : "00:00:00";
  return `${y}-${m}-${d} ${suffix}`;
};

const toText = (value: unknown, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBool = (value: unknown) => {
  if (typeof value === "boolean") return value;
  const normalized = String(value ?? "").toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
};

const normalizeStatus = (value: unknown): "Active" | "Inactive" | "Suspended" => {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized.includes("suspend")) return "Suspended";
  if (normalized.includes("inactive") || normalized === "0") return "Inactive";
  return "Active";
};

const extractList = (response: unknown): Record<string, unknown>[] => {
  const root = (response as { data?: unknown })?.data ?? response;
  if (Array.isArray(root)) return root as Record<string, unknown>[];
  if (!root || typeof root !== "object") return [];

  const asObject = root as {
    data?: unknown;
    players?: unknown;
    rows?: unknown;
    items?: unknown;
    bonus?: unknown;
    bonuses?: unknown;
  };

  const candidates = [
    asObject.data,
    asObject.players,
    asObject.rows,
    asObject.items,
    asObject.bonus,
    asObject.bonuses,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as Record<string, unknown>[];
    if (candidate && typeof candidate === "object") {
      const nested = (candidate as { data?: unknown }).data;
      if (Array.isArray(nested)) return nested as Record<string, unknown>[];
    }
  }

  return [];
};

const mapPlayer = (row: Record<string, unknown>): MassBonusPlayer => ({
  id: toText(row.userId ?? row.id),
  username: toText(row.username),
  dateJoined: toText(row.dateJoined ?? row.createdAt ?? row.created_at, new Date().toISOString()),
  email: toText(row.email),
  phone: toText(row.phone ?? row.phoneNumber),
  balance: toNumber(row.balance ?? row.walletBalance ?? row.amount),
  verified: toBool(row.verified),
  status: normalizeStatus(row.status),
  raw: row,
});

function GrantMassBonusesPage() {
  const { theme } = useTheme();
  const [filteredData, setFilteredData] = useState<MassBonusPlayer[]>([]);
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [segmentType, setSegmentType] = useState<FilterOption | null>(segmentTypeOptions[0]);
  const [selectedBonus, setSelectedBonus] = useState<FilterOption | null>(null);
  const [bonusOptions, setBonusOptions] = useState<FilterOption[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadBonusOptions = useCallback(async () => {
    try {
      const response = await bonusesApi.getPlayerBonuses();
      const list = extractList(response);

      const options = list
        .map((item) => {
          const id = toText(item.id).trim();
          const name = toText(item.name).trim();
          if (!id || !name) return null;
          return { value: id, label: name };
        })
        .filter((item): item is FilterOption => Boolean(item));

      setBonusOptions(options);
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast.error(apiError.message ?? "Failed to load bonuses");
      setBonusOptions([]);
    }
  }, []);

  const fetchPlayers = useCallback(
    async (filterType: string) => {
      const startDate = dateRange.startDate ?? defaultDateRange.startDate ?? new Date();
      const endDate = dateRange.endDate ?? defaultDateRange.endDate ?? new Date();

      setIsLoading(true);
      try {
        const response = await bonusesApi.filterPlayersForMassBonus({
          filterType,
          startDate: formatApiDateTime(startDate, false),
          endDate: formatApiDateTime(endDate, true),
          minAmount: "",
          maxAmount: "",
          depositCount: "",
          page: 1,
        });

        const rows = extractList(response).map(mapPlayer);
        setFilteredData(rows);
        setRowSelection({});
      } catch (err) {
        const apiError = normalizeApiError(err);
        toast.error(apiError.message ?? "Failed to fetch players");
        setFilteredData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [dateRange.endDate, dateRange.startDate]
  );

  useEffect(() => {
    void Promise.all([loadBonusOptions(), fetchPlayers("1")]);
  }, [fetchPlayers, loadBonusOptions]);

  const selectedPlayers = useMemo(() => {
    return Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((key) => filteredData[Number(key)])
      .filter((player): player is MassBonusPlayer => Boolean(player));
  }, [filteredData, rowSelection]);

  const handleSearch = async () => {
    await fetchPlayers(segmentType?.value ?? "1");
  };

  const handleClearFilters = async () => {
    setDateRange(defaultDateRange);
    setSegmentType(segmentTypeOptions[0]);
    setSelectedBonus(null);
    setAmount("");
    setRowSelection({});
    await fetchPlayers("1");
  };

  const handleGrantBonus = async () => {
    if (selectedPlayers.length === 0) {
      toast.error("Please select at least one player");
      return;
    }

    if (!selectedBonus) {
      toast.error("Please select a bonus to grant");
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedPlayers.map((player) =>
          bonusesApi.grantMassBonus({
            username: player.username,
            userId: player.id,
            bonusId: selectedBonus.value,
            amount: parsedAmount,
          })
        )
      );

      toast.success(`Bonus granted to ${selectedPlayers.length} player(s)`);
      setRowSelection({});
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast.error(apiError.message ?? "Failed to grant bonus");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Grant Mass Bonuses" />

      <TableFilterToolbar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        isLoading={isLoading}
        actions={{
          onSearch: handleSearch,
          onClear: handleClearFilters,
        }}
        selectProps={{
          options: segmentTypeOptions,
          placeholder: "Select Segment Type",
          value: segmentType,
          onChange: (val) => setSegmentType((val as FilterOption | null) ?? null),
          isClearable: true,
        }}
      />

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Results</h2>
          <div className="flex items-center gap-3">
            <div className="w-64">
              <Select<FilterOption>
                styles={reactSelectStyles(theme)}
                options={bonusOptions}
                placeholder="Select Bonus"
                value={selectedBonus}
                onChange={(val) => setSelectedBonus(val as FilterOption | null)}
                isClearable
              />
            </div>
            <div className="w-40">
              <Input
                type="number"
                min={0}
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button
              onClick={handleGrantBonus}
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={
                !selectedBonus ||
                selectedPlayers.length === 0 ||
                !amount ||
                isSubmitting
              }
            >
              Grant Bonus
            </Button>
          </div>
        </div>

        <div className="p-6">
          {filteredData.length > 0 ? (
            <DataTable
              columns={columns}
              data={filteredData}
              onRowSelectionChange={setRowSelection}
              rowSelection={rowSelection}
              loading={isLoading}
            />
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(GrantMassBonusesPage);
