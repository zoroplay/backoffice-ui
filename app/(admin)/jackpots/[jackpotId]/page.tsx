import { notFound } from "next/navigation";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { weeklyJackpotsData } from "../weekly-jackpots/data";

const money = (value: number) => `NGN ${value.toLocaleString()}`;

export default async function EditJackpotPage({
  params,
}: {
  params: Promise<{ jackpotId: string }>;
}) {
  const { jackpotId } = await params;
  const jackpot = weeklyJackpotsData.find((item) => item.id === jackpotId);

  if (!jackpot) {
    notFound();
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle={`Edit Jackpot: ${jackpot.title}`} />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Jackpot</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Update jackpot campaign settings, fixtures, consolation bonuses, terms, and commercial limits.
        </p>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input defaultValue={jackpot.title} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input defaultValue={money(jackpot.amount)} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input defaultValue={money(jackpot.minStake)} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input defaultValue={jackpot.noOfGames} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input defaultValue={`${jackpot.agentCommission}%`} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input defaultValue={jackpot.fixtures.join(", ")} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          </div>
          <textarea defaultValue={jackpot.terms} className="min-h-32 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 dark:border-red-500/30 dark:text-red-300">Delete</button>
            <button type="button" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">Save Changes</button>
          </div>
        </form>
      </section>
    </div>
  );
}
