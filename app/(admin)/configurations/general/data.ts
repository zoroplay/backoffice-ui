import { subDays } from "date-fns";

import type {
  GeneralSettings,
  GeneralSettingsSummary,
  SelectOption,
} from "./types";

export const countryOptions: SelectOption[] = [
  { label: "Nigeria", value: "Nigeria" },
  { label: "Ghana", value: "Ghana" },
  { label: "Kenya", value: "Kenya" },
  { label: "South Africa", value: "South Africa" },
  { label: "Tanzania", value: "Tanzania" },
];

export const currencySymbols: Record<string, string> = {
  Nigeria: "₦",
  Ghana: "₵",
  Kenya: "KSh",
  "South Africa": "R",
  Tanzania: "TSh",
};

export const dialCodes: Record<string, string> = {
  Nigeria: "+234",
  Ghana: "+233",
  Kenya: "+254",
  "South Africa": "+27",
  Tanzania: "+255",
};

export const paydayOptions: SelectOption[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
].map((day) => ({ label: day, value: day }));

export const ticketStyleOptions: SelectOption[] = [
  { label: "Type 1", value: "Type 1" },
  { label: "Type 2", value: "Type 2" },
  { label: "Type 3", value: "Type 3" },
];

export const booleanOptions: SelectOption[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export const defaultGeneralSettings: GeneralSettings = {
  mainLogo: "/images/branding/logo-primary.svg",
  printLogo: "/images/branding/logo-print.svg",
  minimumWithdrawal: "5000",
  minimumDeposit: "100",
  allowRegistration: "yes",
  enableBankAccount: "yes",
  autoDisburseRange: {
    from: "1000",
    to: "20000",
  },
  enablePowerBonus: "no",
  commissionPayDay: "Tuesday",
  bookingCodeDuration: "3",
  tipsterTicketEligibility: "5",
  allowDepositCommission: "no",
  enableWebAffiliate: "no",
  enableTax: "yes",
  trackierApiKey: "920358f173d1ba960821b",
  country: "Nigeria",
  currencySymbol: "₦",
  dialCode: "+234",
  maximumWithdrawal: "1000000",
  maxUpcomingEventsDisplay: "2",
  enableElbetUser: "no",
  enableAutoDisbursement: "yes",
  autoDisbursementPerUserPerDay: "5",
  powerBonusStartDate: subDays(new Date(), 3).toISOString(),
  printTicketStyle: "Type 1",
  liabilityThreshold: "0",
  sliderSpeed: "3000",
  allowWithdrawalCommission: "no",
  exciseTax: "11",
  withholdingTax: "7.5",
  trackierAuthCode: "S2aS04S6NLdjrjfiK5WOxg",
};

export const generalSettingsSummary: GeneralSettingsSummary[] = [
  {
    title: "Country of Operation",
    helper: "Impacts currency, dial code & fiscal options",
    metric: defaultGeneralSettings.country,
    accent: "bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-200",
  },
  {
    title: "Cash Flow",
    helper: "Min ₦" + defaultGeneralSettings.minimumWithdrawal + " · Max ₦" + defaultGeneralSettings.maximumWithdrawal,
    metric: "₦" + defaultGeneralSettings.minimumDeposit + "+",
    accent: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200",
  },
  {
    title: "Automation",
    helper: `Auto disburse up to ${defaultGeneralSettings.autoDisbursementPerUserPerDay}/user`,
    metric:
      defaultGeneralSettings.enableAutoDisbursement === "yes"
        ? "Enabled"
        : "Disabled",
    accent: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200",
  },
];
