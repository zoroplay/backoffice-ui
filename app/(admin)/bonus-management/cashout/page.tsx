"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAuth } from "@/utils/withAuth";

import { columns, CashoutReduction, createActionColumn } from "./columns";
import { cashoutReductionData, CashoutSettings, defaultWebSettings, defaultShopSettings } from "./data";

function CashoutPage() {
  const [reductionData, setReductionData] = useState<CashoutReduction[]>(cashoutReductionData);
  const [activeTab, setActiveTab] = useState<"Web" | "Shop">("Web");
  const [webSettings, setWebSettings] = useState<CashoutSettings>(defaultWebSettings);
  const [shopSettings, setShopSettings] = useState<CashoutSettings>(defaultShopSettings);
  const [isAdding, setIsAdding] = useState(false);
  
  // Add new tier form state
  const [minOdds, setMinOdds] = useState("");
  const [reductionPercent, setReductionPercent] = useState("");

  // Get current settings based on active tab
  const currentSettings = activeTab === "Web" ? webSettings : shopSettings;
  const setCurrentSettings = activeTab === "Web" ? setWebSettings : setShopSettings;

  // Filter reduction data by active tab
  const filteredReductionData = useMemo(() => {
    return reductionData
      .filter((item) => item.type === activeTab)
      .sort((a, b) => a.minOdds - b.minOdds);
  }, [reductionData, activeTab]);

  const handleDelete = (id: string) => {
    setReductionData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddNew = () => {
    setMinOdds("");
    setReductionPercent("");
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setMinOdds("");
    setReductionPercent("");
  };

  const handleAddSubmit = () => {
    if (!minOdds || !reductionPercent) {
      alert("Please fill in all fields");
      return;
    }

    const odds = parseFloat(minOdds);
    const percent = parseFloat(reductionPercent);

    if (isNaN(odds) || isNaN(percent) || odds < 0 || percent < 0) {
      alert("Please enter valid numbers");
      return;
    }

    const newReduction: CashoutReduction = {
      id: Date.now().toString(),
      minOdds: odds,
      reductionPercent: percent,
      type: activeTab,
    };

    setReductionData((prev) => [...prev, newReduction]);
    handleCancelAdd();
  };

  const handleSave = () => {
    console.log("Saving settings:", {
      tab: activeTab,
      settings: currentSettings,
      reductions: filteredReductionData,
    });
    alert(`${activeTab} Settings saved successfully!`);
  };

  const tableColumns = [
    ...columns,
    createActionColumn({ onDelete: handleDelete }),
  ];

  const renderTabContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Settings Form */}
      <div className="space-y-6">
        {/* Enable Cashout Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id={`enable${activeTab}Cashout`}
            checked={currentSettings.enabled}
            onChange={(e) =>
              setCurrentSettings({ ...currentSettings, enabled: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <label
            htmlFor={`enable${activeTab}Cashout`}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Enable {activeTab} Cashout
          </label>
        </div>

        {/* Cashout Stake Percentage */}
        <div>
          <Label htmlFor="stakePercentage">Cashout Stake Percentage:</Label>
          <div className="relative">
            <Input
              id="stakePercentage"
              type="number"
              placeholder="0"
              defaultValue={currentSettings.stakePercentage}
              onChange={(e) =>
                setCurrentSettings({ ...currentSettings, stakePercentage: e.target.value })
              }
              step={0.01}
              min={0}
              max={100}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              %
            </span>
          </div>
        </div>

        {/* Min Payout Amount */}
        <div>
          <Label htmlFor="minPayout">Min Payout Amount:</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              ₦
            </span>
            <Input
              id="minPayout"
              type="number"
              placeholder="0"
              defaultValue={currentSettings.minPayout}
              onChange={(e) =>
                setCurrentSettings({ ...currentSettings, minPayout: e.target.value })
              }
              className="pl-8"
              min={0}
            />
          </div>
        </div>

        {/* Max Payout Amount */}
        <div>
          <Label htmlFor="maxPayout">Max Payout Amount:</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              ₦
            </span>
            <Input
              id="maxPayout"
              type="number"
              placeholder="0"
              defaultValue={currentSettings.maxPayout}
              onChange={(e) =>
                setCurrentSettings({ ...currentSettings, maxPayout: e.target.value })
              }
              className="pl-8"
              min={0}
            />
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
          Save
        </Button>
      </div>

      {/* Right Side - Reduction Table */}
      <div className="space-y-4">
        {/* Add More Button */}
        {!isAdding && (
          <div className="flex justify-end">
            <Button
              onClick={handleAddNew}
              startIcon={<Plus size={18} />}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Add More
            </Button>
          </div>
        )}

        {/* Add New Form */}
        {isAdding && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
              Add Reduction Tier
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="minOdds">Min Odds</Label>
                <Input
                  id="minOdds"
                  type="number"
                  placeholder="e.g. 2.5"
                  defaultValue={minOdds}
                  onChange={(e) => setMinOdds(e.target.value)}
                  step={0.1}
                  min={0}
                />
              </div>
              <div>
                <Label htmlFor="reductionPercent">Reduction %</Label>
                <Input
                  id="reductionPercent"
                  type="number"
                  placeholder="e.g. 10"
                  defaultValue={reductionPercent}
                  onChange={(e) => setReductionPercent(e.target.value)}
                  step={0.01}
                  min={0}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddSubmit}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                Add
              </Button>
              <Button onClick={handleCancelAdd} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <DataTable columns={tableColumns} data={filteredReductionData} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="CashOut Settings" />

      {/* Tabs Container */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "Web" | "Shop")} className="w-full">
          {/* Tabs Header */}
          <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
            <TabsList className="bg-white/50 dark:bg-gray-900/50 h-auto p-1 rounded-lg">
              <TabsTrigger
                value="Web"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-6 py-2 text-sm font-medium rounded-md"
              >
                Web Settings
              </TabsTrigger>
              <TabsTrigger
                value="Shop"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-6 py-2 text-sm font-medium rounded-md"
              >
                Shop Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Web Settings Tab */}
          <TabsContent value="Web" className="m-0 p-6">
            {renderTabContent()}
          </TabsContent>

          {/* Shop Settings Tab */}
          <TabsContent value="Shop" className="m-0 p-6">
            {renderTabContent()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default withAuth(CashoutPage);

