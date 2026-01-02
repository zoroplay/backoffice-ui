"use client";

import React, { useEffect, useState } from "react";

import Button from "@/components/ui/button/Button";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal/Modal";

import type { PermissionFormValues, PermissionRecord } from "../types";

type PermissionFormModalProps = {
  isOpen: boolean;
  permission: PermissionRecord | null;
  onSubmit: (values: PermissionFormValues) => void;
  onClose: () => void;
};

const defaultValues: PermissionFormValues = {
  name: "",
  category: "",
  description: "",
  isCore: false,
};

export function PermissionFormModal({
  isOpen,
  permission,
  onSubmit,
  onClose,
}: PermissionFormModalProps) {
  const [values, setValues] = useState<PermissionFormValues>(defaultValues);

  useEffect(() => {
    if (permission) {
      setValues({
        name: permission.name,
        category: permission.category,
        description: permission.description,
        isCore: permission.isCore,
      });
    } else {
      setValues(defaultValues);
    }
  }, [permission]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!values.name.trim()) {
      alert("Permission name is required");
      return;
    }
    onSubmit({
      ...values,
      name: values.name.trim(),
      category: values.category.trim(),
      description: values.description.trim(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          {permission ? "Edit Permission" : "Create Permission"}
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Name
            </label>
            <input
              value={values.name}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, name: event.target.value }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="e.g. Manage Promotions"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Category
            </label>
            <input
              value={values.category}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  category: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="e.g. Promotions"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Description
            </label>
            <textarea
              value={values.description}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="What access does this permission provide?"
            />
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={values.isCore}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, isCore: event.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            Core permission (protected and required)
          </label>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {permission ? "Save Changes" : "Create Permission"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default PermissionFormModal;

