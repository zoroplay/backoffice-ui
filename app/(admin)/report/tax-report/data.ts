// data.ts

// ----------------------
// Types
// ----------------------
export type TaxSummary = {
  period: string;
  beforeTax: number;
  afterTax: number;
  taxOnStake: number;
  taxOnWinnings: number;
};

export type TaxDetail = {
  customer: string;
  betslipId: string;
  punterAmt: number;
  stakeAmt: number;
  exciseAmt: number;
  odds: number;
  type: string;
  date: string;
  potentialWinnings: number;
  wthTax: number;
};
