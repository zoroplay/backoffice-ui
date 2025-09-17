// data.ts
export type RetailCashRecord = {
  username: string;
  deposits: number;
  depositAmount: number;
  withdrawals: number;
  withdrawalAmount: number;
};

export const retailCashData: RetailCashRecord[] = [
  {
    username: "john_doe",
    deposits: 5,
    depositAmount: 1200,
    withdrawals: 2,
    withdrawalAmount: 500,
  },
  {
    username: "mary_smith",
    deposits: 3,
    depositAmount: 900,
    withdrawals: 1,
    withdrawalAmount: 200,
  },
  {
    username: "bettingKing",
    deposits: 8,
    depositAmount: 2500,
    withdrawals: 4,
    withdrawalAmount: 1000,
  },
  {
    username: "luckyStar",
    deposits: 2,
    depositAmount: 300,
    withdrawals: 0,
    withdrawalAmount: 0,
  },
];
