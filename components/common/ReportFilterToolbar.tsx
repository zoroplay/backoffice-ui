"use client";

import React from "react";
import Select, {
  type GroupBase,
  type Props as SelectProps,
} from "react-select";
import type { Range } from "react-date-range";
import { Calendar, Filter } from "lucide-react";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";

type ReportFilterToolbarActions = {
  onSearch: () => void;
  onClear: () => void;
};

type ReportFilterToolbarSelectProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
> = SelectProps<Option, IsMulti, Group> & {
  containerClassName?: string;
  hideIcon?: boolean;
};

type ReportFilterToolbarProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = {
  dateRange: Range;
  onDateRangeChange: (range: Range) => void;
  actions?: ReportFilterToolbarActions;
  selectProps?: ReportFilterToolbarSelectProps<Option, IsMulti, Group> | null;
  className?: string;
  children?: React.ReactNode;
};

function ReportFilterToolbar<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  dateRange,
  onDateRangeChange,
  actions,
  selectProps,
  className,
  children,
}: ReportFilterToolbarProps<Option, IsMulti, Group>) {
  const { theme } = useTheme();

  const mergedContainerClassName = [
    "flex flex-wrap items-center justify-between gap-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-4",
    className ?? "",
  ]
    .join(" ")
    .trim();

  const shouldRenderSelect = Boolean(selectProps);
  const selectContainerClassName =
    selectProps?.containerClassName ?? "max-w-[22rem]";
  const selectStyles = selectProps?.styles ?? reactSelectStyles(theme);
  const { containerClassName, hideIcon, styles, ...restSelectProps } =
    selectProps ?? ({} as ReportFilterToolbarSelectProps<Option, IsMulti, Group>);

  return (
    <div className={mergedContainerClassName}>
      <div>
        <span className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          <DateRangeFilter range={dateRange} onChange={onDateRangeChange} />
        </span>
      </div>

      {shouldRenderSelect ? (
        <div className={selectContainerClassName}>
          <span className="flex items-center gap-2">
            {!hideIcon && (
              <Filter className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            )}
            <Select<Option, IsMulti, Group>
              styles={selectStyles}
              {...(restSelectProps as SelectProps<Option, IsMulti, Group>)}
            />
          </span>
        </div>
      ) : null}

      {children}

      {actions ? (
        <FilterActions onSearch={actions.onSearch} onClear={actions.onClear} />
      ) : null}
    </div>
  );
}

export { ReportFilterToolbar };

