"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";

import type { JackpotCampaign } from "./jackpotData";
import { jackpotCampaigns, money } from "./jackpotData";

export default function JackpotCampaignsClient() {
  const [campaigns, setCampaigns] = useState<JackpotCampaign[]>(jackpotCampaigns);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingDelete = useMemo(
    () => campaigns.find((campaign) => campaign.id === pendingDeleteId),
    [campaigns, pendingDeleteId],
  );

  function deleteCampaign() {
    if (!pendingDeleteId) return;
    setCampaigns((current) => current.filter((campaign) => campaign.id !== pendingDeleteId));
    setPendingDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Jackpots Manager</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Campaign list with amount, stake, fixture count, ticket totals, GGR, edit, and delete actions.
            </p>
          </div>
          <Link
            href="/jackpots/add-new"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600"
          >
            <Plus size={16} />
            Add New
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {["Title", "Amount", "Min. Stake", "No. of Games", "No. of Tickets", "GGR", "Action"].map((head) => (
                  <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{campaign.title}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(campaign.amount)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(campaign.stake)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{campaign.fixtures.length}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{campaign.totalBets}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(campaign.ggr)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/jackpots/${campaign.id}`}
                        aria-label={`Edit ${campaign.title}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-500 text-white hover:bg-brand-600"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        type="button"
                        aria-label={`Delete ${campaign.title}`}
                        onClick={() => setPendingDeleteId(campaign.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!campaigns.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No record found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {pendingDelete ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-300">Are you sure?</h3>
              <p className="mt-1 text-sm text-red-600 dark:text-red-200">
                You will not be able to recover {pendingDelete.title}.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-500/30 dark:text-red-200"
              >
                No, keep item
              </button>
              <button
                type="button"
                onClick={deleteCampaign}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes, delete item
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
