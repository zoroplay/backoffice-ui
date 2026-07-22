import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { bonusCommissions, paidCommissions, weeklyCommissions } from "../commissions/data";

const rows = [...weeklyCommissions, ...paidCommissions, ...bonusCommissions].slice(0, 6);
const money = (value: number) => `NGN ${value.toLocaleString()}`;

export default function NetworkCommissionReportingPage() {
  const totalCommission = rows.reduce((sum, row) => sum + row.commissions, 0);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Commission Reporting" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Commission Reporting</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Report agency commissions by date range and channel: Sports, Virtual, and Casino.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <input defaultValue="2026-07-01" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <input defaultValue="2026-07-22" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
            <option>Sports</option>
            <option>Virtual</option>
            <option>Casino</option>
          </select>
          <button className="h-10 rounded-md bg-brand-500 px-4 text-sm font-medium text-white">Search</button>
        </div>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">Total commission: {money(totalCommission)}</div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>{["Agent", "Channel", "Tickets", "Amount Played", "Total Won", "Net", "Commission"].map((head) => <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.agent}</td>
                  <td className="px-4 py-3 capitalize text-gray-700 dark:text-gray-300">{row.sport}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.noOfTickets}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.amountPlayed)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.totalWon)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.net)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(row.commissions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
