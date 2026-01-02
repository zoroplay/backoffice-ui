// types.ts
export type NetCashSummary = {
  deposits: number;
  depositAmount: number;
  avgDepositAmount: number;
  withdrawals: number;
  withdrawalAmount: number;
  avgWithdrawalAmount: number;
  netCash: number;
  ratio: number;
  date: string;
  paymentMethod: string;
  clientType: string;
};

export type NetCashGroup = {
  group: string;
  deposits: number;
  depositAmount: number;
  avgDepositAmount: number;
  withdrawals: number;
  withdrawalAmount: number;
  avgWithdrawalAmount: number;
  netCash: number;
  ratio: number;
  date: string;
  paymentMethod: string;
  clientType: string;
};

export const netCashSummaryData: NetCashSummary[] = [
  {
    deposits: 10,
    depositAmount: 5000,
    avgDepositAmount: 500,
    withdrawals: 4,
    withdrawalAmount: 2000,
    avgWithdrawalAmount: 500,
    netCash: 3000,
    ratio: 60,
    date: "2025-09-01",
    paymentMethod: "Paystack",
    clientType: "Website",
  },
  {
    deposits: 8,
    depositAmount: 4000,
    avgDepositAmount: 500,
    withdrawals: 3,
    withdrawalAmount: 1500,
    avgWithdrawalAmount: 500,
    netCash: 2500,
    ratio: 62.5,
    date: "2025-09-03",
    paymentMethod: "Bank Transfer",
    clientType: "Mobile",
  },
];

export const netCashGroupData: NetCashGroup[] = [
  {
    group: "Website",
    deposits: 5,
    depositAmount: 2000,
    avgDepositAmount: 400,
    withdrawals: 2,
    withdrawalAmount: 800,
    avgWithdrawalAmount: 400,
    netCash: 1200,
    ratio: 60,
    date: "2025-09-01",
    paymentMethod: "Paystack",
    clientType: "Website",
  },
  {
    group: "Mobile",
    deposits: 3,
    depositAmount: 1500,
    avgDepositAmount: 500,
    withdrawals: 1,
    withdrawalAmount: 400,
    avgWithdrawalAmount: 400,
    netCash: 1100,
    ratio: 73.3,
    date: "2025-09-02",
    paymentMethod: "Internal Transfer",
    clientType: "Mobile",
  },
  {
    group: "Cashier",
    deposits: 2,
    depositAmount: 1500,
    avgDepositAmount: 750,
    withdrawals: 1,
    withdrawalAmount: 600,
    avgWithdrawalAmount: 600,
    netCash: 900,
    ratio: 60,
    date: "2025-09-03",
    paymentMethod: "Bank Transfer",
    clientType: "Cashier",
  },
];
