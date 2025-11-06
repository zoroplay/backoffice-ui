"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Select from "react-select";

import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { PlayerBonus } from "./columns";

interface BonusFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bonus: Omit<PlayerBonus, "id">) => void;
  editData?: PlayerBonus | null;
}

type ProductType = "Sport" | "Casino" | "Virtual" | "Games";
type BonusTypeOption = { value: string; label: string };

const productOptions: BonusTypeOption[] = [
  { value: "Sport", label: "Sports" },
  { value: "Casino", label: "Casino" },
  { value: "Virtual", label: "Virtual" },
  { value: "Games", label: "Games" },
];

const sportBonusTypes: BonusTypeOption[] = [
  { value: "Deposit", label: "Deposit" },
  { value: "Free Bet", label: "Free Bet" },
  { value: "Cashback", label: "Cashback" },
  { value: "Reload", label: "Reload" },
];

const casinoBonusTypes: BonusTypeOption[] = [
  { value: "Free Rounds", label: "Free Rounds" },
  { value: "Deposit", label: "Deposit" },
  { value: "Cashback", label: "Cashback" },
];

const virtualBonusTypes: BonusTypeOption[] = [
  { value: "Deposit", label: "Deposit" },
  { value: "Free Bet", label: "Free Bet" },
];

const betTypeOptions: BonusTypeOption[] = [
  { value: "Single", label: "Single" },
  { value: "Multiple", label: "Multiple" },
  { value: "System", label: "System" },
  { value: "All", label: "All" },
];

const casinoProviderOptions: BonusTypeOption[] = [
  { value: "pragmatic", label: "Pragmatic Play" },
  { value: "evolution", label: "Evolution Gaming" },
  { value: "netent", label: "NetEnt" },
  { value: "playtech", label: "Playtech" },
];

const spinCountOptions: BonusTypeOption[] = [
  { value: "10", label: "10 Spins" },
  { value: "25", label: "25 Spins" },
  { value: "50", label: "50 Spins" },
  { value: "100", label: "100 Spins" },
];

const statusOptions: BonusTypeOption[] = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const BonusFormModal: React.FC<BonusFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
}) => {
  // Form state
  const [name, setName] = useState("");
  const [product, setProduct] = useState<BonusTypeOption | null>(null);
  const [bonusType, setBonusType] = useState<BonusTypeOption | null>(null);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<BonusTypeOption>(statusOptions[0]);

  // Sport-specific fields
  const [betType, setBetType] = useState<BonusTypeOption | null>(null);
  const [minOddsPerEvent, setMinOddsPerEvent] = useState("");
  const [minTotalOdds, setMinTotalOdds] = useState("");
  const [maxWinnings, setMaxWinnings] = useState("");
  const [minSelection, setMinSelection] = useState("");
  const [minStake, setMinStake] = useState("");
  const [rolloverCount, setRolloverCount] = useState("");

  // Casino-specific fields
  const [casinoProvider, setCasinoProvider] = useState<BonusTypeOption | null>(null);
  const [casinoGames, setCasinoGames] = useState("");
  const [spinCount, setSpinCount] = useState<BonusTypeOption | null>(null);

  // Common date fields
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Populate form if editing
  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setProduct({ value: editData.product, label: editData.product });
      setBonusType({ value: editData.bonusType, label: editData.bonusType });
      setValue(editData.value);
      setStatus({ value: editData.status, label: editData.status });
      setBetType({ value: editData.betType, label: editData.betType });
      setMinStake(editData.minStake.toString());
      setMinSelection(editData.minNoEvents.toString());
      setMinOddsPerEvent(editData.minOddsPerEvent.toString());
      setMinTotalOdds(editData.minTotalOdds.toString());
      setMaxWinnings(editData.maxWinnings.toString());
    } else {
      resetForm();
    }
  }, [editData, isOpen]);

  const resetForm = () => {
    setName("");
    setProduct(null);
    setBonusType(null);
    setValue("");
    setStatus(statusOptions[0]);
    setBetType(null);
    setMinOddsPerEvent("");
    setMinTotalOdds("");
    setMaxWinnings("");
    setMinSelection("");
    setMinStake("");
    setRolloverCount("");
    setCasinoProvider(null);
    setCasinoGames("");
    setSpinCount(null);
    setStartDate("");
    setEndDate("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !product || !bonusType || !value) {
      alert("Please fill in all required fields");
      return;
    }

    const newBonus: Omit<PlayerBonus, "id"> = {
      name,
      value,
      product: product.value,
      bonusType: bonusType.value,
      minStake: minStake ? parseFloat(minStake) : 0,
      minNoEvents: minSelection ? parseInt(minSelection) : 0,
      minOddsPerEvent: minOddsPerEvent ? parseFloat(minOddsPerEvent) : 0,
      minTotalOdds: minTotalOdds ? parseFloat(minTotalOdds) : 0,
      betType: betType?.value || "All",
      maxWinnings: maxWinnings ? parseFloat(maxWinnings) : 0,
      status: status.value as "Active" | "Inactive" | "Expired",
    };

    onSave(newBonus);
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const getBonusTypeOptions = () => {
    switch (product?.value) {
      case "Sport":
      case "Games":
        return sportBonusTypes;
      case "Casino":
        return casinoBonusTypes;
      case "Virtual":
        return virtualBonusTypes;
      default:
        return [];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 lg:left-[90px] z-[9999] flex items-center justify-center backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl my-8 relative">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {editData ? "Edit Bonus" : "Bonus Form"}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form - Scrollable Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <Form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Name */}
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter bonus name"
                  defaultValue={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Product */}
              <div>
                <Label htmlFor="product">Product</Label>
                <Select
                  id="product"
                  className="dark:text-black"
                  options={productOptions}
                  placeholder="Select Product"
                  value={product}
                  onChange={(val) => {
                    setProduct(val);
                    setBonusType(null); // Reset bonus type when product changes
                  }}
                />
              </div>

              {/* Bonus Type */}
              <div>
                <Label htmlFor="bonusType">Bonus Type</Label>
                <Select
                  id="bonusType"
                  className="dark:text-black"
                  options={getBonusTypeOptions()}
                  placeholder="Select Bonus Type"
                  value={bonusType}
                  onChange={(val) => setBonusType(val)}
                  isDisabled={!product}
                />
              </div>

              {/* Conditional Fields based on Product Type */}
              {product?.value === "Sport" && (
                <>
                  {/* Applicable Bet Type */}
                  <div>
                    <Label htmlFor="betType">Applicable Bet Type</Label>
                    <Select
                      id="betType"
                      className="dark:text-black"
                      options={betTypeOptions}
                      placeholder="Select Bet Type"
                      value={betType}
                      onChange={(val) => setBetType(val)}
                    />
                  </div>

                  {/* Minimum Odds Per Event */}
                  <div>
                    <Label htmlFor="minOddsPerEvent">Minimum Odds Per Event</Label>
                    <Input
                      id="minOddsPerEvent"
                      type="number"
                      step={0.01}
                      placeholder="e.g. 1.50"
                      defaultValue={minOddsPerEvent}
                      onChange={(e) => setMinOddsPerEvent(e.target.value)}
                    />
                  </div>

                  {/* Minimum Total Odds */}
                  <div>
                    <Label htmlFor="minTotalOdds">Minimum Total Odds</Label>
                    <Input
                      id="minTotalOdds"
                      type="number"
                      step={0.01}
                      placeholder="e.g. 3.00"
                      defaultValue={minTotalOdds}
                      onChange={(e) => setMinTotalOdds(e.target.value)}
                    />
                  </div>

                  {/* Maximum Winnings */}
                  <div>
                    <Label htmlFor="maxWinnings">Maximum Winnings</Label>
                    <Input
                      id="maxWinnings"
                      type="number"
                      placeholder="e.g. 50000"
                      defaultValue={maxWinnings}
                      onChange={(e) => setMaxWinnings(e.target.value)}
                    />
                  </div>

                  {/* Minimum Selection */}
                  <div>
                    <Label htmlFor="minSelection">Minimum Selection</Label>
                    <Input
                      id="minSelection"
                      type="number"
                      placeholder="e.g. 3"
                      defaultValue={minSelection}
                      onChange={(e) => setMinSelection(e.target.value)}
                    />
                  </div>

                  {/* Minimum Stake Amount */}
                  <div>
                    <Label htmlFor="minStake">Minimum Stake Amount</Label>
                    <Input
                      id="minStake"
                      type="number"
                      placeholder="e.g. 1000"
                      defaultValue={minStake}
                      onChange={(e) => setMinStake(e.target.value)}
                    />
                  </div>

                  {/* Rollover Count */}
                  <div>
                    <Label htmlFor="rolloverCount">Rollover Count</Label>
                    <Input
                      id="rolloverCount"
                      type="number"
                      placeholder="e.g. 5"
                      defaultValue={rolloverCount}
                      onChange={(e) => setRolloverCount(e.target.value)}
                    />
                  </div>
                </>
              )}

              {product?.value === "Casino" && bonusType?.value === "Free Rounds" && (
                <>
                  {/* Casino Provider */}
                  <div>
                    <Label htmlFor="casinoProvider">Casino Provider</Label>
                    <Select
                      id="casinoProvider"
                      className="dark:text-black"
                      options={casinoProviderOptions}
                      placeholder="Select Provider"
                      value={casinoProvider}
                      onChange={(val) => setCasinoProvider(val)}
                    />
                  </div>

                  {/* Casino Games */}
                  <div>
                    <Label htmlFor="casinoGames">Casino Games</Label>
                    <Select
                      id="casinoGames"
                      className="dark:text-black"
                      options={[
                        { value: "slots", label: "Slots" },
                        { value: "roulette", label: "Roulette" },
                        { value: "blackjack", label: "Blackjack" },
                      ]}
                      placeholder="Select Game"
                      value={
                        casinoGames ? { value: casinoGames, label: casinoGames } : null
                      }
                      onChange={(val) => setCasinoGames(val?.value || "")}
                    />
                  </div>

                  {/* Spin Count */}
                  <div>
                    <Label htmlFor="spinCount">Spin Count</Label>
                    <Select
                      id="spinCount"
                      className="dark:text-black"
                      options={spinCountOptions}
                      placeholder="Select Count"
                      value={spinCount}
                      onChange={(val) => setSpinCount(val)}
                    />
                  </div>
                </>
              )}

              {/* Value (for all types) */}
              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="text"
                  placeholder="e.g. 100% or ₦1000"
                  defaultValue={value}
                  onChange={(e) => setValue(e.target.value)}
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

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  className="dark:text-black"
                  options={statusOptions}
                  value={status}
                  onChange={(val) => setStatus(val!)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={handleCancel} type="button">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
                {editData ? "Update Bonus" : "Save Bonus"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default BonusFormModal;

