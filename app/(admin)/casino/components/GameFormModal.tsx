"use client";

import React, { useEffect, useMemo, useState } from "react";
import Select, {
  type GroupBase,
  type MultiValue,
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
import { reactSelectStyles } from "@/utils/reactSelectStyles";

import type {
  CasinoFilterOption,
  CasinoGameStatus,
  GameCategory,
  GameFormValues,
  GameProvider,
} from "../types";

type Option = {
  label: string;
  value: string;
};

const defaultGameValues: GameFormValues = {
  name: "",
  slug: "",
  providerId: "",
  categories: [],
  tags: [],
  status: "active",
  isFeatured: false,
  hasBonusBuy: false,
  rtp: 96.0,
  volatility: "Medium",
  priority: 100,
  thumbnail: "/casino/vegas-nights.png",
};

type GameFormModalProps = {
  theme: string | null;
  isOpen: boolean;
  categories: GameCategory[];
  providers: GameProvider[];
  statusOptions: CasinoFilterOption[];
  initialValues?: GameFormValues;
  onClose: () => void;
  onSubmit: (values: GameFormValues) => void;
};

const volatilityOptions: Option[] = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
  { label: "Extreme", value: "Extreme" },
];

const GameFormModal: React.FC<GameFormModalProps> = ({
  theme,
  isOpen,
  categories,
  providers,
  statusOptions,
  initialValues,
  onClose,
  onSubmit,
}) => {
  const [values, setValues] = useState<GameFormValues>(() => {
    return {
      ...defaultGameValues,
      providerId: providers[0]?.id ?? "",
    };
  });

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues);
    } else {
      setValues({
        ...defaultGameValues,
        providerId: providers[0]?.id ?? "",
        thumbnail: providers[0] ? defaultGameValues.thumbnail : "",
      });
    }
  }, [initialValues, providers]);

  const normalizedTheme =
    theme === "light" || theme === "dark" ? theme : undefined;

  const selectStyles = useMemo<
    StylesConfig<Option, true, GroupBase<Option>>
  >(
    () =>
      reactSelectStyles<Option, true, GroupBase<Option>>(normalizedTheme),
    [normalizedTheme]
  );

  const singleSelectStyles = useMemo<
    StylesConfig<Option, false, GroupBase<Option>>
  >(
    () =>
      reactSelectStyles<Option, false, GroupBase<Option>>(normalizedTheme),
    [normalizedTheme]
  );

  const categoryOptions = useMemo<Option[]>(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categories]
  );

  const providerOptions = useMemo<Option[]>(
    () =>
      providers.map((provider) => ({
        label: provider.name,
        value: provider.id,
      })),
    [providers]
  );

  const statusSelectOptions = useMemo<Option[]>(
    () =>
      statusOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    [statusOptions]
  );

  const handleCategoryChange = (selected: MultiValue<Option>) => {
    setValues((prev) => ({
      ...prev,
      categories: selected.map((option) => option.value),
    }));
  };

  const handleProviderChange = (selected: SingleValue<Option>) => {
    if (!selected) return;
    setValues((prev) => ({
      ...prev,
      providerId: selected.value,
    }));
  };

  const handleStatusChange = (selected: SingleValue<Option>) => {
    if (!selected) return;
    setValues((prev) => ({
      ...prev,
      status: selected.value as CasinoGameStatus,
    }));
  };

  const handleVolatilityChange = (selected: SingleValue<Option>) => {
    if (!selected) return;
    setValues((prev) => ({
      ...prev,
      volatility: selected.value as GameFormValues["volatility"],
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!values.name.trim()) {
      alert("Please provide a game name.");
      return;
    }

    if (!values.slug.trim()) {
      alert("Please provide a slug.");
      return;
    }

    if (!values.providerId) {
      alert("Please select a provider.");
      return;
    }

    onSubmit({
      ...values,
      name: values.name.trim(),
      slug: values.slug.trim(),
      tags: values.tags.map((tag) => tag.trim()).filter(Boolean),
    });
  };

  const tagString = values.tags.join(", ");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          {initialValues ? "Edit Casino Game" : "Add Casino Game"}
        </ModalHeader>
        <ModalBody className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Game Name
              </label>
              <input
                type="text"
                value={values.name}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                placeholder="e.g. Gates of Olympus"
                required
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
                placeholder="gates-of-olympus"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Provider
              </label>
              <Select<Option, false>
                isMulti={false}
                options={providerOptions}
                value={
                  providerOptions.find(
                    (option) => option.value === values.providerId
                  ) ?? null
                }
                onChange={handleProviderChange}
                styles={singleSelectStyles}
                placeholder="Select provider"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Categories
              </label>
              <Select<Option, true>
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                options={categoryOptions}
                value={categoryOptions.filter((option) =>
                  values.categories.includes(option.value)
                )}
                onChange={handleCategoryChange}
                styles={selectStyles}
                placeholder="Select categories"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Status
              </label>
              <Select<Option, false>
                isMulti={false}
                options={statusSelectOptions}
                value={
                  statusSelectOptions.find(
                    (option) => option.value === values.status
                  ) ?? null
                }
                onChange={handleStatusChange}
                styles={singleSelectStyles}
                placeholder="Select status"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Volatility
              </label>
              <Select<Option, false>
                isMulti={false}
                options={volatilityOptions}
                value={
                  volatilityOptions.find(
                    (option) => option.value === values.volatility
                  ) ?? null
                }
                onChange={handleVolatilityChange}
                styles={singleSelectStyles}
                placeholder="Select volatility"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                RTP (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={values.rtp}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    rtp: Number(event.target.value),
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                min={80}
                max={99.9}
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Thumbnail Path
              </label>
              <input
                type="text"
                value={values.thumbnail}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    thumbnail: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                placeholder="/casino/vegas-nights.png"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagString}
                onChange={(event) => {
                  const split = event.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean);
                  setValues((prev) => ({
                    ...prev,
                    tags: split,
                  }));
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                placeholder="featured, bonus-buy"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 p-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={values.isFeatured}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    isFeatured: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              Featured placement
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 p-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={values.hasBonusBuy}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    hasBonusBuy: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              Bonus buy enabled
            </label>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialValues ? "Save Changes" : "Create Game"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default GameFormModal;

