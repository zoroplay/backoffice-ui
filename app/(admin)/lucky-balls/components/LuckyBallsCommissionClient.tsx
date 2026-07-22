"use client";

import { useMemo, useState } from "react";

import {
  formatMoney,
  formatNumber,
  luckyBallsCommissionAgents,
} from "../data";

const defaultFromDate = "15-07-2026";
const defaultToDate = "22-07-2026";

export default function LuckyBallsCommissionClient() {
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [bonusAmount, setBonusAmount] = useState("0");
  const [selected, setSelected] = useState<string[]>([]);

  const allSelected = selected.length === luckyBallsCommissionAgents.length;
  const selectedTotal = useMemo(
    () =>
      luckyBallsCommissionAgents
        .filter((agent) => selected.includes(agent.userId))
        .reduce((total, agent) => total + agent.commission, 0),
    [selected],
  );

  function toggleAll() {
    setSelected(allSelected ? [] : luckyBallsCommissionAgents.map((agent) => agent.userId));
  }

  function toggleAgent(userId: string) {
    setSelected((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto]" aria-label="Lucky Balls commission search">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            From
            <input
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            To
            <input
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
          <button
            type="button"
            className="h-10 self-end rounded-md bg-brand-500 px-5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Search
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Results</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Calculates agent commission for the selected date window before pay-out.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bonus Amount
              <input
                type="number"
                min="0"
                value={bonusAmount}
                onChange={(event) => setBonusAmount(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 sm:w-48"
              />
            </label>
            <button
              type="button"
              className="h-10 self-end rounded-md bg-success-500 px-5 text-sm font-medium text-white hover:bg-success-600"
              title={
                selected.length
                  ? `Would credit ${selected.length} selected agents`
                  : "Select at least one agent before paying"
              }
            >
              Pay All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto p-5">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all agents"
                  />
                </th>
                {[
                  "Agent",
                  "No. of Tickets",
                  "Amount Played",
                  "Total Won",
                  "Net",
                  "Commissions",
                  "Profit",
                ].map((head) => (
                  <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {luckyBallsCommissionAgents.map((agent) => (
                <tr key={agent.userId}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(agent.userId)}
                      onChange={() => toggleAgent(agent.userId)}
                      aria-label={`Select ${agent.agencyCodeName}`}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-600 dark:text-brand-400">
                    {agent.agencyCodeName}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatNumber(agent.numberOfTickets)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(agent.moneyIn)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(agent.moneyWon)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(agent.net)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(agent.commission)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(agent.net - agent.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Selected agents: <span className="font-semibold text-gray-900 dark:text-white">{selected.length}</span>
            </p>
            <p>
              Selected commission total: <span className="font-semibold text-gray-900 dark:text-white">{formatMoney(selectedTotal)}</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
