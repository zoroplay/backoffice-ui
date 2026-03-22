"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { bonusesApi, normalizeApiError } from "@/lib/api";
import { withAuth } from "@/utils/withAuth";
import { useModal } from "@/hooks/useModal";

import { columns, PlayerBonus, createActionColumn } from "./columns";
import BonusFormModal, { BonusFormValues } from "./BonusFormModal";

type GenericRecord = Record<string, unknown>;

type ApiPlayerBonus = {
  id?: string | number;
  name?: string;
  bonusAmount?: string | number;
  product?: string;
  bonusType?: string;
  minimumEntryAmount?: string | number;
  minimumSelection?: string | number;
  minimumOddsPerEvent?: string | number;
  minimumTotalOdds?: string | number;
  applicableBetType?: string;
  maximumWinning?: string | number;
  status?: string;
  endDate?: string;
  [key: string]: unknown;
};

const toNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const toText = (value: unknown, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const toTitle = (value: unknown, fallback = "") => {
  const source = toText(value, fallback).replace(/[-_]+/g, " ").trim();
  if (!source) return fallback;
  return source
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const deriveStatus = (row: ApiPlayerBonus): "Active" | "Inactive" | "Expired" => {
  const status = toText(row.status).toLowerCase();
  if (status.includes("expired")) return "Expired";
  if (status.includes("inactive") || status === "0") return "Inactive";

  const endDate = toText(row.endDate).trim();
  if (endDate) {
    const parsed = new Date(endDate);
    if (!Number.isNaN(parsed.getTime()) && parsed.getTime() < Date.now()) {
      return "Expired";
    }
  }

  return "Active";
};

const mapBonusRow = (row: ApiPlayerBonus): PlayerBonus => {
  const id = toText(row.id);
  return {
    id,
    name: toText(row.name, `Bonus ${id || ""}`).trim(),
    value: toText(row.bonusAmount, "0"),
    product: toTitle(row.product, "Sport"),
    bonusType: toTitle(row.bonusType, "Deposit"),
    minStake: toNumber(row.minimumEntryAmount),
    minNoEvents: toNumber(row.minimumSelection),
    minOddsPerEvent: toNumber(row.minimumOddsPerEvent),
    minTotalOdds: toNumber(row.minimumTotalOdds),
    betType: toTitle(row.applicableBetType, "All"),
    maxWinnings: toNumber(row.maximumWinning),
    status: deriveStatus(row),
    raw: row as GenericRecord,
  };
};

const extractBonusList = (response: unknown): ApiPlayerBonus[] => {
  const root = (response as { data?: unknown })?.data ?? response;

  if (Array.isArray(root)) {
    return root as ApiPlayerBonus[];
  }

  if (root && typeof root === "object") {
    const objectRoot = root as { bonus?: unknown; bonuses?: unknown; data?: unknown };
    const nested = objectRoot.bonus ?? objectRoot.bonuses ?? objectRoot.data;
    if (Array.isArray(nested)) {
      return nested as ApiPlayerBonus[];
    }

    if (nested && typeof nested === "object") {
      const doubleNested = (nested as { data?: unknown }).data;
      if (Array.isArray(doubleNested)) {
        return doubleNested as ApiPlayerBonus[];
      }
    }
  }

  return [];
};

function PlayerBonusesPage() {
  const [data, setData] = useState<PlayerBonus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [editingBonus, setEditingBonus] = useState<PlayerBonus | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const loadBonuses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await bonusesApi.getPlayerBonuses();
      const list = extractBonusList(response);
      setData(list.map(mapBonusRow));
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast.error(apiError.message ?? "Failed to load player bonuses");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBonuses();
  }, [loadBonuses]);

  const handleAddNew = () => {
    setEditingBonus(null);
    openModal();
  };

  const handleEdit = (bonus: PlayerBonus) => {
    setEditingBonus(bonus);
    openModal();
  };

  const handleDelete = async (bonusId: string) => {
    setIsMutating(true);
    try {
      await bonusesApi.deleteBonus(bonusId);
      toast.success("Bonus deleted successfully");
      await loadBonuses();
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast.error(apiError.message ?? "Failed to delete bonus");
    } finally {
      setIsMutating(false);
    }
  };

  const handleSaveBonus = async (values: BonusFormValues) => {
    const raw = (editingBonus?.raw ?? {}) as GenericRecord;

    const basePayload = {
      name: values.name,
      duration: raw.duration ?? null,
      maxAmount: raw.maxAmount ?? "",
      minimumOddsPerEvent: values.minimumOddsPerEvent,
      minimumTotalOdds: values.minimumTotalOdds,
      applicableBetType: values.applicableBetType,
      maximumWinning: values.maximumWinning,
      minimumLostGames: raw.minimumLostGames ?? "",
      minimumSelection: values.minimumSelection,
      minimumEntryAmount: values.minimumEntryAmount,
      bonusAmount: values.bonusAmount,
      providerId: values.providerId || toText(raw.providerId),
      provider: values.provider || toText(raw.provider),
      rolloverCount: values.rolloverCount,
      product: values.product,
      bonusType: values.bonusType,
      creditType: toText(raw.creditType, "flat"),
      gameId: values.gameId || toText(raw.gameId),
      casinoSpinCount: values.casinoSpinCount || toText(raw.casinoSpinCount),
      sportId: toText(raw.sportId),
      categoryId: toText(raw.categoryId),
      tournamentId: toText(raw.tournamentId),
      fixtureId: raw.fixtureId ?? null,
      startDate: values.startDate,
      endDate: values.endDate,
    };

    setIsMutating(true);
    try {
      if (editingBonus) {
        await bonusesApi.updatePlayerBonus({
          id: toText(raw.id || editingBonus.id),
          ...basePayload,
          fixture: toText(raw.fixture),
        });
        toast.success("Bonus updated successfully");
      } else {
        await bonusesApi.createBonus(basePayload);
        toast.success("Bonus created successfully");
      }

      closeModal();
      await loadBonuses();
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast.error(apiError.message ?? (editingBonus ? "Failed to update bonus" : "Failed to create bonus"));
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const tableColumns = [...columns, createActionColumn({ onEdit: handleEdit, onDelete: handleDelete })];

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Bonus Manager" />

      <div className="flex items-center justify-end">
        <Button
          onClick={handleAddNew}
          startIcon={<Plus size={18} />}
          className="bg-green-500 hover:bg-green-600 text-white"
          disabled={isMutating}
        >
          Add New
        </Button>
      </div>

      <DataTable columns={tableColumns} data={data} loading={isLoading || isMutating} />

      <BonusFormModal
        isOpen={isOpen}
        onClose={closeModal}
        onSave={handleSaveBonus}
        editData={editingBonus}
      />
    </div>
  );
}

export default withAuth(PlayerBonusesPage);
