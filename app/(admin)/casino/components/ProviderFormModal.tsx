"use client";

import React, { useEffect, useState } from "react";

import Button from "@/components/ui/button/Button";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal/Modal";

import type { GameProvider, ProviderFormValues } from "../types";

type ProviderFormModalProps = {
  isOpen: boolean;
  initialValues?: GameProvider;
  onClose: () => void;
  onSubmit: (values: ProviderFormValues) => void;
};

const defaultValues: ProviderFormValues = {
  name: "",
  slug: "",
  website: "",
  headquarters: "",
  foundedYear: undefined,
  isActive: true,
};

const ProviderFormModal: React.FC<ProviderFormModalProps> = ({
  isOpen,
  initialValues,
  onClose,
  onSubmit,
}) => {
  const [values, setValues] = useState<ProviderFormValues>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name,
        slug: initialValues.slug,
        website: initialValues.website ?? "",
        headquarters: initialValues.headquarters ?? "",
        foundedYear: initialValues.foundedYear,
        isActive: initialValues.isActive,
      });
    } else {
      setValues(defaultValues);
    }
  }, [initialValues]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!values.name.trim() || !values.slug.trim()) {
      alert("Please provide a name and slug for the provider.");
      return;
    }

    onSubmit({
      ...values,
      name: values.name.trim(),
      slug: values.slug.trim(),
      website: values.website?.trim() || undefined,
      headquarters: values.headquarters?.trim() || undefined,
      foundedYear: values.foundedYear ? Number(values.foundedYear) : undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          {initialValues ? "Edit Provider" : "Add Provider"}
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Provider Name
            </label>
            <input
              type="text"
              value={values.name}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, name: event.target.value }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Pragmatic Play"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Slug
            </label>
            <input
              type="text"
              value={values.slug}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  slug: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="pragmatic-play"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Website
            </label>
            <input
              type="url"
              value={values.website ?? ""}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  website: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="https://provider.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Headquarters
            </label>
            <input
              type="text"
              value={values.headquarters ?? ""}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  headquarters: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Sliema, Malta"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Founded
            </label>
            <input
              type="number"
              value={values.foundedYear ?? ""}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  foundedYear: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="2015"
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
            {initialValues ? "Save Changes" : "Create Provider"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default ProviderFormModal;
