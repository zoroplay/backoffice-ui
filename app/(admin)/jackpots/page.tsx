import Link from "next/link";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { weeklyJackpotsData } from "./weekly-jackpots/data";

const money = (value: number) => `NGN ${value.toLocaleString()}`;

export default function JackpotsPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Jackpots" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Jackpots</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">List, add, edit, and manage jackpot campaigns.</p>
          </div>
          <Link href="/jackpots/add-new" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">Add New</Link>
        </div>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900"><tr>{["Title", "Amount", "Min Stake", "Games", "Tickets", "GGR", "Action"].map((head) => <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {weeklyJackpotsData.map((jackpot) => (
                <tr key={jackpot.id}>
                  <td className="px-4 py-3 font-medium text-brand-600 dark:text-brand-400"><Link href={`/jackpots/${jackpot.id}`}>{jackpot.title}</Link></td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(jackpot.amount)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(jackpot.minStake)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{jackpot.noOfGames}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{jackpot.noOfTickets}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(jackpot.ggr)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Edit / Delete</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
