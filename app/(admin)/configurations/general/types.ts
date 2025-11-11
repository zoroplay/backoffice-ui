import type { StaticImageData } from "next/image";

export type BooleanSetting = "yes" | "no";

export type GeneralSettings = {
  mainLogo: string | StaticImageData | null;
  printLogo: string | StaticImageData | null;
  minimumWithdrawal: string;
  minimumDeposit: string;
  allowRegistration: BooleanSetting;
  enableBankAccount: BooleanSetting;
  autoDisburseRange: {
    from: string;
    to: string;
  };
  enablePowerBonus: BooleanSetting;
  commissionPayDay: string;
  bookingCodeDuration: string;
  tipsterTicketEligibility: string;
  allowDepositCommission: BooleanSetting;
  enableWebAffiliate: BooleanSetting;
  enableTax: BooleanSetting;
  trackierApiKey: string;
  country: string;
  currencySymbol: string;
  dialCode: string;
  maximumWithdrawal: string;
  maxUpcomingEventsDisplay: string;
  enableElbetUser: BooleanSetting;
  enableAutoDisbursement: BooleanSetting;
  autoDisbursementPerUserPerDay: string;
  powerBonusStartDate: string;
  printTicketStyle: string;
  liabilityThreshold: string;
  sliderSpeed: string;
  allowWithdrawalCommission: BooleanSetting;
  exciseTax: string;
  withholdingTax: string;
  trackierAuthCode: string;
};

export type GeneralSettingsSummary = {
  title: string;
  helper: string;
  metric: string;
  accent: string;
};

export type SelectOption<T extends string = string> = {
  label: string;
  value: T;
};
