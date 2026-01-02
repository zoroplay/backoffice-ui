"use client";

import React from "react";
import { CheckCircle2, MinusCircle } from "lucide-react";

import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal/Modal";
import Button from "@/components/ui/button/Button";

type UserPermissionsModalProps = {
  isOpen: boolean;
  userName: string | null;
  grantedPermissions: string[];
  availablePermissions: string[];
  onClose: () => void;
  onManageAccess?: () => void;
};

export function UserPermissionsModal({
  isOpen,
  userName,
  grantedPermissions,
  availablePermissions,
  onClose,
  onManageAccess,
}: UserPermissionsModalProps) {
  if (!userName) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>{userName} · Permissions</ModalHeader>
      <ModalBody className="space-y-6">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Granted
          </h4>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {grantedPermissions.map((permission) => (
              <div
                key={permission}
                className="flex items-start gap-2 rounded-xl border border-green-200 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4" />
                <span>{permission}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Available
          </h4>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {availablePermissions.map((permission) => (
              <div
                key={permission}
                className="flex items-start gap-2 rounded-xl border border-dashed border-gray-200 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300"
              >
                <MinusCircle className="mt-0.5 h-4 w-4 text-gray-400" />
                <span>{permission}</span>
              </div>
            ))}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (onManageAccess) {
              onManageAccess();
            } else {
              alert("Coming soon: granular permission management.");
            }
          }}
        >
          Manage Access
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default UserPermissionsModal;

