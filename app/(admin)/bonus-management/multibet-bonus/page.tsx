"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Form from "@/components/form/Form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAuth } from "@/utils/withAuth";

import { columns, MultibetBonus, createActionColumn } from "./columns";
import { multibetBonusData } from "./data";

function MultibetBonusPage() {
  const [data, setData] = useState<MultibetBonus[]>(multibetBonusData);
  const [activeTab, setActiveTab] = useState<"Onliners" | "Shop">("Onliners");
  const [isAdding, setIsAdding] = useState(false);
  const [editingBonus, setEditingBonus] = useState<MultibetBonus | null>(null);
  
  // Form state
  const [numberOfEvents, setNumberOfEvents] = useState("");
  const [bonusPercentage, setBonusPercentage] = useState("");

  // Filter data by active tab
  const filteredData = useMemo(() => {
    return data.filter((item) => item.type === activeTab).sort((a, b) => a.numberOfEvents - b.numberOfEvents);
  }, [data, activeTab]);

  const handleEdit = (bonus: MultibetBonus) => {
    setEditingBonus(bonus);
    setNumberOfEvents(bonus.numberOfEvents.toString());
    setBonusPercentage(bonus.bonusPercentage.toString());
    setIsAdding(true);
  };

  const handleDelete = (bonusId: string) => {
    setData((prev) => prev.filter((item) => item.id !== bonusId));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!numberOfEvents || !bonusPercentage) {
      alert("Please fill in all fields");
      return;
    }

    const events = parseInt(numberOfEvents);
    const percentage = parseFloat(bonusPercentage);

    if (isNaN(events) || isNaN(percentage) || events < 1 || percentage < 0) {
      alert("Please enter valid numbers");
      return;
    }

    if (editingBonus) {
      // Update existing
      setData((prev) =>
        prev.map((item) =>
          item.id === editingBonus.id
            ? { ...item, numberOfEvents: events, bonusPercentage: percentage }
            : item
        )
      );
    } else {
      // Add new
      const newBonus: MultibetBonus = {
        id: Date.now().toString(),
        numberOfEvents: events,
        bonusPercentage: percentage,
        type: activeTab,
      };
      setData((prev) => [...prev, newBonus]);
    }

    handleCancel();
  };

  const tableColumns = [
    ...columns,
    createActionColumn({ onEdit: handleEdit, onDelete: handleDelete }),
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Bonuses on Tickets" />

      {/* Tabs Container */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "Onliners" | "Shop")} className="w-full">
          {/* Tabs Header */}
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

          {/* Onliners Tab */}
          <TabsContent value="Onliners" className="m-0 p-6 space-y-4">
            {/* Add New Button */}
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

            {/* Add/Edit Form */}
            {isAdding && (
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
                        defaultValue={numberOfEvents}
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
                        defaultValue={bonusPercentage}
                        onChange={(e) => setBonusPercentage(e.target.value)}
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                        {editingBonus ? "Update" : "Submit"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Form>
              </div>
            )}

            {/* Table */}
            <DataTable columns={tableColumns} data={filteredData} />
          </TabsContent>

          {/* Shop Tab */}
          <TabsContent value="Shop" className="m-0 p-6 space-y-4">
            {/* Add New Button */}
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

            {/* Add/Edit Form */}
            {isAdding && (
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
                        defaultValue={numberOfEvents}
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
                        defaultValue={bonusPercentage}
                        onChange={(e) => setBonusPercentage(e.target.value)}
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                        {editingBonus ? "Update" : "Submit"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Form>
              </div>
            )}

            {/* Table */}
            <DataTable columns={tableColumns} data={filteredData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default withAuth(MultibetBonusPage);

