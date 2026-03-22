"use client";

import React from "react";
import Button from "@/components/ui/button/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal/Modal";
import type { ActionModalBaseProps } from "./types";

type ConfirmAccountActionModalProps = ActionModalBaseProps & {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "error";
  onConfirm: () => Promise<void>;
};

export function ConfirmAccountActionModal({
  isOpen,
  user,
  isSubmitting = false,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Yes",
  confirmVariant = "primary",
}: ConfirmAccountActionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {message}{" "}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {user?.username ?? ""}
          </span>
          ?
        </p>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
          No
        </Button>
        <Button
          type="button"
          onClick={() => {
            void onConfirm();
          }}
          disabled={isSubmitting}
          variant={confirmVariant}
        >
          {isSubmitting ? "Processing..." : confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ConfirmAccountActionModal;
