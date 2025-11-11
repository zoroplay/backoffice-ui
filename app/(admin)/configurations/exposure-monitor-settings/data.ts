import type {
  DisplayMetric,
  ExposureMonitorSettings,
  RefreshInterval,
  SelectOption,
} from "./types";

export const displayMetricOptions: SelectOption<DisplayMetric>[] = [
  {
    label: "Stake / Pot Winnings",
    value: "stake_winnings",
    description: "Flag tickets based on either stake or projected returns",
  },
  {
    label: "Stakes Only",
    value: "stake",
    description: "Focus solely on stake exposure",
  },
  {
    label: "Potential Winnings",
    value: "winnings",
    description: "Monitor payout liability for each ticket",
  },
  {
    label: "Liability",
    value: "liability",
    description: "Track combined liability metrics",
  },
];

export const refreshIntervalOptions: SelectOption<RefreshInterval>[] = [
  { label: "Every 15 seconds", value: "15s" },
  { label: "Every 30 seconds", value: "30s" },
  { label: "Every 1 minute", value: "1m" },
  { label: "Every 5 minutes", value: "5m" },
  { label: "Manual", value: "manual" },
];

export const defaultExposureSettings: ExposureMonitorSettings = {
  displayMetric: "stake_winnings",
  amountThreshold: "1000000",
  notifyEmails: "risk-team@example.com,finance@example.com",
  completionPercentage: "85",
  maxTicketsPerPage: "50",
  refreshInterval: "30s",
};

export const activityTimeline = [
  {
    id: "timeline-1",
    title: "Max tickets per page",
    description: "Updated to 50 to improve analyst throughput",
    actor: "Risk Ops Bot",
    timestamp: "2 hrs ago",
  },
  {
    id: "timeline-2",
    title: "Refresh interval",
    description: "Set to 30s to match trading desk requirements",
    actor: "Chidi Arinze",
    timestamp: "1 day ago",
  },
  {
    id: "timeline-3",
    title: "Notification list",
    description: "Finance distribution now included",
    actor: "Lucy Wang",
    timestamp: "4 days ago",
  },
];
