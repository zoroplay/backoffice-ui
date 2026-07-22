import { notFound } from "next/navigation";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { promotionPlatforms, promotionStatuses, promotionTypes, promotionsSeed } from "../data";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ promotionId: string }>;
}) {
  const { promotionId } = await params;
  const promotion = promotionsSeed.find((item) => item.id === promotionId);

  if (!promotion) {
    notFound();
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle={`Edit Promotion: ${promotion.title}`} />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Edit Promotion
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Preserve the Nuxt dynamic promotion-edit route with editable campaign metadata, status, platform, scheduling, and content.
        </p>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <input defaultValue={promotion.title} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <select defaultValue={promotion.platform} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              {promotionPlatforms.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select defaultValue={promotion.type} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              {promotionTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
            <select defaultValue={promotion.status} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              {promotionStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
            <input defaultValue={promotion.startDate} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input defaultValue={promotion.endDate} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          </div>
          <textarea defaultValue={promotion.description} className="min-h-32 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600">Delete</button>
            <button type="button" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">Save Changes</button>
          </div>
        </form>
      </section>
    </div>
  );
}
