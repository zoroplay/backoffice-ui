"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";

import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { useTheme } from "@/context/ThemeContext";
import { PlayerBonus } from "./columns";

interface BonusFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bonus: BonusFormValues) => Promise<void> | void;
  editData?: PlayerBonus | null;
}

type BonusTypeOption = { value: string; label: string };

export type BonusFormValues = {
  name: string;
  product: string;
  bonusType: string;
  bonusAmount: string;
  applicableBetType: string;
  minimumOddsPerEvent: number;
  minimumTotalOdds: number;
  maximumWinning: number;
  minimumSelection: number;
  minimumEntryAmount: number;
  rolloverCount: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Inactive" | "Expired";
  provider: string;
  providerId: string;
  gameId: string;
  casinoSpinCount: string;
};

const productOptions: BonusTypeOption[] = [
  { value: "sport", label: "Sports" },
  { value: "casino", label: "Casino" },
  { value: "virtual", label: "Virtual" },
  { value: "games", label: "Games" },
];

const sportBonusTypes: BonusTypeOption[] = [
  { value: "deposit", label: "Deposit" },
  { value: "free-bet", label: "Free Bet" },
  { value: "cashback", label: "Cashback" },
  { value: "reload", label: "Reload" },
];

const casinoBonusTypes: BonusTypeOption[] = [
  { value: "free-rounds", label: "Free Rounds" },
  { value: "deposit", label: "Deposit" },
  { value: "cashback", label: "Cashback" },
];

const virtualBonusTypes: BonusTypeOption[] = [
  { value: "deposit", label: "Deposit" },
  { value: "free-bet", label: "Free Bet" },
];

const betTypeOptions: BonusTypeOption[] = [
  { value: "single", label: "Single" },
  { value: "combo", label: "Multiple" },
  { value: "system", label: "System" },
  { value: "all", label: "All" },
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
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [product, setProduct] = useState<BonusTypeOption | null>(null);
  const [bonusType, setBonusType] = useState<BonusTypeOption | null>(null);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<BonusTypeOption>(statusOptions[0]);

  const [betType, setBetType] = useState<BonusTypeOption | null>(null);
  const [minOddsPerEvent, setMinOddsPerEvent] = useState("");
  const [minTotalOdds, setMinTotalOdds] = useState("");
  const [maxWinnings, setMaxWinnings] = useState("");
  const [minSelection, setMinSelection] = useState("");
  const [minStake, setMinStake] = useState("");
  const [rolloverCount, setRolloverCount] = useState("");

  const [casinoProvider, setCasinoProvider] = useState<BonusTypeOption | null>(null);
  const [casinoGames, setCasinoGames] = useState("");
  const [spinCount, setSpinCount] = useState<BonusTypeOption | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toSafeString = (input: unknown) => {
    if (input === null || input === undefined) return "";
    return String(input);
  };

  useEffect(() => {
    if (editData) {
      const raw = editData.raw ?? {};
      const rawProduct = toSafeString(raw.product || editData.product).toLowerCase();
      const rawBonusType = toSafeString(raw.bonusType || editData.bonusType).toLowerCase();
      const rawBetType = toSafeString(raw.applicableBetType || editData.betType).toLowerCase();

      setName(editData.name);
      setProduct({ value: rawProduct, label: editData.product });
      setBonusType({ value: rawBonusType, label: editData.bonusType });
      setValue(editData.value);
      setStatus({ value: editData.status, label: editData.status });
      setBetType({ value: rawBetType, label: editData.betType });
      setMinStake(editData.minStake.toString());
      setMinSelection(editData.minNoEvents.toString());
      setMinOddsPerEvent(editData.minOddsPerEvent.toString());
      setMinTotalOdds(editData.minTotalOdds.toString());
      setMaxWinnings(editData.maxWinnings.toString());
      setRolloverCount(toSafeString(raw.rolloverCount || "1"));
      setCasinoProvider(
        toSafeString(raw.provider)
          ? { value: toSafeString(raw.provider), label: toSafeString(raw.provider) }
          : null
      );
      setCasinoGames(toSafeString(raw.gameId));
      setSpinCount(
        toSafeString(raw.casinoSpinCount)
          ? {
              value: toSafeString(raw.casinoSpinCount),
              label: `${toSafeString(raw.casinoSpinCount)} Spins`,
            }
          : null
      );
      setStartDate(toSafeString(raw.startDate));
      setEndDate(toSafeString(raw.endDate));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !product || !bonusType || !value) {
      alert("Please fill in all required fields");
      return;
    }

    const payload: BonusFormValues = {
      name,
      product: product.value,
      bonusType: bonusType.value,
      bonusAmount: value,
      applicableBetType: betType?.value || "all",
      minimumOddsPerEvent: minOddsPerEvent ? parseFloat(minOddsPerEvent) : 0,
      minimumTotalOdds: minTotalOdds ? parseFloat(minTotalOdds) : 0,
      maximumWinning: maxWinnings ? parseFloat(maxWinnings) : 0,
      minimumSelection: minSelection ? parseInt(minSelection, 10) : 0,
      minimumEntryAmount: minStake ? parseFloat(minStake) : 0,
      rolloverCount: rolloverCount ? parseInt(rolloverCount, 10) : 1,
      startDate,
      endDate,
      status: status.value as "Active" | "Inactive" | "Expired",
      provider: casinoProvider?.value || "",
      providerId: casinoProvider?.value || "",
      gameId: casinoGames || "",
      casinoSpinCount: spinCount?.value || "",
    };

    setIsSubmitting(true);
    try {
      await onSave(payload);
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const getBonusTypeOptions = () => {
    switch (product?.value) {
      case "sport":
      case "games":
        return sportBonusTypes;
      case "casino":
        return casinoBonusTypes;
      case "virtual":
        return virtualBonusTypes;
      default:
        return [];
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="3xl">
      <ModalHeader>{editData ? "Edit Bonus" : "Bonus Form"}</ModalHeader>

      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter bonus name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="product">Product</Label>
              <Select
                id="product"
                styles={reactSelectStyles(theme)}
                options={productOptions}
                placeholder="Select Product"
                value={product}
                onChange={(val) => {
                  setProduct(val);
                  setBonusType(null);
                }}
              />
            </div>

            <div>
              <Label htmlFor="bonusType">Bonus Type</Label>
              <Select
                id="bonusType"
                styles={reactSelectStyles(theme)}
                options={getBonusTypeOptions()}
                placeholder="Select Bonus Type"
                value={bonusType}
                onChange={(val) => setBonusType(val)}
                isDisabled={!product}
              />
            </div>

            {product?.value === "sport" && (
              <>
                <div>
                  <Label htmlFor="betType">Applicable Bet Type</Label>
                  <Select
                    id="betType"
                    styles={reactSelectStyles(theme)}
                    options={betTypeOptions}
                    placeholder="Select Bet Type"
                    value={betType}
                    onChange={(val) => setBetType(val)}
                  />
                </div>

                <div>
                  <Label htmlFor="minOddsPerEvent">Minimum Odds Per Event</Label>
                  <Input
                    id="minOddsPerEvent"
                    type="number"
                    step={0.01}
                    placeholder="e.g. 1.50"
                    value={minOddsPerEvent}
                    onChange={(e) => setMinOddsPerEvent(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="minTotalOdds">Minimum Total Odds</Label>
                  <Input
                    id="minTotalOdds"
                    type="number"
                    step={0.01}
                    placeholder="e.g. 3.00"
                    value={minTotalOdds}
                    onChange={(e) => setMinTotalOdds(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="maxWinnings">Maximum Winnings</Label>
                  <Input
                    id="maxWinnings"
                    type="number"
                    placeholder="e.g. 50000"
                    value={maxWinnings}
                    onChange={(e) => setMaxWinnings(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="minSelection">Minimum Selection</Label>
                  <Input
                    id="minSelection"
                    type="number"
                    placeholder="e.g. 3"
                    value={minSelection}
                    onChange={(e) => setMinSelection(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="minStake">Minimum Stake Amount</Label>
                  <Input
                    id="minStake"
                    type="number"
                    placeholder="e.g. 1000"
                    value={minStake}
                    onChange={(e) => setMinStake(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="rolloverCount">Rollover Count</Label>
                  <Input
                    id="rolloverCount"
                    type="number"
                    placeholder="e.g. 5"
                    value={rolloverCount}
                    onChange={(e) => setRolloverCount(e.target.value)}
                  />
                </div>
              </>
            )}

            {product?.value === "casino" && bonusType?.value === "free-rounds" && (
              <>
                <div>
                  <Label htmlFor="casinoProvider">Casino Provider</Label>
                  <Select
                    id="casinoProvider"
                    styles={reactSelectStyles(theme)}
                    options={casinoProviderOptions}
                    placeholder="Select Provider"
                    value={casinoProvider}
                    onChange={(val) => setCasinoProvider(val)}
                  />
                </div>

                <div>
                  <Label htmlFor="casinoGames">Casino Games</Label>
                  <Select
                    id="casinoGames"
                    styles={reactSelectStyles(theme)}
                    options={[
                      { value: "slots", label: "Slots" },
                      { value: "roulette", label: "Roulette" },
                      { value: "blackjack", label: "Blackjack" },
                    ]}
                    placeholder="Select Game"
                    value={casinoGames ? { value: casinoGames, label: casinoGames } : null}
                    onChange={(val) => setCasinoGames(val?.value || "")}
                  />
                </div>

                <div>
                  <Label htmlFor="spinCount">Spin Count</Label>
                  <Select
                    id="spinCount"
                    styles={reactSelectStyles(theme)}
                    options={spinCountOptions}
                    placeholder="Select Count"
                    value={spinCount}
                    onChange={(val) => setSpinCount(val)}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="text"
                placeholder="e.g. 100% or ₦1000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
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
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                styles={reactSelectStyles(theme)}
                options={statusOptions}
                value={status}
                onChange={(val) => setStatus(val!)}
              />
            </div>
          </div>

          <ModalFooter className="mt-6">
            <Button variant="outline" onClick={handleCancel} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-green-500 hover:bg-green-600 text-white">
              {editData ? "Update Bonus" : "Save Bonus"}
            </Button>
          </ModalFooter>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default BonusFormModal;
