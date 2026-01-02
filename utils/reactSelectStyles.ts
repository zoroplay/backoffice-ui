import { StylesConfig, GroupBase } from "react-select";

/**
 * Custom styles for react-select that support both light and dark modes
 * Usage: 
 * const { theme } = useTheme();
 * <Select styles={reactSelectStyles(theme)} ... />
 */
export const reactSelectStyles = <
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(theme: "light" | "dark" = "light"): StylesConfig<Option, IsMulti, Group> => {
  const dark = theme === "dark";

  return {
    control: (provided, state) => ({
      ...provided,
      minHeight: "44px",
      borderRadius: "0.5rem",
      borderColor: state.isFocused
        ? dark
          ? "#2a31d8"
          : "#9cb9ff"
        : dark
        ? "#344054"
        : "#d0d5dd",
      backgroundColor: dark ? "#1d2939" : "#ffffff",
      boxShadow: state.isFocused
        ? "0 0 0 3px rgba(70, 95, 255, 0.1)"
        : "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
      "&:hover": {
        borderColor: dark ? "#475467" : "#98a2b3",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "2px 12px",
    }),
    input: (provided) => ({
      ...provided,
      color: dark ? "rgba(255, 255, 255, 0.9)" : "#101828",
      margin: 0,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: dark ? "rgba(255, 255, 255, 0.9)" : "#1d2939",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: dark ? "rgba(255, 255, 255, 0.3)" : "#98a2b3",
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "0.5rem",
      border: dark ? "1px solid #344054" : "1px solid #e4e7ec",
      backgroundColor: dark ? "#1d2939" : "#ffffff",
      boxShadow:
        "0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)",
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: "4px",
      maxHeight: "300px",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? dark
          ? "rgba(70, 95, 255, 0.12)"
          : "#ecf3ff"
        : state.isFocused
        ? dark
          ? "rgba(255, 255, 255, 0.05)"
          : "#f9fafb"
        : "transparent",
      color: state.isSelected
        ? dark
          ? "#9cb9ff"
          : "#2a31d8"
        : dark
        ? "#d0d5dd"
        : "#344054",
      cursor: "pointer",
      borderRadius: "0.375rem",
      padding: "8px 12px",
      fontSize: "14px",
      "&:active": {
        backgroundColor: dark ? "rgba(70, 95, 255, 0.2)" : "#dde9ff",
      },
    }),
    group: (provided) => ({
      ...provided,
      paddingTop: "6px",
      paddingBottom: "8px",
      paddingLeft: "4px",
      paddingRight: "4px",
    }),
    groupHeading: (provided) => ({
      ...provided,
      fontSize: "12px",
      fontWeight: 600,
      color: dark ? "#a3b3ff" : "#465fff",
      textTransform: "uppercase" as const,
      padding: "8px 12px 6px",
      marginBottom: "6px",
      marginTop: "4px",
      backgroundColor: dark ? "rgba(70, 95, 255, 0.12)" : "#f2f7ff",
      borderRadius: "10px",
      border: dark ? "1px solid rgba(70, 95, 255, 0.25)" : "1px solid #c2d6ff",
      letterSpacing: "0.08em",
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: dark ? "#344054" : "#d0d5dd",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: dark ? "#98a2b3" : "#667085",
      "&:hover": {
        color: dark ? "#d0d5dd" : "#344054",
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: dark ? "#98a2b3" : "#667085",
      "&:hover": {
        color: dark ? "#d0d5dd" : "#344054",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: dark ? "rgba(70, 95, 255, 0.15)" : "#ecf3ff",
      borderRadius: "0.375rem",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: dark ? "#9cb9ff" : "#2a31d8",
      fontSize: "14px",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: dark ? "#9cb9ff" : "#465fff",
      "&:hover": {
        backgroundColor: dark ? "rgba(70, 95, 255, 0.25)" : "#dde9ff",
        color: dark ? "#c2d6ff" : "#2a31d8",
      },
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: dark ? "#98a2b3" : "#667085",
      fontSize: "14px",
    }),
    loadingMessage: (provided) => ({
      ...provided,
      color: dark ? "#98a2b3" : "#667085",
      fontSize: "14px",
    }),
  };
};

