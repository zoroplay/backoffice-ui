"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { withAuth } from "@/utils/withAuth";
import { apiEnv, normalizeApiError, settingsApi } from "@/lib/api";
import type { GameKeyRecord, GameProviderRecord } from "@/lib/api/modules/settings.service";

type GameKeyItem = {
  id: string;
  serverId?: number;
  provider: string;
  key: string;
  value: string;
};

type ProviderOption = {
  value: string;
  label: string;
};

const toDataArray = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const root = payload as { data?: unknown };

  if (Array.isArray(root.data)) {
    return root.data as T[];
  }

  if (root.data && typeof root.data === "object") {
    return Object.values(root.data as Record<string, T>);
  }

  return [];
};

const mapApiKeysToRows = (records: GameKeyRecord[]): GameKeyItem[] => {
  return records.map((record, index) => ({
    id: `gk-${record.id ?? index}-${Date.now()}-${index}`,
    serverId: typeof record.id === "number" ? record.id : undefined,
    provider: String(record.provider ?? ""),
    key: String(record.option ?? ""),
    value: String(record.value ?? ""),
  }));
};

const mapApiProvidersToOptions = (records: GameProviderRecord[]): ProviderOption[] => {
  return records
    .filter((provider) => Number(provider.status ?? 1) === 1)
    .map((provider) => ({
      value: String(provider.slug ?? "").trim(),
      label: String(provider.name ?? provider.slug ?? "").trim(),
    }))
    .filter((option) => option.value && option.label);
};

function GameKeysPage() {
  const [gameKeys, setGameKeys] = useState<GameKeyItem[]>([]);
  const [providerOptions, setProviderOptions] = useState<ProviderOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const totals = useMemo(() => {
    const activeProviders = new Set(
      gameKeys.map((item) => item.provider).filter(Boolean)
    ).size;
    return {
      totalKeys: gameKeys.length,
      providers: activeProviders,
    };
  }, [gameKeys]);

  const fetchProvidersAndKeys = useCallback(async () => {
    try {
      setIsLoading(true);

      const [providersPayload, keysPayload] = await Promise.all([
        settingsApi.getGameProviders(),
        settingsApi.getGameKeys(Number(apiEnv.clientId)),
      ]);

      const providerRecords = toDataArray<GameProviderRecord>(providersPayload);
      const gameKeyRecords = toDataArray<GameKeyRecord>(keysPayload);

      const options = mapApiProvidersToOptions(providerRecords);
      const rows = mapApiKeysToRows(gameKeyRecords);

      setProviderOptions(options);
      setGameKeys(rows);
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message || "Failed to load game keys");
      setProviderOptions([]);
      setGameKeys([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProvidersAndKeys();
  }, [fetchProvidersAndKeys]);

  const updateKeyRow = (
    id: string,
    field: keyof Omit<GameKeyItem, "id" | "serverId">,
    fieldValue: string
  ) => {
    setGameKeys((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: fieldValue } : item
      )
    );
  };

  const addRow = () => {
    setGameKeys((prev) => [
      ...prev,
      {
        id: `gk-${Date.now()}`,
        provider: providerOptions[0]?.value ?? "",
        key: "",
        value: "",
      },
    ]);
  };

  const deleteRow = (id: string) => {
    setGameKeys((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    const hasInvalid = gameKeys.some(
      (item) => !item.provider || !item.key.trim() || !item.value.trim()
    );

    if (hasInvalid) {
      toast.error("Complete all provider, key, and value fields before saving.");
      return;
    }

    try {
      setIsSaving(true);

      await settingsApi.saveGameKeys(
        {
          clientId: Number(apiEnv.clientId),
          keys: gameKeys.map((item) => ({
            id: item.serverId,
            provider: item.provider,
            option: item.key.trim(),
            value: item.value.trim(),
          })),
        },
        Number(apiEnv.clientId)
      );

      toast.success("Game keys saved successfully.");
      await fetchProvidersAndKeys();
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message || "Failed to save game keys");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Configurations · Game Keys" />

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Game Key Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage provider credentials and launch configuration values.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={addRow}
              startIcon={<Plus className="h-4 w-4" />}
              disabled={isLoading || isSaving}
            >
              Add More
            </Button>
            <Button
              onClick={() => void handleSave()}
              startIcon={<Save className="h-4 w-4" />}
              disabled={isLoading || isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Keys
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {totals.totalKeys}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Providers Configured
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {totals.providers}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-4 border-b border-gray-100 pb-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
        </div>

        <div className="space-y-4">
          {gameKeys.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-gray-50/30 p-4 dark:border-gray-800 dark:bg-gray-900/30 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
              <div>
                <Label htmlFor={`provider-${item.id}`}>Provider</Label>
                <Select
                  options={providerOptions}
                  placeholder="Select provider"
                  value={item.provider}
                  onChange={(value) => updateKeyRow(item.id, "provider", value)}
                  className="bg-white dark:bg-gray-900"
                />
              </div>

              <div>
                <Label htmlFor={`key-${item.id}`}>Key</Label>
                <Input
                  id={`key-${item.id}`}
                  value={item.key}
                  onChange={(event) => updateKeyRow(item.id, "key", event.target.value)}
                  placeholder="GAME_PROVIDER_KEY"
                />
              </div>

              <div>
                <Label htmlFor={`value-${item.id}`}>Value</Label>
                <Input
                  id={`value-${item.id}`}
                  value={item.value}
                  onChange={(event) => updateKeyRow(item.id, "value", event.target.value)}
                  placeholder="Enter value"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => deleteRow(item.id)}
                  disabled={gameKeys.length <= 1 || isSaving}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
                  aria-label={`Delete row ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading providers and game keys...</p>
        ) : null}
      </section>
    </div>
  );
}

export default withAuth(GameKeysPage);
