"use client";

import React, { useEffect, useState } from "react";

import Button from "@/components/ui/button/Button";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal/Modal";

import type { RoleFormValues, RoleRecord } from "../types";

const roleTypeOptions: Array<{ label: string; value: RoleFormValues["type"] }> =
  [
    { label: "Admin", value: "admin" },
    { label: "Agency", value: "agency" },
    { label: "Player", value: "player" },
  ];

type RoleFormModalProps = {
  isOpen: boolean;
  role: RoleRecord | null;
  onSubmit: (values: RoleFormValues) => void;
  onClose: () => void;
};

const defaultValues: RoleFormValues = {
  name: "",
  description: "",
  type: "admin",
};

export function RoleFormModal({ isOpen, role, onSubmit, onClose }: RoleFormModalProps) {
  const [values, setValues] = useState<RoleFormValues>(defaultValues);

  useEffect(() => {
    if (role) {
      setValues({
        name: role.name,
        description: role.description,
        type: role.type,
      });
    } else {
      setValues(defaultValues);
    }
  }, [role]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!values.name.trim()) {
      alert("Role name is required");
      return;
    }
    onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description.trim(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader>{role ? "Edit Role" : "Create Role"}</ModalHeader>
        <ModalBody className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Role Name
            </label>
            <input
              value={values.name}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, name: event.target.value }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="e.g. Operations Admin"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Role Type
            </label>
            <select
              value={values.type}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  type: event.target.value as RoleFormValues["type"],
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              {roleTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
              placeholder="What does this role cover?"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{role ? "Save Changes" : "Create Role"}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default RoleFormModal;

