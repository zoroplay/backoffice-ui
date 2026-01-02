export type DisplayMetric = "stake" | "winnings" | "stake_winnings" | "liability";

export type RefreshInterval = "15s" | "30s" | "1m" | "5m" | "manual";

export type ExposureMonitorSettings = {
  displayMetric: DisplayMetric;
  amountThreshold: string;
  notifyEmails: string;
  completionPercentage: string;
  maxTicketsPerPage: string;
  refreshInterval: RefreshInterval;
};

export type SelectOption<T extends string = string> = {
  label: string;
  value: T;
  description?: string;
};
