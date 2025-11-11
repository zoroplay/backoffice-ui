'use client';

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import Button from "@/components/ui/button/Button";
import type { BooleanSetting } from "../types";

type BooleanToggleProps = {
  label: string;
  helper?: string;
  value: BooleanSetting;
  onChange: (value: BooleanSetting) => void;
  layout?: "horizontal" | "vertical";
};

export function BooleanToggle({
  label,
  helper,
  value,
  onChange,
  layout = "horizontal",
}: BooleanToggleProps) {
  const isYes = value === "yes";

  const handleSelect = (next: BooleanSetting) => () => {
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {label}
        </label>
        {helper ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">{helper}</p>
        ) : null}
      </div>
      <div
        className={
          layout === "horizontal"
            ? "flex items-center gap-2"
            : "grid w-full gap-2"
        }
      >
        <Button
          type="button"
          variant={isYes ? "primary" : "outline"}
          size="sm"
          className={
            isYes
              ? "bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-400 dark:text-gray-950 dark:hover:bg-brand-300"
              : "border-gray-300 text-gray-600 hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300"
          }
          startIcon={<CheckCircle2 className="h-4 w-4" />}
          onClick={handleSelect("yes")}
        >
          Yes
        </Button>
        <Button
          type="button"
          variant={isYes ? "outline" : "primary"}
          size="sm"
          className={
            !isYes
              ? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-brand-500 dark:text-white"
              : "border-gray-300 text-gray-600 hover:border-brand-300 hover:text-brand-300 dark:border-gray-700 dark:text-gray-300"
          }
          startIcon={<XCircle className="h-4 w-4" />}
          onClick={handleSelect("no")}
        >
          No
        </Button>
      </div>
    </div>
  );
}

export default BooleanToggle;
