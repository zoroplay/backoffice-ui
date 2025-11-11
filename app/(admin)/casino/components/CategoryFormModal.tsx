"use client";

import React, { useEffect, useState } from "react";

import Button from "@/components/ui/button/Button";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal/Modal";

import type { CategoryFormValues, GameCategory } from "../types";

type CategoryFormModalProps = {
  isOpen: boolean;
  initialValues?: GameCategory;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
};

const defaultValues: CategoryFormValues = {
  name: "",
  priority: 100,
  isActive: true,
  description: "",
};

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  initialValues,
  onClose,
  onSubmit,
}) => {
  const [values, setValues] = useState<CategoryFormValues>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name,
        priority: initialValues.priority,
        isActive: initialValues.isActive,
        description: initialValues.description ?? "",
      });
    } else {
      setValues(defaultValues);
    }
  }, [initialValues]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!values.name.trim()) {
      alert("Please provide a category name.");
      return;
    }

    onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          {initialValues ? "Edit Category" : "Create Category"}
        </ModalHeader>
        <ModalBody className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Name
            </label>
            <input
              type="text"
              value={values.name}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Crash Games"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Priority
            </label>
            <input
              type="number"
              value={values.priority}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  priority: Number(event.target.value),
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
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
              placeholder="Optional short description"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 p-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  isActive: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            Active
          </label>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialValues ? "Save Changes" : "Create Category"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default CategoryFormModal;

