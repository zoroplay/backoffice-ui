// CashBooks Data
export type CashBookStatus = "Open" | "Closed" | "Pending" | "Approved";

export interface CashBook {
  id: string;
  date: string;
  branch: string;
  normalSales: number;
  normalPayout: number;
  virtualSales: number;
  virtualPayout: number;
  closingBalance: number;
  status: CashBookStatus;
}

export const cashBooks: CashBook[] = [
  {
    id: "1",
    date: "2025-11-04",
    branch: "Lagos Main Branch",
    normalSales: 450000,
    normalPayout: 280000,
    virtualSales: 320000,
    virtualPayout: 150000,
    closingBalance: 340000,
    status: "Open",
  },
  {
    id: "2",
    date: "2025-11-03",
    branch: "Abuja Branch",
    normalSales: 520000,
    normalPayout: 310000,
    virtualSales: 280000,
    virtualPayout: 120000,
    closingBalance: 370000,
    status: "Closed",
  },
  {
    id: "3",
    date: "2025-11-03",
    branch: "Port Harcourt Branch",
    normalSales: 380000,
    normalPayout: 220000,
    virtualSales: 250000,
    virtualPayout: 110000,
    closingBalance: 300000,
    status: "Approved",
  },
  {
    id: "4",
    date: "2025-11-02",
    branch: "Kano Branch",
    normalSales: 290000,
    normalPayout: 180000,
    virtualSales: 190000,
    virtualPayout: 85000,
    closingBalance: 215000,
    status: "Pending",
  },
  {
    id: "5",
    date: "2025-11-02",
    branch: "Ibadan Branch",
    normalSales: 410000,
    normalPayout: 250000,
    virtualSales: 270000,
    virtualPayout: 130000,
    closingBalance: 300000,
    status: "Closed",
  },
  {
    id: "6",
    date: "2025-11-01",
    branch: "Enugu Branch",
    normalSales: 350000,
    normalPayout: 210000,
    virtualSales: 230000,
    virtualPayout: 95000,
    closingBalance: 275000,
    status: "Approved",
  },
  {
    id: "7",
    date: "2025-11-01",
    branch: "Lagos Main Branch",
    normalSales: 480000,
    normalPayout: 295000,
    virtualSales: 310000,
    virtualPayout: 145000,
    closingBalance: 350000,
    status: "Closed",
  },
  {
    id: "8",
    date: "2025-10-31",
    branch: "Abuja Branch",
    normalSales: 540000,
    normalPayout: 330000,
    virtualSales: 290000,
    virtualPayout: 125000,
    closingBalance: 375000,
    status: "Approved",
  },
  {
    id: "9",
    date: "2025-10-31",
    branch: "Port Harcourt Branch",
    normalSales: 395000,
    normalPayout: 235000,
    virtualSales: 265000,
    virtualPayout: 115000,
    closingBalance: 310000,
    status: "Closed",
  },
  {
    id: "10",
    date: "2025-10-30",
    branch: "Kano Branch",
    normalSales: 310000,
    normalPayout: 190000,
    virtualSales: 200000,
    virtualPayout: 90000,
    closingBalance: 230000,
    status: "Approved",
  },
];

// Cash In Data
export type CashInStatus = "Pending" | "Approved" | "Rejected";

export interface CashIn {
  id: string;
  date: string;
  branch: string;
  amount: number;
  comment: string;
  status: CashInStatus;
}

export const cashIns: CashIn[] = [
  {
    id: "1",
    date: "2025-11-04 10:30:00",
    branch: "Lagos Main Branch",
    amount: 150000,
    comment: "Cash deposit from daily sales",
    status: "Approved",
  },
  {
    id: "2",
    date: "2025-11-04 09:15:00",
    branch: "Abuja Branch",
    amount: 220000,
    comment: "Cash collection from agents",
    status: "Pending",
  },
  {
    id: "3",
    date: "2025-11-03 14:20:00",
    branch: "Port Harcourt Branch",
    amount: 180000,
    comment: "Daily sales revenue",
    status: "Approved",
  },
  {
    id: "4",
    date: "2025-11-03 11:45:00",
    branch: "Kano Branch",
    amount: 95000,
    comment: "Cash deposit from shop",
    status: "Approved",
  },
  {
    id: "5",
    date: "2025-11-02 16:30:00",
    branch: "Ibadan Branch",
    amount: 130000,
    comment: "Weekend sales deposit",
    status: "Rejected",
  },
  {
    id: "6",
    date: "2025-11-02 13:10:00",
    branch: "Enugu Branch",
    amount: 175000,
    comment: "Cash from betting activities",
    status: "Approved",
  },
  {
    id: "7",
    date: "2025-11-01 15:50:00",
    branch: "Lagos Main Branch",
    amount: 200000,
    comment: "Monthly agent payment",
    status: "Approved",
  },
  {
    id: "8",
    date: "2025-11-01 10:20:00",
    branch: "Abuja Branch",
    amount: 165000,
    comment: "Cash collection",
    status: "Pending",
  },
  {
    id: "9",
    date: "2025-10-31 14:45:00",
    branch: "Port Harcourt Branch",
    amount: 145000,
    comment: "Daily operations deposit",
    status: "Approved",
  },
  {
    id: "10",
    date: "2025-10-31 11:30:00",
    branch: "Kano Branch",
    amount: 110000,
    comment: "Agent commission collection",
    status: "Approved",
  },
];

// Cash Out Data
export type CashOutStatus = "Pending" | "Approved" | "Rejected";

export interface CashOut {
  id: string;
  date: string;
  branch: string;
  amount: number;
  comment: string;
  status: CashOutStatus;
}

export const cashOuts: CashOut[] = [
  {
    id: "1",
    date: "2025-11-04 11:30:00",
    branch: "Lagos Main Branch",
    amount: 80000,
    comment: "Payout to winning customers",
    status: "Approved",
  },
  {
    id: "2",
    date: "2025-11-04 10:15:00",
    branch: "Abuja Branch",
    amount: 120000,
    comment: "Agent commission payment",
    status: "Pending",
  },
  {
    id: "3",
    date: "2025-11-03 15:20:00",
    branch: "Port Harcourt Branch",
    amount: 95000,
    comment: "Customer withdrawals",
    status: "Approved",
  },
  {
    id: "4",
    date: "2025-11-03 12:45:00",
    branch: "Kano Branch",
    amount: 55000,
    comment: "Winning payouts",
    status: "Approved",
  },
  {
    id: "5",
    date: "2025-11-02 17:30:00",
    branch: "Ibadan Branch",
    amount: 70000,
    comment: "Customer cash withdrawals",
    status: "Rejected",
  },
  {
    id: "6",
    date: "2025-11-02 14:10:00",
    branch: "Enugu Branch",
    amount: 88000,
    comment: "Payout processing",
    status: "Approved",
  },
  {
    id: "7",
    date: "2025-11-01 16:50:00",
    branch: "Lagos Main Branch",
    amount: 105000,
    comment: "Large withdrawal request",
    status: "Approved",
  },
  {
    id: "8",
    date: "2025-11-01 11:20:00",
    branch: "Abuja Branch",
    amount: 92000,
    comment: "Bulk payout processing",
    status: "Pending",
  },
  {
    id: "9",
    date: "2025-10-31 15:40:00",
    branch: "Port Harcourt Branch",
    amount: 78000,
    comment: "Customer withdrawal requests",
    status: "Approved",
  },
  {
    id: "10",
    date: "2025-10-31 12:15:00",
    branch: "Kano Branch",
    amount: 64000,
    comment: "Daily payout processing",
    status: "Approved",
  },
];

// Expenses Data
export type ExpenseStatus = "Pending" | "Approved" | "Rejected";

export interface Expense {
  id: string;
  expense: string;
  branch: string;
  user: string;
  amount: number;
  status: ExpenseStatus;
  approvedBy?: string;
  approvedAt?: string;
}

export const expenses: Expense[] = [
  {
    id: "1",
    expense: "Office Supplies",
    branch: "Lagos Main Branch",
    user: "john_admin",
    amount: 25000,
    status: "Approved",
    approvedBy: "super_admin",
    approvedAt: "2025-11-04 14:30:00",
  },
  {
    id: "2",
    expense: "Utilities Payment",
    branch: "Abuja Branch",
    user: "sarah_manager",
    amount: 45000,
    status: "Pending",
  },
  {
    id: "3",
    expense: "Staff Lunch",
    branch: "Port Harcourt Branch",
    user: "mike_supervisor",
    amount: 18000,
    status: "Approved",
    approvedBy: "regional_admin",
    approvedAt: "2025-11-03 16:20:00",
  },
  {
    id: "4",
    expense: "Equipment Maintenance",
    branch: "Kano Branch",
    user: "abdul_cashier",
    amount: 35000,
    status: "Approved",
    approvedBy: "super_admin",
    approvedAt: "2025-11-03 10:15:00",
  },
  {
    id: "5",
    expense: "Marketing Materials",
    branch: "Ibadan Branch",
    user: "tunde_agent",
    amount: 28000,
    status: "Rejected",
    approvedBy: "regional_admin",
    approvedAt: "2025-11-02 12:45:00",
  },
  {
    id: "6",
    expense: "Internet Subscription",
    branch: "Enugu Branch",
    user: "chioma_manager",
    amount: 22000,
    status: "Approved",
    approvedBy: "super_admin",
    approvedAt: "2025-11-02 09:30:00",
  },
  {
    id: "7",
    expense: "Security Services",
    branch: "Lagos Main Branch",
    user: "john_admin",
    amount: 50000,
    status: "Pending",
  },
  {
    id: "8",
    expense: "Transportation",
    branch: "Abuja Branch",
    user: "sarah_manager",
    amount: 15000,
    status: "Approved",
    approvedBy: "regional_admin",
    approvedAt: "2025-11-01 15:10:00",
  },
  {
    id: "9",
    expense: "Office Cleaning",
    branch: "Port Harcourt Branch",
    user: "mike_supervisor",
    amount: 12000,
    status: "Approved",
    approvedBy: "regional_admin",
    approvedAt: "2025-10-31 11:20:00",
  },
  {
    id: "10",
    expense: "Stationery Purchase",
    branch: "Kano Branch",
    user: "abdul_cashier",
    amount: 18500,
    status: "Pending",
  },
];

// Expense Types
export interface ExpenseType {
  id: string;
  title: string;
  category: string;
  amount: number;
}

export const expenseTypes: ExpenseType[] = [
  { id: "1", title: "Office Supplies", category: "Operations", amount: 50000 },
  { id: "2", title: "Utilities", category: "Operations", amount: 100000 },
  { id: "3", title: "Staff Welfare", category: "HR", amount: 75000 },
  { id: "4", title: "Maintenance", category: "Operations", amount: 80000 },
  { id: "5", title: "Marketing", category: "Sales", amount: 120000 },
  { id: "6", title: "Transportation", category: "Operations", amount: 45000 },
  { id: "7", title: "Security", category: "Facilities", amount: 90000 },
  { id: "8", title: "IT Services", category: "IT", amount: 150000 },
];

// Expense Categories
export interface ExpenseCategory {
  id: string;
  title: string;
  description: string;
}

export const expenseCategories: ExpenseCategory[] = [
  { id: "1", title: "Operations", description: "Day-to-day operational expenses" },
  { id: "2", title: "HR", description: "Human resources and staff-related expenses" },
  { id: "3", title: "Sales", description: "Sales and marketing expenses" },
  { id: "4", title: "IT", description: "Technology and infrastructure expenses" },
  { id: "5", title: "Facilities", description: "Building and facility maintenance" },
  { id: "6", title: "Finance", description: "Financial and accounting expenses" },
];

// Filter Options
export const branchOptions = [
  { value: "", label: "Select ..." },
  { value: "lagos", label: "Lagos Main Branch" },
  { value: "abuja", label: "Abuja Branch" },
  { value: "port-harcourt", label: "Port Harcourt Branch" },
  { value: "kano", label: "Kano Branch" },
  { value: "ibadan", label: "Ibadan Branch" },
  { value: "enugu", label: "Enugu Branch" },
];

export const statusOptions = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];


