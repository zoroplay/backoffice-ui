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
  onChange?: (range: Range) => void; // parent callback
  defaultRange?: Range;
}

export function DateRangeFilter({
  onChange,
  defaultRange,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectionRange, setSelectionRange] = useState<Range>(
    defaultRange || {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    }
  );

  const handleSelect = (ranges: RangeKeyDict) => {
    const { startDate, endDate } = ranges.selection;
    if (startDate && endDate) {
      const updatedRange = { startDate, endDate, key: "selection" };
      setSelectionRange(updatedRange);
      setIsOpen(false);
      onChange?.(updatedRange); // notify parent
    }
  };

  return (
    <div className="relative">
      {/* Trigger input */}
      <input
        type="text"
        value={`${selectionRange.startDate?.toLocaleDateString()} - ${selectionRange.endDate?.toLocaleDateString()}`}
        readOnly
        onClick={() => setIsOpen(true)}
        className="border py-2 pl-3 rounded focus:outline-none focus:ring focus:ring-zinc-500 dark:bg-gray-900 dark:text-white"
        placeholder="Select date range"
      />

      {/* Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-10">
          <DateRangePicker
            ranges={[selectionRange]}
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
