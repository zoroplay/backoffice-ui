export type DepositStatus =
  | "Pending"
  | "Approved"
  | "Declined"
  | "Processing"
  | "Completed";

export type ClientType = "Regular" | "VIP" | "Premium" | "Agent";

export type ReviewStatus = "Under Review" | "Reviewed" | "Flagged" | "Clear";

export interface Deposit {
  id: string;
  createdDate: string;
  lastUpdatedDate: string;
  transactionId: string;
  paymentMethod: string;
  bank: string;
  username: string;
  fullName: string;
  amount: number;
  transactionNote: string;
  status: DepositStatus;
  clientType: ClientType;
  handledBy: string;
  action: string;
  approve: boolean;
  declineReason: string;
  reviewStatus: ReviewStatus;
  location: string;
}

