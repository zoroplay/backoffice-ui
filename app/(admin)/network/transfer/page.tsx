import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { agencies } from "../agency-list/data";

const transfers = [
  { id: "TRF-001", from: "Operations Main", to: "SPA-NG-1001", amount: 250000, status: "Completed" },
  { id: "TRF-002", from: "SPA-NG-2001", to: "agent-lagos-01", amount: 75000, status: "Pending" },
  { id: "TRF-003", from: "Retail Cash Float", to: "shop-lagos-12", amount: 120000, status: "Completed" },
];

const money = (value: number) => `NGN ${value.toLocaleString()}`;

export default function NetworkTransferPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Fund Transfer" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Fund Transfer</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Move funds between operation accounts and agency network users while preserving the Nuxt network transfer route.
        </p>
      </section>
      <div className="grid gap-6 xl:grid-cols-[420px,minmax(0,1fr)]">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">New Transfer</h2>
          <form className="mt-5 space-y-4">
            <select className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              <option>Operations Main</option>
              {agencies.slice(0, 6).map((agency) => <option key={agency.id}>{agency.username}</option>)}
            </select>
            <select className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              {agencies.slice(0, 8).map((agency) => <option key={agency.id}>{agency.username}</option>)}
            </select>
            <input placeholder="Amount" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <textarea placeholder="Narration" className="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <button type="button" className="w-full rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">Submit Transfer</button>
          </form>
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Transfers</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>{["From", "To", "Amount", "Status"].map((head) => <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                {transfers.map((transfer) => (
                  <tr key={transfer.id}>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{transfer.from}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{transfer.to}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(transfer.amount)}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{transfer.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
