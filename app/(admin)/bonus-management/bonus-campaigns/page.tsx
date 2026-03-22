"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bonusesApi, normalizeApiError } from "@/lib/api";
import { withAuth } from "@/utils/withAuth";

import { columns, BonusCampaign, createActionColumn } from "./columns";
import CampaignForm, { CampaignBonusOption, CampaignFormValues } from "./CampaignForm";

type ApiCampaign = {
  id?: string | number;
  name?: string;
  bonusCode?: string;
  bonusId?: string | number;
  startDate?: string;
  endDate?: string;
  affiliateIds?: string;
  trackierCampaignId?: string;
  [key: string]: unknown;
};

type ApiBonus = {
  id?: string | number;
  name?: string;
  [key: string]: unknown;
};

const toText = (value: unknown, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const extractList = (response: unknown): Record<string, unknown>[] => {
  const root = (response as { data?: unknown })?.data ?? response;

  if (Array.isArray(root)) return root as Record<string, unknown>[];
  if (!root || typeof root !== "object") return [];

  const asObject = root as { data?: unknown; campaigns?: unknown; campaign?: unknown; bonus?: unknown; bonuses?: unknown };
  const candidates = [asObject.data, asObject.campaigns, asObject.campaign, asObject.bonus, asObject.bonuses];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as Record<string, unknown>[];
    if (candidate && typeof candidate === "object") {
      const nested = (candidate as { data?: unknown }).data;
      if (Array.isArray(nested)) return nested as Record<string, unknown>[];
    }
  }

  return [];
};

function BonusCampaignsPage() {
  const [data, setData] = useState<BonusCampaign[]>([]);
  const [bonusOptions, setBonusOptions] = useState<CampaignBonusOption[]>([]);
  const [editingCampaign, setEditingCampaign] = useState<BonusCampaign | null>(null);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await bonusesApi.getBonusCampaigns();
      const list = extractList(response) as ApiCampaign[];

      const mapped = list.map((item) => ({
        id: toText(item.id),
        campaignName: toText(item.name),
        bonusCode: toText(item.bonusCode),
        startDate: toText(item.startDate),
        endDate: toText(item.endDate),
        chooseBonus: toText(item.bonusName ?? item.name),
        affiliateIds: toText(item.affiliateIds),
        trackierCampaignIds: toText(item.trackierCampaignId),
        raw: item as Record<string, unknown>,
      }));

      setData(mapped);
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast.error(apiError.message ?? "Failed to load campaigns");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadBonuses = useCallback(async () => {
    try {
      const response = await bonusesApi.getPlayerBonuses();
      const list = extractList(response) as ApiBonus[];
      const options = list
        .map((item) => {
          const id = toText(item.id);
          const name = toText(item.name).trim();
          if (!id || !name) return null;
          return { value: id, label: name };
        })
        .filter((item): item is CampaignBonusOption => Boolean(item));

      setBonusOptions(options);
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast.error(apiError.message ?? "Failed to load bonus options");
      setBonusOptions([]);
    }
  }, []);

  useEffect(() => {
    void Promise.all([loadCampaigns(), loadBonuses()]);
  }, [loadCampaigns, loadBonuses]);

  const handleEdit = (campaign: BonusCampaign) => {
    setEditingCampaign(campaign);
    setActiveTab("create");
  };

  const handleDelete = async (campaignId: string) => {
    setIsMutating(true);
    try {
      await bonusesApi.deleteBonusCampaign(campaignId);
      toast.success("Campaign deleted successfully");
      await loadCampaigns();
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast.error(apiError.message ?? "Failed to delete campaign");
    } finally {
      setIsMutating(false);
    }
  };

  const handleSaveCampaign = async (campaign: CampaignFormValues) => {
    const raw = (editingCampaign?.raw ?? {}) as Record<string, unknown>;
    setIsMutating(true);

    try {
      if (editingCampaign) {
        await bonusesApi.updateBonusCampaign({
          id: Number(toText(raw.id || editingCampaign.id)),
          name: campaign.name,
          bonusCode: campaign.bonusCode,
          bonusId: campaign.bonusId,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          affiliateIds: campaign.affiliateIds,
          trackierCampaignId: campaign.trackierCampaignId,
        });
        toast.success("Campaign updated successfully");
      } else {
        await bonusesApi.createBonusCampaign({
          name: campaign.name,
          bonusCode: campaign.bonusCode,
          bonusId: campaign.bonusId,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          affiliateIds: campaign.affiliateIds,
          trackierCampaignId: campaign.trackierCampaignId,
        });
        toast.success("Campaign created successfully");
      }

      setEditingCampaign(null);
      setActiveTab("campaigns");
      await loadCampaigns();
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast.error(apiError.message ?? (editingCampaign ? "Failed to update campaign" : "Failed to create campaign"));
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const handleCancel = () => {
    setEditingCampaign(null);
    setActiveTab("campaigns");
  };

  const tableColumns = [...columns, createActionColumn({ onEdit: handleEdit, onDelete: handleDelete })];

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Campaigns" />

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
            <TabsList className="bg-white/50 dark:bg-gray-900/50 h-auto p-1 rounded-lg">
              <TabsTrigger
                value="campaigns"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-6 py-2 text-sm font-medium rounded-md"
              >
                Campaigns
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-6 py-2 text-sm font-medium rounded-md"
              >
                Create New Campaign
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="campaigns" className="m-0 p-6 space-y-4">
            <DataTable columns={tableColumns} data={data} loading={isLoading || isMutating} />
          </TabsContent>

          <TabsContent value="create" className="m-0 p-6">
            <CampaignForm
              onSave={handleSaveCampaign}
              onCancel={handleCancel}
              editData={editingCampaign}
              bonusOptions={bonusOptions}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default withAuth(BonusCampaignsPage);
