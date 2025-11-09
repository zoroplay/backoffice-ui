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
import { TicketJackpot } from "./types";

interface TicketJackpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jackpot: Omit<TicketJackpot, "id">) => void;
  editData?: TicketJackpot | null;
}

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

const TicketJackpotModal: React.FC<TicketJackpotModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
}) => {
  const { theme } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [lowLimitAmount, setLowLimitAmount] = useState("");
  const [highLimitAmount, setHighLimitAmount] = useState("");
  const [chargeShare, setChargeShare] = useState("");
  const [minShownAmount, setMinShownAmount] = useState("");
  const [minStakeToWin, setMinStakeToWin] = useState("");
  const [displayPeriod, setDisplayPeriod] = useState("");
  const [drawIntervalStart, setDrawIntervalStart] = useState("");
  const [drawIntervalEnd, setDrawIntervalEnd] = useState("");
  const [allowedGames, setAllowedGames] = useState<string[]>([]);
  const [cashboxAmount, setCashboxAmount] = useState("");

  useEffect(() => {
    if (editData) {
      setDisplayName(editData.displayName);
      setCurrency(editData.currency);
      setLowLimitAmount(editData.lowLimitAmount.toString());
      setHighLimitAmount(editData.highLimitAmount.toString());
      setChargeShare(editData.chargeShare.toString());
      setMinShownAmount(editData.minShownAmount.toString());
      setMinStakeToWin(editData.minStakeToWin.toString());
      setDisplayPeriod(editData.displayPeriod.toString());
      setDrawIntervalStart(editData.drawIntervalStart);
      setDrawIntervalEnd(editData.drawIntervalEnd);
      setAllowedGames(editData.allowedGames);
      setCashboxAmount(editData.cashboxAmount.toString());
    } else {
      resetForm();
    }
  }, [editData, isOpen]);

  const resetForm = () => {
    setDisplayName("");
    setCurrency("NGN");
    setLowLimitAmount("");
    setHighLimitAmount("");
    setChargeShare("");
    setMinShownAmount("");
    setMinStakeToWin("");
    setDisplayPeriod("");
    setDrawIntervalStart("");
    setDrawIntervalEnd("");
    setAllowedGames([]);
    setCashboxAmount("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName || !lowLimitAmount || !highLimitAmount) {
      alert("Please fill in required fields");
      return;
    }

    const newJackpot: Omit<TicketJackpot, "id"> = {
      displayName,
      currency,
      lowLimitAmount: parseFloat(lowLimitAmount),
      highLimitAmount: parseFloat(highLimitAmount),
      chargeShare: parseFloat(chargeShare) || 0,
      minShownAmount: parseFloat(minShownAmount) || 0,
      minStakeToWin: parseFloat(minStakeToWin) || 0,
      displayPeriod: parseFloat(displayPeriod) || 0,
      drawIntervalStart,
      drawIntervalEnd,
      allowedGames,
      cashboxAmount: parseFloat(cashboxAmount) || 0,
    };

    onSave(newJackpot);
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="2xl">
      <ModalHeader>{editData ? "Edit Ticket Jackpot" : "New Ticket Jackpot"}</ModalHeader>

      <ModalBody>
        <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter display name"
                    defaultValue={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    id="currency"
                    styles={reactSelectStyles(theme)}
                    options={currencyOptions}
                    value={currencyOptions.find((opt) => opt.value === currency)}
                    onChange={(val) => setCurrency(val?.value || "NGN")}
                    placeholder="Select currency"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lowLimitAmount">Low Limit Amount</Label>
                  <Input
                    id="lowLimitAmount"
                    type="number"
                    placeholder="Enter low limit"
                    defaultValue={lowLimitAmount}
                    onChange={(e) => setLowLimitAmount(e.target.value)}
                    min={0}
                  />
                </div>

                <div>
                  <Label htmlFor="highLimitAmount">High Limit Amount</Label>
                  <Input
                    id="highLimitAmount"
                    type="number"
                    placeholder="Enter high limit"
                    defaultValue={highLimitAmount}
                    onChange={(e) => setHighLimitAmount(e.target.value)}
                    min={0}
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chargeShare">Charge Share</Label>
                  <Input
                    id="chargeShare"
                    type="number"
                    placeholder="Enter charge share"
                    defaultValue={chargeShare}
                    onChange={(e) => setChargeShare(e.target.value)}
                    min={0}
                  />
                </div>

                <div>
                  <Label htmlFor="minShownAmount">Min Shown Amount</Label>
                  <Input
                    id="minShownAmount"
                    type="number"
                    placeholder="Enter min shown amount"
                    defaultValue={minShownAmount}
                    onChange={(e) => setMinShownAmount(e.target.value)}
                    min={0}
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minStakeToWin">Min Stake to Win</Label>
                  <Input
                    id="minStakeToWin"
                    type="number"
                    placeholder="Enter min stake"
                    defaultValue={minStakeToWin}
                    onChange={(e) => setMinStakeToWin(e.target.value)}
                    min={0}
                  />
                </div>

                <div>
                  <Label htmlFor="displayPeriod">Jackpot Display Period</Label>
                  <Input
                    id="displayPeriod"
                    type="number"
                    placeholder="Enter display period (days)"
                    defaultValue={displayPeriod}
                    onChange={(e) => setDisplayPeriod(e.target.value)}
                    min={0}
                  />
                </div>
              </div>

              {/* Draw Interval */}
              <div>
                <Label>Draw Interval</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="e.g., 12:00:00 AM"
                    defaultValue={drawIntervalStart}
                    onChange={(e) => setDrawIntervalStart(e.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="e.g., 11:59:00 PM"
                    defaultValue={drawIntervalEnd}
                    onChange={(e) => setDrawIntervalEnd(e.target.value)}
                  />
                </div>
              </div>

              {/* Allowed Games */}
              <div>
                <Label htmlFor="allowedGames">Allowed Games</Label>
                <Select
                  id="allowedGames"
                  styles={reactSelectStyles(theme)}
                  options={gameOptions}
                  value={gameOptions.filter((opt) => allowedGames.includes(opt.value))}
                  onChange={(val) => setAllowedGames(val.map((v) => v.value))}
                  placeholder="Select allowed games"
                  isMulti
                />
              </div>

              {/* Cashbox Amount */}
              <div>
                <Label htmlFor="cashboxAmount">Cashbox Amount</Label>
                <Input
                  id="cashboxAmount"
                  type="number"
                  placeholder="Enter cashbox amount"
                  defaultValue={cashboxAmount}
                  onChange={(e) => setCashboxAmount(e.target.value)}
                  min={0}
                />
              </div>
            </div>

            {/* Actions */}
            <ModalFooter className="mt-6">
              <Button variant="outline" onClick={handleCancel} type="button">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
                {editData ? "Update" : "Save"}
              </Button>
            </ModalFooter>
          </Form>
      </ModalBody>
    </Modal>
  );
};

export default TicketJackpotModal;

