"use client";

import { useCallback, useMemo } from "react";
import Select, { type SingleValue } from "react-select";

import Button from "@/components/ui/button/Button";
import { useTheme } from "@/context/ThemeContext";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { reactSelectStyles } from "@/utils/reactSelectStyles";

import type { CompetitionSettings } from "../types";

type SettingsField = keyof CompetitionSettings;

type CompetitionSettingsModalProps = {
  isOpen: boolean;
  competitionName: string;
  form: CompetitionSettings;
  combinabilityOptions: ReadonlyArray<{ value: string; label: string }>;
  onChange: (field: SettingsField, value: CompetitionSettings[SettingsField]) => void;
  onClose: () => void;
  onSave: () => void;
};

type CombinabilityOption = CompetitionSettingsModalProps["combinabilityOptions"][number];

export function CompetitionSettingsModal({
  isOpen,
  competitionName,
  form,
  combinabilityOptions,
  onChange,
  onClose,
  onSave,
}: CompetitionSettingsModalProps) {
  const { theme } = useTheme();

  const selectedCombinabilityOption = useMemo(() => {
    return (
      combinabilityOptions.find((option) => option.value === form.combinability) ?? null
    );
  }, [combinabilityOptions, form.combinability]);

  const handleCombinabilityChange = useCallback(
    (option: SingleValue<CombinabilityOption>) => {
      if (option) {
        onChange("combinability", option.value);
      }
    },
    [onChange]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader>{competitionName} Settings</ModalHeader>
      <ModalBody>
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Margin</label>
            <input
              type="number"
              value={form.margin}
              step={0.1}
              onChange={(event) => onChange("margin", Number(event.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Combinability</label>
            <Select<CombinabilityOption, false>
              styles={reactSelectStyles(theme)}
              options={combinabilityOptions}
              placeholder="Select combinability"
              value={selectedCombinabilityOption}
              onChange={handleCombinabilityChange}
              isClearable={false}
            />
          </div>

          <div className="w-full flex items-center justify-between gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="radio"
                      name="status"
                      value="enabled"
                      checked={form.status === "enabled"}
                      onChange={() => onChange("status", "enabled")}
                    />
                    Enable
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="radio"
                      name="status"
                      value="disabled"
                      checked={form.status === "disabled"}
                      onChange={() => onChange("status", "disabled")}
                    />
                    Disable
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Cash Out</p>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="radio"
                      name="cashout"
                      value="enabled"
                      checked={form.cashOut === "enabled"}
                      onChange={() => onChange("cashOut", "enabled")}
                    />
                    Enable
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="radio"
                      name="cashout"
                      value="disabled"
                      checked={form.cashOut === "disabled"}
                      onChange={() => onChange("cashOut", "disabled")}
                    />
                    Disable
                  </label>
                </div>
              </div>

           </div>
          
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onSave}>Save Changes</Button>
      </ModalFooter>
    </Modal>
  );
}

export default CompetitionSettingsModal;

