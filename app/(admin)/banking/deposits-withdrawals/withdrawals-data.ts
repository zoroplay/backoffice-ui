export type WithdrawalStatus =
  | "Pending"
  | "Approved"
  | "Declined"
  | "Processing"
  | "Completed";

export interface Withdrawal {
  id: string;
  dateRequested: string;
  username: string;
  nameOnFile: string;
  amount: number;
  accountNumber: string;
  accountName: string;
  bank: string;
  updatedBy: string;
  status: WithdrawalStatus;
  paymentMethod: string;
  location: string;
  transactionId: string;
}

