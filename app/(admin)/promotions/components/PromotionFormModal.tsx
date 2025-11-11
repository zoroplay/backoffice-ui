"use client";

import React, { useEffect, useMemo, useState } from "react";
import Select, {
  type GroupBase,
  type StylesConfig,
  type SingleValue,
} from "react-select";

import Button from "@/components/ui/button/Button";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal/Modal";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";

import {
  promotionPlatforms,
  promotionStatuses,
  promotionTypes,
} from "../data";
import type { PromotionFormValues, PromotionPlatform, PromotionStatus } from "../types";

type Option<TValue extends string> = {
  label: string;
  value: TValue;
};

type PromotionFormModalProps = {
  isOpen: boolean;
  initialValues?: PromotionFormValues;
  onClose: () => void;
  onSubmit: (values: PromotionFormValues) => void;
};

const defaultValues: PromotionFormValues = {
  title: "",
  type: promotionTypes[0] ?? "General",
  platform: "all",
  targetUrl: "",
  startDate: "",
  endDate: "",
  status: "draft",
  image: "/casino/vegas-nights.png",
  description: "",
};

export function PromotionFormModal({
  isOpen,
  initialValues,
  onClose,
  onSubmit,
}: PromotionFormModalProps) {
  const { theme } = useTheme();
  const [values, setValues] = useState<PromotionFormValues>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues);
    } else {
      setValues(defaultValues);
    }
  }, [initialValues]);

  const normalizedTheme =
    theme === "light" || theme === "dark" ? theme : undefined;

  const selectStyles = useMemo<
    StylesConfig<Option<string>, false, GroupBase<Option<string>>>
  >(
    () =>
      reactSelectStyles<Option<string>, false, GroupBase<Option<string>>>(
        normalizedTheme
      ),
    [normalizedTheme]
  );

  const platformOptions: Option<PromotionPlatform>[] = useMemo(
    () =>
      promotionPlatforms.map((item) => ({
        label: item.label,
        value: item.value,
      })),
    []
  );

  const statusOptions: Option<PromotionStatus>[] = useMemo(
    () =>
      promotionStatuses.map((item) => ({
        label: item.label,
        value: item.value,
      })),
    []
  );

  const typeOptions: Option<string>[] = useMemo(
    () =>
      promotionTypes.map((type) => ({
        label: type,
        value: type,
      })),
    []
  );

  const handlePlatformChange = (selected: SingleValue<Option<PromotionPlatform>>) => {
    if (!selected) return;
    setValues((prev) => ({
      ...prev,
      platform: selected.value,
    }));
  };

  const handleStatusChange = (selected: SingleValue<Option<PromotionStatus>>) => {
    if (!selected) return;
    setValues((prev) => ({
      ...prev,
      status: selected.value,
    }));
  };

  const handleTypeChange = (selected: SingleValue<Option<string>>) => {
    if (!selected) return;
    setValues((prev) => ({
      ...prev,
      type: selected.value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.title.trim()) {
      alert("Please provide a promotion title.");
      return;
    }

    if (!values.targetUrl.trim()) {
      alert("Please provide a target URL.");
      return;
    }

    onSubmit({
      ...values,
      title: values.title.trim(),
      targetUrl: values.targetUrl.trim(),
      description: values.description.trim(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          {initialValues ? "Edit Promotion" : "Add Promotion"}
        </ModalHeader>
        <ModalBody className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Title
              </label>
              <input
                type="text"
                value={values.title}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Campaign headline"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Target URL
              </label>
              <input
                type="url"
                value={values.targetUrl}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, targetUrl: event.target.value }))
                }
                placeholder="https://example.com/promotion"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Promotion Type
              </label>
              <Select<Option<string>, false>
                options={typeOptions}
                value={typeOptions.find((option) => option.value === values.type)}
                onChange={handleTypeChange}
                styles={selectStyles}
                placeholder="Select type"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Platform
              </label>
              <Select<Option<PromotionPlatform>, false>
                options={platformOptions}
                value={platformOptions.find(
                  (option) => option.value === values.platform
                )}
                onChange={handlePlatformChange}
                styles={selectStyles}
                placeholder="Select platform"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Start Date
              </label>
              <input
                type="date"
                value={values.startDate}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, startDate: event.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                End Date
              </label>
              <input
                type="date"
                value={values.endDate}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, endDate: event.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Status
              </label>
              <Select<Option<PromotionStatus>, false>
                options={statusOptions}
                value={statusOptions.find(
                  (option) => option.value === values.status
                )}
                onChange={handleStatusChange}
                styles={selectStyles}
                placeholder="Select status"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Image Path
              </label>
              <input
                type="text"
                value={values.image}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, image: event.target.value }))
                }
                placeholder="/casino/sugar-rush-1000.png"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Description
            </label>
            <textarea
              value={values.description}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, description: event.target.value }))
              }
              rows={4}
              placeholder="Short copy that appears on the promotion card."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialValues ? "Save Changes" : "Create Promotion"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default PromotionFormModal;

