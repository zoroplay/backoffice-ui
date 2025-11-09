"use client";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

export type FilterGroupKey = "sport" | "status" | "market";

export type CustomFilterOption = SelectOption<string> & {
  group: FilterGroupKey;
};

