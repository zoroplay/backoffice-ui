"use client";

import React, { useState } from "react";
import type { SingleValue } from "react-select";
import Select from "react-select";
import Button from "@/components/ui/button/Button";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";

type ProfileOption = { value: string; label: string };

const profileOptions: ProfileOption[] = [
  { value: "ggr", label: "GGR" },
  { value: "turnover", label: "Turnover" },
  { value: "hybrid", label: "Hybrid" },
];

interface CommissionProfileTabProps {
  agentId: string;
  agent: Agency;
}

function CommissionProfileTab({
  agentId,
  agent,
}: CommissionProfileTabProps) {
  const { theme } = useTheme();
  const [selectedProfile, setSelectedProfile] =
    useState<ProfileOption | null>(null);

  const handleProfileChange = (option: SingleValue<ProfileOption>) => {
    setSelectedProfile(option ?? null);
  };

  const handleSave = () => {
    // Handle save logic
    console.log("Saving profile:", selectedProfile);
  };

  const handleRemove = () => {
    // Handle remove logic
    console.log("Removing profile");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Commission Profile */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span>📊</span>
              Active Commission Profile
            </h3>            
          </div>
          <div className="p-6 space-y-4 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Name:
              </span>
              <p className="font-semibold text-gray-900 dark:text-gray-100">GGR</p>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Provider Group:
              </span>
              <p className="font-semibold text-gray-900 dark:text-gray-100">sports</p>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Period:
              </span>
              <p className="font-semibold text-gray-900 dark:text-gray-100">weekly</p>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Commission Type:
              </span>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Turnover (weekly)</p>
            </div>
            <div className="flex justify-between items-center pb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Type:
              </span>
              <p className="font-semibold text-gray-900 dark:text-gray-100">ggr</p>
            </div>
            <Button
              variant="error"
              size="md"
              onClick={handleRemove}
              className="w-full shadow-md hover:shadow-lg transition-all duration-200 mt-4"
            >
              Remove Profile
            </Button>
          </div>
        </div>

        {/* Set Commission Profile */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span>⚙️</span>
              Set Commission Profile
            </h3>
          </div>
          <div className="p-6 space-y-6 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-900/10">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Choose Profile
              </label>
              <Select<ProfileOption>
                styles={reactSelectStyles(theme)}
                options={profileOptions}
                placeholder="Select profile"
                value={selectedProfile}
                onChange={handleProfileChange}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              className="w-full bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommissionProfileTab;

