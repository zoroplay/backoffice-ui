"use client";

import React, { useState } from "react";
import {
  DateRangePicker,
  Range,
  RangeKeyDict,
  DateRangePickerProps,
} from "react-date-range";

// Extend props so we can add optional features
interface FixedDateRangePickerProps extends DateRangePickerProps {
  showSelectionPreview?: boolean;
  showMonthAndYearPickers?: boolean;
}

interface DateRangeFilterProps {
  range: Range; // controlled state from parent
  onChange?: (range: Range) => void; // notify parent
}

export function DateRangeFilter({ range, onChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (ranges: RangeKeyDict) => {
    const { startDate, endDate } = ranges.selection;
    if (startDate && endDate) {
      const updatedRange: Range = { startDate, endDate, key: "selection" };
      onChange?.(updatedRange); // notify parent
      setIsOpen(false);
    }
  };

  

  return (
    <div className="relative">
      {/* Trigger input */}
    <input
      type="text"
      value={
        range?.startDate && range?.endDate
          ? `${range.startDate.toLocaleDateString()} - ${range.endDate.toLocaleDateString()}`
          : ""
      }
      readOnly
      onClick={() => setIsOpen(true)}
      className="border py-2 pl-3 rounded focus:outline-none focus:ring focus:ring-zinc-500 dark:bg-gray-900 dark:text-gray-50 dark:placeholder:text-gray-50"
/>

      {/* Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-10">
          <DateRangePicker
            ranges={[range]}
            onChange={handleSelect}
            {...({
              showSelectionPreview: true,
              showMonthAndYearPickers: true,
            } as FixedDateRangePickerProps)}
            className="shadow-lg border rounded bg-white dark:bg-gray-800"
          />
        </div>
      )}
    </div>
  );
}
