"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Form from "@/components/form/Form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bonusesApi, normalizeApiError } from "@/lib/api";
import { apiEnv } from "@/lib/api/env";
import { withAuth } from "@/utils/withAuth";

import { columns, MultibetBonus, createActionColumn } from "./columns";

type ApiAccaBonusItem = {
  id?: string | number;
  client_id?: string | number;
  section?: string;
  ticket_length?: string | number;
  min_odd?: string | number;
  bonus?: string | number;
  created?: Record<string, unknown>;
  updated?: Record<string, unknown>;
  [key: string]: unknown;
};

type BonusTab = "Onliners" | "Shop";

const clientId = String(apiEnv.clientId);

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toText = (value: unknown, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const sectionToTab = (section: unknown): BonusTab =>
  String(section).toLowerCase() === "shop" ? "Shop" : "Onliners";

const tabToSection = (tab: BonusTab): "onliners" | "shop" =>
  tab === "Shop" ? "shop" : "onliners";

const extractItems = (response: unknown): ApiAccaBonusItem[] => {
  const root = (response as { data?: unknown })?.data ?? response;

  if (Array.isArray(root)) return root as ApiAccaBonusItem[];
  if (!root || typeof root !== "object") return [];

  const asObject = root as { data?: unknown };
  if (Array.isArray(asObject.data)) return asObject.data as ApiAccaBonusItem[];

  if (asObject.data && typeof asObject.data === "object") {
    const nested = (asObject.data as { data?: unknown }).data;
    if (Array.isArray(nested)) return nested as ApiAccaBonusItem[];
  }

  return [];
};

const toMultibetBonus = (item: ApiAccaBonusItem): MultibetBonus => ({
  id: toText(item.id),
  numberOfEvents: toNumber(item.ticket_length),
  bonusPercentage: toNumber(item.bonus),
  type: sectionToTab(item.section),
  raw: item as Record<string, unknown>,
});

function MultibetBonusPage() {
  const [data, setData] = useState<MultibetBonus[]>([]);
  const [activeTab, setActiveTab] = useState<BonusTab>("Onliners");
  const [isAdding, setIsAdding] = useState(false);
  const [editingBonus, setEditingBonus] = useState<MultibetBonus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const [numberOfEvents, setNumberOfEvents] = useState("");
  const [bonusPercentage, setBonusPercentage] = useState("");

  const loadBonuses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await bonusesApi.getMultibetBonuses();
      const items = extractItems(response).map(toMultibetBonus);
      setData(items);
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to load multibet bonuses");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBonuses();
  }, [loadBonuses]);

  const getDataForTab = (tab: BonusTab) =>
    data
      .filter((item) => item.type === tab)
      .sort((a, b) => a.numberOfEvents - b.numberOfEvents);

  const persistSectionItems = useCallback(
    async (tab: BonusTab, sectionItems: MultibetBonus[]) => {
      await bonusesApi.saveMultibetBonuses({
        section: tabToSection(tab),
        items: sectionItems.map((item) => {
          const raw = (item.raw ?? {}) as Record<string, unknown>;
          return {
            id: toText(raw.id ?? item.id),
            client_id: toText(raw.client_id ?? clientId),
            section: toText(raw.section ?? tabToSection(tab)),
            ticket_length: item.numberOfEvents,
            min_odd: toNumber(raw.min_odd, 0),
            bonus: String(item.bonusPercentage),
            created: (raw.created as Record<string, unknown>) ?? {},
            updated: (raw.updated as Record<string, unknown>) ?? {},
            ticketLength: item.numberOfEvents,
          };
        }),
      });
    },
    []
  );

  const handleEdit = (bonus: MultibetBonus) => {
    setEditingBonus(bonus);
    setNumberOfEvents(bonus.numberOfEvents.toString());
    setBonusPercentage(bonus.bonusPercentage.toString());
    setIsAdding(true);
  };

  const handleDelete = async (bonusId: string) => {
    const nextData = data.filter((item) => item.id !== bonusId);
    const nextSectionItems = nextData.filter((item) => item.type === activeTab);

    setIsMutating(true);
    try {
      await persistSectionItems(activeTab, nextSectionItems);
      toast.success("Multibet bonus updated");
      await loadBonuses();
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to save multibet bonuses");
    } finally {
      setIsMutating(false);
    }
  };

  const handleAddNew = () => {
    setEditingBonus(null);
    setNumberOfEvents("");
    setBonusPercentage("");
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingBonus(null);
    setNumberOfEvents("");
    setBonusPercentage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!numberOfEvents || !bonusPercentage) {
      alert("Please fill in all fields");
      return;
    }

    const events = parseInt(numberOfEvents, 10);
    const percentage = parseFloat(bonusPercentage);

    if (Number.isNaN(events) || Number.isNaN(percentage) || events < 1 || percentage < 0) {
      alert("Please enter valid numbers");
      return;
    }

    const sectionItems = data.filter((item) => item.type === activeTab);

    const nextSectionItems = editingBonus
      ? sectionItems.map((item) =>
          item.id === editingBonus.id
            ? { ...item, numberOfEvents: events, bonusPercentage: percentage }
            : item
        )
      : [
          ...sectionItems,
          {
            id: `new-${Date.now()}`,
            numberOfEvents: events,
            bonusPercentage: percentage,
            type: activeTab,
            raw: {
              client_id: clientId,
              section: tabToSection(activeTab),
              min_odd: 0,
              created: {},
              updated: {},
            },
          },
        ];

    setIsMutating(true);
    try {
      await persistSectionItems(activeTab, nextSectionItems);
      toast.success(editingBonus ? "Bonus tier updated" : "Bonus tier added");
      handleCancel();
      await loadBonuses();
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to save multibet bonuses");
    } finally {
      setIsMutating(false);
    }
  };

  const tableColumns = [
    ...columns,
    createActionColumn({ onEdit: handleEdit, onDelete: handleDelete }),
  ];

  const renderTabContent = (tab: BonusTab) => (
    <TabsContent value={tab} className="m-0 p-6 space-y-4">
      {!isAdding && (
        <div className="flex justify-end">
          <Button
            onClick={handleAddNew}
            startIcon={<Plus size={18} />}
            className="bg-green-500 hover:bg-green-600 text-white"
            disabled={isMutating}
          >
            Add More
          </Button>
        </div>
      )}

      {isAdding && activeTab === tab && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {editingBonus ? "Edit Bonus Tier" : "Add New Bonus Tier"}
          </h3>
          <Form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="numberOfEvents">No. of Events</Label>
                <Input
                  id="numberOfEvents"
                  type="number"
                  placeholder="e.g. 5"
                  value={numberOfEvents}
                  onChange={(e) => setNumberOfEvents(e.target.value)}
                  min={1}
                />
              </div>
              <div>
                <Label htmlFor="bonusPercentage">Bonus (%)</Label>
                <Input
                  id="bonusPercentage"
                  type="number"
                  placeholder="e.g. 10"
                  value={bonusPercentage}
                  onChange={(e) => setBonusPercentage(e.target.value)}
                  min={0}
                  step={0.01}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={isMutating} className="bg-blue-500 hover:bg-blue-600 text-white">
                  {editingBonus ? "Update" : "Submit"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isMutating}>
                  Cancel
                </Button>
              </div>
            </div>
          </Form>
        </div>
      )}

      <DataTable columns={tableColumns} data={getDataForTab(tab)} loading={isLoading || isMutating} />
    </TabsContent>
  );

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Bonuses on Tickets" />

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as BonusTab)} className="w-full">
          <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
            <TabsList className="bg-white/50 dark:bg-gray-900/50 h-auto p-1 rounded-lg">
              <TabsTrigger
                value="Onliners"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-6 py-2 text-sm font-medium rounded-md"
              >
                Onliners
              </TabsTrigger>
              <TabsTrigger
                value="Shop"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-6 py-2 text-sm font-medium rounded-md"
              >
                Shop
              </TabsTrigger>
            </TabsList>
          </div>

          {renderTabContent("Onliners")}
          {renderTabContent("Shop")}
        </Tabs>
      </div>
    </div>
  );
}

export default withAuth(MultibetBonusPage);
