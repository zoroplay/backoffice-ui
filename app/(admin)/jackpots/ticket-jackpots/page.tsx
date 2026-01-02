"use client";

import React, { useState } from "react";
import Select from "react-select";
import type { MultiValue, SingleValue } from "react-select";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { withAuth } from "@/utils/withAuth";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";
import { useModal } from "@/hooks/useModal";

import { TicketJackpot } from "./types";
import { ticketJackpotsData } from "./data";
import TicketJackpotModal from "./TicketJackpotModal";

const gameOptions = [
  { value: "Casino", label: "Casino" },
  { value: "Sport", label: "Sport" },
  { value: "Virtual", label: "Virtual" },
];

const currencyOptions = [
  { value: "NGN", label: "NGN" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
];

function TicketJackpotsPage() {
  const [jackpots, setJackpots] = useState<TicketJackpot[]>(ticketJackpotsData);
  const { isOpen, openModal, closeModal } = useModal();

  const handleAddNewJackpot = () => {
    openModal();
  };

  const handleSaveNewJackpot = (jackpot: Omit<TicketJackpot, "id">) => {
    const newJackpot: TicketJackpot = {
      ...jackpot,
      id: (jackpots.length + 1).toString(),
    };
    setJackpots((prev) => [...prev, newJackpot]);
    closeModal();
  };

  const handleSaveSetting = (id: string, updatedJackpot: TicketJackpot) => {
    setJackpots((prev) =>
      prev.map((jackpot) => (jackpot.id === id ? updatedJackpot : jackpot))
    );
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Ticket Jackpots" />

      {/* Add New Button */}
      <div className="flex items-center justify-end">
        <Button
          onClick={handleAddNewJackpot}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Add New Jackpot
        </Button>
      </div>

      {/* Jackpot Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jackpots.map((jackpot, index) => (
          <JackpotSettingCard
            key={jackpot.id}
            jackpot={jackpot}
            index={index + 1}
            onSave={handleSaveSetting}
          />
        ))}
      </div>

      {/* Modal */}
      <TicketJackpotModal
        isOpen={isOpen}
        onClose={closeModal}
        onSave={handleSaveNewJackpot}
      />
    </div>
  );
}

interface JackpotSettingCardProps {
  jackpot: TicketJackpot;
  index: number;
  onSave: (id: string, updatedJackpot: TicketJackpot) => void;
}

type SelectOption = {
  value: string;
  label: string;
};

const JackpotSettingCard: React.FC<JackpotSettingCardProps> = ({
  jackpot,
  index,
  onSave,
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<TicketJackpot>(jackpot);

  const handleChange = <K extends keyof TicketJackpot>(
    field: K,
    value: TicketJackpot[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(jackpot.id, formData);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">Jackpot Setting {index}</h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`displayName-${jackpot.id}`}>Display Name</Label>
            <Input
              id={`displayName-${jackpot.id}`}
              type="text"
              value={formData.displayName}
              onChange={(e) => handleChange("displayName", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor={`currency-${jackpot.id}`}>Currency</Label>
            <Select<SelectOption>
              id={`currency-${jackpot.id}`}
              styles={reactSelectStyles(theme)}
              options={currencyOptions}
              value={currencyOptions.find((opt) => opt.value === formData.currency)}
              onChange={(option: SingleValue<SelectOption>) =>
                handleChange("currency", option?.value ?? "NGN")
              }
              placeholder="Select currency"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`chargeShare-${jackpot.id}`}>Charge Share</Label>
            <Input
              id={`chargeShare-${jackpot.id}`}
              type="number"
              value={formData.chargeShare}
              onChange={(e) => handleChange("chargeShare", parseFloat(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor={`lowLimitAmount-${jackpot.id}`}>Low Limit Amount</Label>
            <Input
              id={`lowLimitAmount-${jackpot.id}`}
              type="number"
              value={formData.lowLimitAmount}
              onChange={(e) => handleChange("lowLimitAmount", parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`highLimitAmount-${jackpot.id}`}>High Limit Amount</Label>
            <Input
              id={`highLimitAmount-${jackpot.id}`}
              type="number"
              value={formData.highLimitAmount}
              onChange={(e) => handleChange("highLimitAmount", parseFloat(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor={`minShownAmount-${jackpot.id}`}>Min Shown Amount</Label>
            <Input
              id={`minShownAmount-${jackpot.id}`}
              type="number"
              value={formData.minShownAmount}
              onChange={(e) => handleChange("minShownAmount", parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`minStakeToWin-${jackpot.id}`}>Min Stake to Win</Label>
            <Input
              id={`minStakeToWin-${jackpot.id}`}
              type="number"
              value={formData.minStakeToWin}
              onChange={(e) => handleChange("minStakeToWin", parseFloat(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor={`displayPeriod-${jackpot.id}`}>Display Period</Label>
            <Input
              id={`displayPeriod-${jackpot.id}`}
              type="number"
              value={formData.displayPeriod}
              onChange={(e) => handleChange("displayPeriod", parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Draw Interval */}
        <div>
          <Label>Draw Interval</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="text"
              value={formData.drawIntervalStart}
              onChange={(e) => handleChange("drawIntervalStart", e.target.value)}
              placeholder="12:00:00 AM"
            />
            <Input
              type="text"
              value={formData.drawIntervalEnd}
              onChange={(e) => handleChange("drawIntervalEnd", e.target.value)}
              placeholder="11:59:00 PM"
            />
          </div>
        </div>

        {/* Allowed Games */}
        <div>
          <Label htmlFor={`allowedGames-${jackpot.id}`}>Allowed Games</Label>
          <Select<SelectOption, true>
            id={`allowedGames-${jackpot.id}`}
            styles={reactSelectStyles(theme)}
            options={gameOptions}
            value={gameOptions.filter((opt) => formData.allowedGames.includes(opt.value))}
            onChange={(options: MultiValue<SelectOption>) =>
              handleChange(
                "allowedGames",
                options.map((option) => option.value)
              )
            }
            placeholder="Select games"
            isMulti
          />
        </div>

        {/* Cashbox Amount */}
        <div>
          <Label htmlFor={`cashboxAmount-${jackpot.id}`}>Cashbox Amount</Label>
          <Input
            id={`cashboxAmount-${jackpot.id}`}
            type="number"
            value={formData.cashboxAmount}
            onChange={(e) => handleChange("cashboxAmount", parseFloat(e.target.value))}
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default withAuth(TicketJackpotsPage);

