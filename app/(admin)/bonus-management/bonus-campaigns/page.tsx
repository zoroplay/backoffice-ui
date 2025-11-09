"use client";

import React, { useState } from "react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAuth } from "@/utils/withAuth";

import { columns, BonusCampaign, createActionColumn } from "./columns";
import { bonusCampaignsData } from "./data";
import CampaignForm from "./CampaignForm";

function BonusCampaignsPage() {
  const [data, setData] = useState<BonusCampaign[]>(bonusCampaignsData);
  const [editingCampaign, setEditingCampaign] = useState<BonusCampaign | null>(null);
  const [activeTab, setActiveTab] = useState("campaigns");

  const handleEdit = (campaign: BonusCampaign) => {
    setEditingCampaign(campaign);
    setActiveTab("create");
  };

  const handleDelete = (campaignId: string) => {
    setData((prev) => prev.filter((item) => item.id !== campaignId));
  };

  const handleSaveCampaign = (campaign: Omit<BonusCampaign, "id">) => {
    if (editingCampaign) {
      // Edit existing campaign
      setData((prev) =>
        prev.map((item) =>
          item.id === editingCampaign.id ? { ...campaign, id: editingCampaign.id } : item
        )
      );
    } else {
      // Add new campaign
      const newCampaign: BonusCampaign = {
        ...campaign,
        id: (data.length + 1).toString(),
      };
      setData((prev) => [...prev, newCampaign]);
    }
    setEditingCampaign(null);
    setActiveTab("campaigns");
  };

  const handleCancel = () => {
    setEditingCampaign(null);
    setActiveTab("campaigns");
  };

  // Combine columns with action column
  const tableColumns = [
    ...columns,
    createActionColumn({ onEdit: handleEdit, onDelete: handleDelete }),
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Campaigns" />

      {/* Tabs Container */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Header */}
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

          {/* Campaigns List Tab */}
          <TabsContent value="campaigns" className="m-0 p-6 space-y-4">
          
            {/* Table */}
            <DataTable columns={tableColumns} data={data} />
          </TabsContent>

          {/* Create Campaign Tab */}
          <TabsContent value="create" className="m-0 p-6">
            <CampaignForm
              onSave={handleSaveCampaign}
              onCancel={handleCancel}
              editData={editingCampaign}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default withAuth(BonusCampaignsPage);

