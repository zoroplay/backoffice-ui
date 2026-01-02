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

// ----------------------
// Dummy Data
// ----------------------
export const taxSummary: TaxSummary[] = [
  {
    period: "Jan 2025",
    beforeTax: 120000,
    afterTax: 110000,
    taxOnStake: 5000,
    taxOnWinnings: 5000,
  },
  {
    period: "Feb 2025",
    beforeTax: 100000,
    afterTax: 92000,
    taxOnStake: 4000,
    taxOnWinnings: 4000,
  },
];

export const taxDetails: TaxDetail[] = [
  {
    customer: "John Doe",
    betslipId: "B123",
    punterAmt: 5000,
    stakeAmt: 2000,
    exciseAmt: 100,
    odds: 2.5,
    type: "Mobile",
    date: "2025-09-12",
    potentialWinnings: 5000,
    wthTax: 4500,
  },
  {
    customer: "Jane Smith",
    betslipId: "B456",
    punterAmt: 3000,
    stakeAmt: 1500,
    exciseAmt: 80,
    odds: 1.8,
    type: "Website",
    date: "2025-09-13",
    potentialWinnings: 2700,
    wthTax: 2500,
  },
];
