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

export const withdrawals: Withdrawal[] = [
  {
    id: "1",
    dateRequested: "2025-11-01 10:30:00",
    username: "john_doe",
    nameOnFile: "John Doe",
    amount: 50000,
    accountNumber: "0123456789",
    accountName: "John Doe",
    bank: "Access Bank",
    updatedBy: "Admin User",
    status: "Completed",
    paymentMethod: "Bank Transfer",
    location: "Lagos",
    transactionId: "WTD-2025-001",
  },
  {
    id: "2",
    dateRequested: "2025-11-02 14:15:00",
    username: "jane_smith",
    nameOnFile: "Jane Smith",
    amount: 75000,
    accountNumber: "9876543210",
    accountName: "Jane Smith",
    bank: "GTBank",
    updatedBy: "Admin User",
    status: "Pending",
    paymentMethod: "Bank Transfer",
    location: "Abuja",
    transactionId: "WTD-2025-002",
  },
  {
    id: "3",
    dateRequested: "2025-11-03 09:45:00",
    username: "mike_wilson",
    nameOnFile: "Mike Wilson",
    amount: 100000,
    accountNumber: "5555666677",
    accountName: "Mike Wilson",
    bank: "Zenith Bank",
    updatedBy: "Admin User",
    status: "Approved",
    paymentMethod: "Bank Transfer",
    location: "Port Harcourt",
    transactionId: "WTD-2025-003",
  },
  {
    id: "4",
    dateRequested: "2025-11-03 16:20:00",
    username: "sarah_jones",
    nameOnFile: "Sarah Jones",
    amount: 25000,
    accountNumber: "1122334455",
    accountName: "Sarah Jones",
    bank: "UBA",
    updatedBy: "Admin User",
    status: "Processing",
    paymentMethod: "Mobile Money",
    location: "Lagos",
    transactionId: "WTD-2025-004",
  },
  {
    id: "5",
    dateRequested: "2025-11-04 11:00:00",
    username: "david_brown",
    nameOnFile: "David Brown",
    amount: 150000,
    accountNumber: "9988776655",
    accountName: "David Brown",
    bank: "First Bank",
    updatedBy: "Admin User",
    status: "Declined",
    paymentMethod: "Bank Transfer",
    location: "Kano",
    transactionId: "WTD-2025-005",
  },
  {
    id: "6",
    dateRequested: "2025-11-05 08:30:00",
    username: "emeka_obi",
    nameOnFile: "Emeka Obi",
    amount: 40000,
    accountNumber: "6677889900",
    accountName: "Emeka Obi",
    bank: "Sterling Bank",
    updatedBy: "Admin User",
    status: "Completed",
    paymentMethod: "Bank Transfer",
    location: "Enugu",
    transactionId: "WTD-2025-006",
  },
  {
    id: "7",
    dateRequested: "2025-11-05 13:55:00",
    username: "tola_akin",
    nameOnFile: "Tola Akin",
    amount: 65000,
    accountNumber: "3344556677",
    accountName: "Tola Akin",
    bank: "FCMB",
    updatedBy: "Admin User",
    status: "Pending",
    paymentMethod: "Mobile Money",
    location: "Ibadan",
    transactionId: "WTD-2025-007",
  },
  {
    id: "8",
    dateRequested: "2025-11-06 15:10:00",
    username: "blessing_udo",
    nameOnFile: "Blessing Udo",
    amount: 240000,
    accountNumber: "2211334455",
    accountName: "Blessing Udo",
    bank: "Union Bank",
    updatedBy: "Admin User",
    status: "Approved",
    paymentMethod: "Bank Transfer",
    location: "Calabar",
    transactionId: "WTD-2025-008",
  },
];

