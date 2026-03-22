"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal/Modal";
import type { ActionModalBaseProps } from "./types";

type WalletAdjustmentModalProps = ActionModalBaseProps & {
  action: "deposit" | "withdraw";
  onSubmit: (payload: { amount: string; description: string }) => Promise<void>;
};

export function WalletAdjustmentModal({
  isOpen,
  user,
  action,
  isSubmitting = false,
  onClose,
  onSubmit,
}: WalletAdjustmentModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setAmount("");
    setDescription("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    if (!description.trim()) return;

    await onSubmit({
      amount: amount.trim(),
      description: description.trim(),
    });
    resetForm();
  };

  const title = action === "deposit" ? "Manual Deposit" : "Manual Withdrawal";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Apply a wallet adjustment for{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {user?.username ?? "-"}
            </span>
            .
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {action === "deposit" ? "Deposit Amount" : "Withdrawal Amount"}
            </label>
            <Input
              type="number"
              step={0.01}
              min={0}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Note</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Add note"
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !amount || Number(amount) <= 0 || !description.trim()}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default WalletAdjustmentModal;
