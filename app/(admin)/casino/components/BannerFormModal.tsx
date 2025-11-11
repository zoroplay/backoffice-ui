"use client";

import React, { useEffect, useMemo, useState } from "react";
import Select, {
  type GroupBase,
  type SingleValue,
  type StylesConfig,
} from "react-select";

import Button from "@/components/ui/button/Button";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal/Modal";
import { reactSelectStyles } from "@/utils/reactSelectStyles";

import type {
  BannerFormValues,
  BannerPosition,
  BannerTarget,
  CasinoBanner,
} from "../types";

type Option = {
  label: string;
  value: string;
};

type BannerFormModalProps = {
  theme: string | null;
  isOpen: boolean;
  initialValues?: CasinoBanner;
  targets: ReadonlyArray<{ label: string; value: BannerTarget }>;
  positions: ReadonlyArray<{ label: string; value: BannerPosition }>;
  onClose: () => void;
  onSubmit: (values: BannerFormValues) => void;
};

const defaultValues: BannerFormValues = {
  title: "",
  target: "web",
  position: "slider",
  link: "",
  isActive: true,
  image: "/casino/vegas-nights.png",
  content: "",
  audience: "",
};

const BannerFormModal: React.FC<BannerFormModalProps> = ({
  theme,
  isOpen,
  initialValues,
  targets,
  positions,
  onClose,
  onSubmit,
}) => {
  const [values, setValues] = useState<BannerFormValues>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        title: initialValues.title,
        target: initialValues.target,
        position: initialValues.position,
        link: initialValues.link,
        isActive: initialValues.isActive,
        image: initialValues.image,
        content: initialValues.content ?? "",
        audience: initialValues.audience ?? "",
      });
    } else {
      setValues(defaultValues);
    }
  }, [initialValues]);

  const normalizedTheme =
    theme === "light" || theme === "dark" ? theme : undefined;

  const singleSelectStyles = useMemo<
    StylesConfig<Option, false, GroupBase<Option>>
  >(
    () =>
      reactSelectStyles<Option, false, GroupBase<Option>>(normalizedTheme),
    [normalizedTheme]
  );

  const targetOptions = useMemo<Option[]>(
    () =>
      targets.map((target) => ({
        label: target.label,
        value: target.value,
      })),
    [targets]
  );

  const positionOptions = useMemo<Option[]>(
    () =>
      positions.map((position) => ({
        label: position.label,
        value: position.value,
      })),
    [positions]
  );

  const handleTargetChange = (selected: SingleValue<Option>) => {
    if (!selected) return;
    setValues((prev) => ({
      ...prev,
      target: selected.value as BannerTarget,
    }));
  };

  const handlePositionChange = (selected: SingleValue<Option>) => {
    if (!selected) return;
    setValues((prev) => ({
      ...prev,
      position: selected.value as BannerPosition,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!values.title.trim().length) {
      alert("Please provide a banner title.");
      return;
    }

    if (!values.link.trim().length) {
      alert("Please provide a banner link.");
      return;
    }

    onSubmit({
      ...values,
      title: values.title.trim(),
      link: values.link.trim(),
      image: values.image.trim(),
      content: values.content?.trim() || undefined,
      audience: values.audience?.trim() || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          {initialValues ? "Edit Banner" : "Add Banner"}
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Title
            </label>
            <input
              type="text"
              value={values.title}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Welcome Pack Reload"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Target
              </label>
              <Select<Option, false>
                isMulti={false}
                options={targetOptions}
                value={
                  targetOptions.find(
                    (option) => option.value === values.target
                  ) ?? null
                }
                onChange={handleTargetChange}
                styles={singleSelectStyles}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Position
              </label>
              <Select<Option, false>
                isMulti={false}
                options={positionOptions}
                value={
                  positionOptions.find(
                    (option) => option.value === values.position
                  ) ?? null
                }
                onChange={handlePositionChange}
                styles={singleSelectStyles}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Landing Link
            </label>
            <input
              type="url"
              value={values.link}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  link: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="https://example.com/promotion"
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
                setValues((prev) => ({
                  ...prev,
                  image: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="/casino/vegas-nights.png"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Content
            </label>
            <textarea
              rows={4}
              value={values.content ?? ""}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  content: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Promo description or HTML snippet"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Audience (optional)
            </label>
            <input
              type="text"
              value={values.audience ?? ""}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  audience: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="vip, welcome, all"
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
            Active banner
          </label>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialValues ? "Save Changes" : "Create Banner"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default BannerFormModal;

