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

export type CampaignBonusOption = {
  value: string;
  label: string;
};

export type CampaignFormValues = {
  name: string;
  bonusCode: string;
  bonusId: number;
  startDate: string;
  endDate: string;
  affiliateIds: string;
  trackierCampaignId: string;
};

interface CampaignFormProps {
  onSave: (campaign: CampaignFormValues) => Promise<void> | void;
  onCancel: () => void;
  editData?: BonusCampaign | null;
  bonusOptions: CampaignBonusOption[];
}

const CampaignForm: React.FC<CampaignFormProps> = ({
  onSave,
  onCancel,
  editData,
  bonusOptions,
}) => {
  const { theme } = useTheme();
  const [campaignName, setCampaignName] = useState("");
  const [bonusCode, setBonusCode] = useState("");
  const [chooseBonus, setChooseBonus] = useState<CampaignBonusOption | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [affiliateIds, setAffiliateIds] = useState("");
  const [trackierCampaignId, setTrackierCampaignId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      const raw = (editData.raw ?? {}) as Record<string, unknown>;
      const rawBonusId = Number(raw.bonusId);
      const selectedOption =
        bonusOptions.find((option) => Number(option.value) === rawBonusId) ??
        (Number.isFinite(rawBonusId)
          ? { value: String(rawBonusId), label: editData.chooseBonus }
          : null);

      setCampaignName(editData.campaignName);
      setBonusCode(editData.bonusCode);
      setChooseBonus(selectedOption);
      setStartDate(editData.startDate);
      setEndDate(editData.endDate);
      setAffiliateIds(editData.affiliateIds);
      setTrackierCampaignId(editData.trackierCampaignIds);
    } else {
      resetForm();
    }
  }, [editData, bonusOptions]);

  const resetForm = () => {
    setCampaignName("");
    setBonusCode("");
    setChooseBonus(null);
    setStartDate("");
    setEndDate("");
    setAffiliateIds("");
    setTrackierCampaignId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaignName || !bonusCode || !chooseBonus || !startDate || !endDate) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: campaignName,
        bonusCode,
        bonusId: Number(chooseBonus.value),
        startDate,
        endDate,
        affiliateIds,
        trackierCampaignId,
      });
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
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
          <div>
            <Label htmlFor="campaignName">Name</Label>
            <Input
              id="campaignName"
              type="text"
              placeholder="Enter campaign name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="bonusCode">Bonus Code</Label>
            <Input
              id="bonusCode"
              type="text"
              placeholder="Enter bonus code"
              value={bonusCode}
              onChange={(e) => setBonusCode(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="chooseBonus">Choose Bonus</Label>
            <Select
              id="chooseBonus"
              styles={reactSelectStyles(theme)}
              options={bonusOptions}
              placeholder="Select bonus"
              value={chooseBonus}
              onChange={(val) => setChooseBonus(val)}
            />
          </div>

          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="affiliateIds">Affiliate Ids</Label>
            <Input
              id="affiliateIds"
              type="text"
              placeholder="Enter affiliate IDs"
              value={affiliateIds}
              onChange={(e) => setAffiliateIds(e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <Label htmlFor="trackierCampaignId">Trackier Campaign Id</Label>
            <Input
              id="trackierCampaignId"
              type="text"
              placeholder="Enter trackier campaign ID"
              value={trackierCampaignId}
              onChange={(e) => setTrackierCampaignId(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-start gap-3 mt-6">
          <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white">
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
