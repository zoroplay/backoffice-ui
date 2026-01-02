"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

interface SmartSearchInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "className"
  > {
  value: string;
  onValueChange: (value: string) => void;
  debounce?: number;
  wrapperClassName?: string;
  inputClassName?: string;
}

const SmartSearchInput: React.FC<SmartSearchInputProps> = ({
  value,
  onValueChange,
  placeholder = "Search...",
  debounce = 0,
  wrapperClassName,
  inputClassName,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (debounce <= 0) {
      return;
    }

    const handler = setTimeout(() => {
      onValueChange(internalValue);
    }, debounce);

    return () => clearTimeout(handler);
  }, [internalValue, debounce, onValueChange]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setInternalValue(nextValue);

    if (debounce <= 0) {
      onValueChange(nextValue);
    }
  };

  const displayValue = debounce > 0 ? internalValue : value;

  return (
    <div className={cn("relative flex items-center", wrapperClassName)}>
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm transition-colors focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-brand-700",
          inputClassName
        )}
        {...rest}
      />
    </div>
  );
};

export default SmartSearchInput;


