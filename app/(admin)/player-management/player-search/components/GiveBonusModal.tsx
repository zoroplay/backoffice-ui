"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal/Modal";
import type { ActionModalBaseProps } from "./types";

type GiveBonusModalProps = ActionModalBaseProps & {
  options: Array<{ value: string; label: string }>;
  isOptionsLoading?: boolean;
  onSubmit: (payload: { bonusType: string; amount: string }) => Promise<void>; 
};

export function GiveBonusModal({
  isOpen,
  user,
  options,
  isOptionsLoading = false,
  isSubmitting = false,
  onClose,
  onSubmit,
}: GiveBonusModalProps) {
  const [bonusType, setBonusType] = useState("");
  const [amount, setAmount] = useState("");

  const resetForm = () => {
    setBonusType("");
    setAmount("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!bonusType) return;
    if (!amount || Number(amount) <= 0) return;

    await onSubmit({
      bonusType,
      amount: amount.trim(),
    });
    resetForm();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader>Give Bonus</ModalHeader>
        <ModalBody className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a bonus adjustment for{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {user?.username ?? "-"}
            </span>
            .
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Select Bonus
            </label>
            <select
              value={bonusType}
              onChange={(event) => setBonusType(event.target.value)}
              disabled={isOptionsLoading || isSubmitting}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="">
                {isOptionsLoading ? "Loading bonuses..." : "Select Bonus"}
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Amount</label>
            <Input
              type="number"
              step={0.01}
              min={0}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isOptionsLoading ||
              !bonusType ||
              !amount ||
              Number(amount) <= 0
            }
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default GiveBonusModal;
