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

export const deposits: Deposit[] = [
  {
    id: "1",
    createdDate: "2025-11-01 08:30:00",
    lastUpdatedDate: "2025-11-01 09:00:00",
    transactionId: "DEP-2025-001",
    paymentMethod: "Bank Transfer",
    bank: "Access Bank",
    username: "alice_wonder",
    fullName: "Alice Wonder",
    amount: 100000,
    transactionNote: "Initial deposit",
    status: "Completed",
    clientType: "VIP",
    handledBy: "Admin User",
    action: "Credited",
    approve: true,
    declineReason: "",
    reviewStatus: "Clear",
    location: "Lagos",
  },
  {
    id: "2",
    createdDate: "2025-11-02 10:15:00",
    lastUpdatedDate: "2025-11-02 10:15:00",
    transactionId: "DEP-2025-002",
    paymentMethod: "Card",
    bank: "GTBank",
    username: "bob_builder",
    fullName: "Bob Builder",
    amount: 50000,
    transactionNote: "Deposit via card",
    status: "Pending",
    clientType: "Regular",
    handledBy: "",
    action: "Pending Review",
    approve: false,
    declineReason: "",
    reviewStatus: "Under Review",
    location: "Abuja",
  },
  {
    id: "3",
    createdDate: "2025-11-03 12:45:00",
    lastUpdatedDate: "2025-11-03 13:00:00",
    transactionId: "DEP-2025-003",
    paymentMethod: "Mobile Money",
    bank: "Zenith Bank",
    username: "charlie_brown",
    fullName: "Charlie Brown",
    amount: 75000,
    transactionNote: "Mobile transfer",
    status: "Approved",
    clientType: "Premium",
    handledBy: "Admin User",
    action: "Approved",
    approve: true,
    declineReason: "",
    reviewStatus: "Reviewed",
    location: "Port Harcourt",
  },
  {
    id: "4",
    createdDate: "2025-11-03 14:30:00",
    lastUpdatedDate: "2025-11-03 15:00:00",
    transactionId: "DEP-2025-004",
    paymentMethod: "Bank Transfer",
    bank: "UBA",
    username: "diana_prince",
    fullName: "Diana Prince",
    amount: 200000,
    transactionNote: "Large deposit",
    status: "Processing",
    clientType: "VIP",
    handledBy: "Admin User",
    action: "Processing",
    approve: false,
    declineReason: "",
    reviewStatus: "Flagged",
    location: "Lagos",
  },
  {
    id: "5",
    createdDate: "2025-11-04 09:20:00",
    lastUpdatedDate: "2025-11-04 09:45:00",
    transactionId: "DEP-2025-005",
    paymentMethod: "Bank Transfer",
    bank: "First Bank",
    username: "edward_stark",
    fullName: "Edward Stark",
    amount: 30000,
    transactionNote: "Weekly deposit",
    status: "Declined",
    clientType: "Agent",
    handledBy: "Admin User",
    action: "Declined",
    approve: false,
    declineReason: "Insufficient verification documents",
    reviewStatus: "Reviewed",
    location: "Kano",
  },
];

