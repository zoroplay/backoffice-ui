"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";

export type BankingTransaction = {
  date: string;
  transactionId: string;
  operationType: string;
  description: string;
  amount: number;
  balance: number;
};

const mockBankingData: BankingTransaction[] = [
  {
    date: "2025-11-14 10:00:00",
    transactionId: "TXN-2025-001234",
    operationType: "Deposit",
    description: "Bank deposit from user001",
    amount: 50000,
    balance: 55000,
  },
  {
    date: "2025-11-14 11:30:00",
    transactionId: "TXN-2025-001235",
    operationType: "Withdrawal",
    description: "Withdrawal request by user002",
    amount: -20000,
    balance: 35000,
  },
  {
    date: "2025-11-14 12:15:00",
    transactionId: "TXN-2025-001236",
    operationType: "Bet Deposit",
    description: "Bet stake from player003",
    amount: 15000,
    balance: 50000,
  },
  {
    date: "2025-11-14 13:45:00",
    transactionId: "TXN-2025-001237",
    operationType: "Bet Winnings",
    description: "Winning payout to player004",
    amount: -45000,
    balance: 5000,
  },
  {
    date: "2025-11-14 14:20:00",
    transactionId: "TXN-2025-001238",
    operationType: "Deposit",
    description: "Bank deposit from user005",
    amount: 30000,
    balance: 35000,
  },
  {
    date: "2025-11-14 15:00:00",
    transactionId: "TXN-2025-001239",
    operationType: "Bonus",
    description: "Bonus credit to user006",
    amount: 5000,
    balance: 40000,
  },
  {
    date: "2025-11-14 16:30:00",
    transactionId: "TXN-2025-001240",
    operationType: "Interaccount Transfers",
    description: "Transfer to sub-agent007",
    amount: -10000,
    balance: 30000,
  },
  {
    date: "2025-11-14 17:00:00",
    transactionId: "TXN-2025-001241",
    operationType: "Deposit",
    description: "Bank deposit from user008",
    amount: 25000,
    balance: 55000,
  },
];

const columns: ColumnDef<BankingTransaction>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "transactionId", header: "Transaction ID" },
  { accessorKey: "operationType", header: "Operation Type" },
  { accessorKey: "description", header: "Description" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue<number>("amount");
      return (
        <span className={amount >= 0 ? "text-green-600" : "text-red-600"}>
          {amount >= 0 ? "+" : ""}₦{amount.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => `₦${row.getValue<number>("balance").toLocaleString()}`,
  },
];

interface BankingTabProps {
  agentId: string;
  agent: Agency;
}

function BankingTab({ agentId, agent }: BankingTabProps) {
  const [filteredData] = useState<BankingTransaction[]>(mockBankingData);

  // Calculate totals from transactions

  // const totalDeposits = filteredData
  //   .filter((tx) => tx.amount > 0)
  //   .reduce((sum, tx) => sum + tx.amount, 0);
  // const totalWithdrawals = Math.abs(
  //   filteredData
  //     .filter((tx) => tx.amount < 0)
  //     .reduce((sum, tx) => sum + tx.amount, 0)
  // );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
              Network Balance
            </h3>
            <div className="w-10 h-10 bg-indigo-200 dark:bg-indigo-800 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 dark:text-indigo-300 text-lg">₦</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
            ₦{agent.networkBalance.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              Available Balance
            </h3>
            <div className="w-10 h-10 bg-emerald-200 dark:bg-emerald-800 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 dark:text-emerald-300 text-lg">₦</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
            ₦{agent.availBalance.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
              Balance
            </h3>
            <div className="w-10 h-10 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center">
              <span className="text-amber-600 dark:text-amber-300 text-lg">₦</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
            ₦{agent.balance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>💳</span>
              Transaction History
            </h3>
           
          </div>
        </div>
        <div className="p-6">
          {filteredData.length > 0 ? (
            <DataTable columns={columns} data={filteredData} />
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No transactions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BankingTab;

