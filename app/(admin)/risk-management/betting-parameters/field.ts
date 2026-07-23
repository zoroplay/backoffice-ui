import type { RiskCategory, RiskPeriod } from "./data";

type FieldType = "number" | "boolean";

export type RiskField = {
  label: string;
  option: (category: RiskCategory, period: RiskPeriod) => string;
  type: FieldType;
  prefix?: string;
  suffix?: string;
  helperText?: string;
  retailOnly?: boolean;
};

export type RiskFieldGroup = {
  title: string;
  description?: string;
  fields: RiskField[];
};

const option = (base: string) => (_category: RiskCategory, period: RiskPeriod) => `${base}_${period}`;

export const riskFieldGroups: RiskFieldGroup[] = [
  {
    title: "Withdrawal & Payout",
    description: "Manage withdrawal thresholds, available retail credit, and max payout controls.",
    fields: [
      { label: "Minimum Withdrawal", option: option("min_withdrawal"), type: "number", prefix: "NGN" },
      { label: "Maximum Withdrawal", option: option("max_withdrawal"), type: "number", prefix: "NGN" },
      {
        label: "Minimum Available Credit",
        option: option("network_min_available_credit"),
        type: "number",
        prefix: "NGN",
        helperText: "Minimum agent credit before withdrawal request.",
        retailOnly: true,
      },
      { label: "Max Payout", option: option("max_payout"), type: "number", prefix: "NGN" },
    ],
  },
  {
    title: "Odd Length",
    description: "Preserve separate minimum and maximum odd-length limits for single and combi tickets.",
    fields: [
      { label: "Min Single Odd Length", option: option("min_single_odd_length"), type: "number" },
      { label: "Max Single Odd Length", option: option("max_single_odd_length"), type: "number" },
      { label: "Min Combi Odd Length", option: option("min_combi_odd_length"), type: "number" },
      { label: "Max Combi Odd Length", option: option("max_combi_odd_length"), type: "number" },
    ],
  },
  {
    title: "Ticket Stake Settings",
    description: "Configure stake thresholds for single and combi tickets.",
    fields: [
      { label: "Single Min", option: option("single_min"), type: "number", prefix: "NGN" },
      { label: "Single Max", option: option("single_max"), type: "number", prefix: "NGN" },
      { label: "Combi Min", option: option("combi_min"), type: "number", prefix: "NGN" },
      { label: "Combi Max", option: option("combi_max"), type: "number", prefix: "NGN" },
    ],
  },
  {
    title: "Ticket Size Settings",
    description: "Limit ticket-size ranges for standard and live bets.",
    fields: [
      { label: "Ticket Size Minimum", option: option("size_min"), type: "number" },
      { label: "Ticket Size Maximum", option: option("size_max"), type: "number" },
      { label: "Live Ticket Size Minimum", option: option("live_size_min"), type: "number" },
      { label: "Live Ticket Size Maximum", option: option("live_size_max"), type: "number" },
    ],
  },
  {
    title: "Limits & Controls",
    description: "Set cancellation, winning, duplicate-ticket, draw, and hold limits.",
    fields: [
      { label: "Max Time to Cancel Ticket", option: option("max_time_to_cancel"), type: "number", suffix: "mins" },
      { label: "Daily Ticket Cancel Limit", option: option("daily_cancel_limit"), type: "number" },
      { label: "Single Ticket Max Winning", option: option("single_max_winning"), type: "number", prefix: "NGN" },
      { label: "Max Allowed Duplicate Ticket", option: option("max_duplicate_ticket"), type: "number" },
      {
        label: "Max No. Of Draws",
        option: option("max_no_of_draws"),
        type: "number",
        helperText: "Maximum number of draws allowed per ticket.",
      },
      {
        label: "Hold Bets From",
        option: (category, period) => `${category === "retail" ? "hold_bets_from" : "hold_bets"}_${period}`,
        type: "number",
        prefix: "NGN",
        helperText: "Minimum stake to hold bets for verification.",
      },
    ],
  },
  {
    title: "Betting Controls",
    description: "Enable or disable betting options for this category and period.",
    fields: [
      { label: "Accept PreMatch Bets", option: option("accept_prematch_bets"), type: "boolean" },
      { label: "Accept Live Bets", option: option("accept_live_bets"), type: "boolean" },
      { label: "Enable Cashout", option: option("enable_cashout"), type: "boolean" },
      { label: "Enable Cut (X)", option: option("enable_cut_x"), type: "boolean" },
      {
        label: "Enable System Bet",
        option: (category, period) => `${category === "retail" ? "accept_system_bet" : "allow_system_bet"}_${period}`,
        type: "boolean",
      },
      {
        label: "Enable Split Bet",
        option: (category, period) => `${category === "retail" ? "accept_split_bet" : "allow_split_bet"}_${period}`,
        type: "boolean",
      },
    ],
  },
  {
    title: "Bonus",
    description: "Adjust bonus qualifying odds.",
    fields: [
      {
        label: "Min Bonus Odd",
        option: option("min_bonus_odd"),
        type: "number",
        helperText: "Minimum odd for bonus calculation.",
      },
    ],
  },
];
