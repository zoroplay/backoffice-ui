import { Transaction } from "./columns"

export const transactions: Transaction[] = [
  {
    date: "2025-09-16",
    transactionId: "TXN12345",
    user: "john_doe",
    operationType: "Deposit",
    description: "User deposited funds",
    amount: 200,
    prevBalance: 100,
    balance: 300,
  },
  {
    date: "2025-09-15",
    transactionId: "TXN67890",
    user: "jane_smith",
    operationType: "Bet Winnings",
    description: "Winnings credited",
    amount: 500,
    prevBalance: 200,
    balance: 700,
  },
]
