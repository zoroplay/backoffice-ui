"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";

import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";
import { BonusCampaign } from "./columns";

interface CampaignFormProps {
  onSave: (campaign: Omit<BonusCampaign, "id">) => void;
  onCancel: () => void;
  editData?: BonusCampaign | null;
}

type BonusOption = {
  value: string;
  label: string;
};

const bonusOptions: BonusOption[] = [
  { value: "welcome_bonus", label: "Welcome Bonus" },
  { value: "weekend_special", label: "Weekend Special" },
  { value: "first_deposit", label: "First Deposit Bonus" },
  { value: "loyalty_bonus", label: "Loyalty Bonus" },
  { value: "free_bet_friday", label: "Free Bet Friday" },
  { value: "monthly_reload", label: "Monthly Reload" },
  { value: "cashback_bonus", label: "Cashback Bonus" },
  { value: "casino_welcome", label: "Casino Welcome Bonus" },
  { value: "risk_free_bet", label: "Risk-Free Bet" },
  { value: "games_booster", label: "Games Booster" },
];

const CampaignForm: React.FC<CampaignFormProps> = ({ onSave, onCancel, editData }) => {
  const { theme } = useTheme();
  const [campaignName, setCampaignName] = useState("");
  const [bonusCode, setBonusCode] = useState("");
  const [chooseBonus, setChooseBonus] = useState<BonusOption | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [affiliateIds, setAffiliateIds] = useState("");
  const [trackierCampaignIds, setTrackierCampaignIds] = useState("");

  // Populate form if editing
  useEffect(() => {
    if (editData) {
      setCampaignName(editData.campaignName);
      setBonusCode(editData.bonusCode);
      setChooseBonus({ value: editData.chooseBonus, label: editData.chooseBonus });
      setStartDate(editData.startDate);
      setEndDate(editData.endDate);
      setAffiliateIds(editData.affiliateIds);
      setTrackierCampaignIds(editData.trackierCampaignIds);
    } else {
      resetForm();
    }
  }, [editData]);

  const resetForm = () => {
    setCampaignName("");
    setBonusCode("");
    setChooseBonus(null);
    setStartDate("");
    setEndDate("");
    setAffiliateIds("");
    setTrackierCampaignIds("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaignName || !bonusCode || !chooseBonus || !startDate || !endDate) {
      alert("Please fill in all required fields");
      return;
    }

    const newCampaign: Omit<BonusCampaign, "id"> = {
      campaignName,
      bonusCode,
      chooseBonus: chooseBonus.label,
      startDate,
      endDate,
      affiliateIds,
      trackierCampaignIds,
    };

    onSave(newCampaign);
    resetForm();
  };

  const handleCancelClick = () => {
    resetForm();
    onCancel();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
        {editData ? "Edit Campaign" : "Create a new Campaign"}
      </h2>

      <Form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Name */}
          <div>
            <Label htmlFor="campaignName">Name</Label>
            <Input
              id="campaignName"
              type="text"
              placeholder="Enter campaign name"
              defaultValue={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>

          {/* Bonus Code */}
          <div>
            <Label htmlFor="bonusCode">Bonus Code</Label>
            <Input
              id="bonusCode"
              type="text"
              placeholder="Enter bonus code"
              defaultValue={bonusCode}
              onChange={(e) => setBonusCode(e.target.value)}
            />
          </div>

          {/* Choose Bonus */}
          <div>
            <Label htmlFor="chooseBonus">Choose Bonus</Label>
            <Select
              id="chooseBonus"
              styles={reactSelectStyles(theme)}
              options={bonusOptions}
              placeholder="Select bonus"
              value={chooseBonus}
              onChange={(val) => setChooseBonus(val as BonusOption | null)}
            />
          </div>

          {/* Start Date */}
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              defaultValue={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              defaultValue={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Affiliate Ids */}
          <div>
            <Label htmlFor="affiliateIds">Affiliate Ids</Label>
            <Input
              id="affiliateIds"
              type="text"
              placeholder="Enter affiliate IDs (comma separated)"
              defaultValue={affiliateIds}
              onChange={(e) => setAffiliateIds(e.target.value)}
            />
          </div>

          {/* Trackier Campaign Ids */}
          <div className="md:col-span-3">
            <Label htmlFor="trackierCampaignIds">Trackier Campaign Ids</Label>
            <Input
              id="trackierCampaignIds"
              type="text"
              placeholder="Enter trackier campaign IDs"
              defaultValue={trackierCampaignIds}
              onChange={(e) => setTrackierCampaignIds(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-start gap-3 mt-6">
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
            Submit
          </Button>
          <Button variant="outline" onClick={handleCancelClick} type="button">
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CampaignForm;

