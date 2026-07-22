import Link from "next/link";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { money, sureOdds } from "../components/contentManagementData";

export default function SureOddsPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Sure Odds Manager" />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Sure Odds Manager</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              List paid Sure Odds offers with image, title, amount, edit and delete actions, matching the Nuxt manager page.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/content-management/sure-odds/payments" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">
              Payments
            </Link>
            <Link href="/content-management/sure-odds/add-new" className="rounded-md bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600">
              Add New
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">List</h2>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {["Image", "Title", "Amount", "Actions"].map((head) => (
                  <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {sureOdds.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <img src={item.imagePath} alt="" className="h-24 max-w-64 rounded-md object-cover" />
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-600 dark:text-brand-400">
                    <Link href={`/content-management/sure-odds/${item.id}`}>{item.title}</Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(item.amount)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/content-management/sure-odds/${item.id}`} className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white">
                        Edit
                      </Link>
                      <button type="button" className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 dark:border-red-500/30 dark:text-red-300">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
