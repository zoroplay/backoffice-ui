"use client";

import React, { useId } from "react";
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

type TableFilterToolbarActions = {
  onSearch: () => void | Promise<void>;
  onClear: () => void | Promise<void>;
};

type TableFilterToolbarSelectProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
> = SelectProps<Option, IsMulti, Group> & {
  containerClassName?: string;
  hideIcon?: boolean;
};

type TableFilterToolbarProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = {
  dateRange?: Range;
  onDateRangeChange?: (range: Range) => void;
  actions?: TableFilterToolbarActions;
  isLoading?: boolean;
  selectProps?: TableFilterToolbarSelectProps<Option, IsMulti, Group> | null;
  className?: string;
  children?: React.ReactNode;
};

function TableFilterToolbar<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  dateRange,
  onDateRangeChange,
  actions,
  isLoading,
  selectProps,
  className,
  children,
}: TableFilterToolbarProps<Option, IsMulti, Group>) {
  const { theme } = useTheme();
  const instanceId = useId();

  const mergedContainerClassName = [
    "flex flex-wrap items-center justify-between gap-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-4",
    className ?? "",
  ]
    .join(" ")
    .trim();

  const shouldRenderSelect = Boolean(selectProps);
  const {
    containerClassName,
    hideIcon,
    styles: providedStyles,
    className: selectClassNameProp,
    ...restSelectProps
  } = selectProps ?? ({} as TableFilterToolbarSelectProps<Option, IsMulti, Group>);

  const selectContainerClassName = [
    "w-full",
    containerClassName ?? "max-w-[22rem]",
  ]
    .join(" ")
    .trim();
  const selectStyles = providedStyles ?? reactSelectStyles(theme);
  const selectClassName = ["w-full", "min-w-0", selectClassNameProp ?? ""]
    .join(" ")
    .trim();

  return (
    <div className={mergedContainerClassName}>
      {dateRange && onDateRangeChange && (
        <div>
          <span className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <DateRangeFilter
              range={dateRange}
              onChange={onDateRangeChange}
            />
          </span>
        </div>
      )}

      {shouldRenderSelect ? (
        <div className={selectContainerClassName}>
          <div className="flex items-center gap-2 w-full">
            {!hideIcon && (
              <Filter className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            )}
            <Select<Option, IsMulti, Group>
              instanceId={instanceId}
              className={selectClassName}
              styles={selectStyles}
              {...(restSelectProps as SelectProps<Option, IsMulti, Group>)}
            />
          </div>
        </div>
      ) : null}

      {children}

      {actions ? (
        <FilterActions
          onSearch={actions.onSearch}
          onClear={actions.onClear}
          isLoading={isLoading}
        />
      ) : null}
    </div>
  );
}

export { TableFilterToolbar };

