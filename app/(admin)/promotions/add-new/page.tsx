import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import PromotionEditorClient from "../components/PromotionEditorClient";

export default function AddPromotionPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add New Promotion" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Promotion</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          Create a promotion with required title, image preview/upload, page content, web/mobile platform, date range, target URL validation, save, and reset behavior.
        </p>
      </section>
      <PromotionEditorClient mode="add" />
    </div>
  );
}
