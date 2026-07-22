import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { promotionPlatforms, promotionStatuses, promotionTypes } from "../data";

export default function AddPromotionPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add Promotion" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Add Promotion
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Create a promotion with title, platform, type, dates, status, image, and landing content.
        </p>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <input placeholder="Title" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              {promotionPlatforms.map((option) => <option key={option.value}>{option.label}</option>)}
            </select>
            <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              {promotionTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
            <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              {promotionStatuses.map((status) => <option key={status.value}>{status.label}</option>)}
            </select>
            <input defaultValue="2026-07-22" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input defaultValue="2026-08-22" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          </div>
          <textarea placeholder="Promotion content" className="min-h-32 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <div className="flex justify-end">
            <button type="button" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">Save Promotion</button>
          </div>
        </form>
      </section>
    </div>
  );
}
