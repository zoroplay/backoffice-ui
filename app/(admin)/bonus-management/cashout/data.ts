import { CashoutReduction } from "./columns";

export const cashoutReductionData: CashoutReduction[] = [
  {
    id: "1",
    minOdds: 1.5,
    reductionPercent: 5,
    type: "Web",
  },
  {
    id: "2",
    minOdds: 2.0,
    reductionPercent: 10,
    type: "Web",
  },
  {
    id: "3",
    minOdds: 3.0,
    reductionPercent: 15,
    type: "Web",
  },
  {
    id: "4",
    minOdds: 1.5,
    reductionPercent: 5,
    type: "Shop",
  },
  {
    id: "5",
    minOdds: 2.5,
    reductionPercent: 12,
    type: "Shop",
  },
  {
    id: "6",
    minOdds: 4.0,
    reductionPercent: 20,
    type: "Shop",
  },
];

export type CashoutSettings = {
  enabled: boolean;
  stakePercentage: string;
  minPayout: string;
  maxPayout: string;
};

export const defaultWebSettings: CashoutSettings = {
  enabled: false,
  stakePercentage: "",
  minPayout: "",
  maxPayout: "",
};

export const defaultShopSettings: CashoutSettings = {
  enabled: false,
  stakePercentage: "",
  minPayout: "",
  maxPayout: "",
};

