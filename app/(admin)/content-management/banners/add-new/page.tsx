import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import BannerEditorClient from "../../components/BannerEditorClient";

export default function AddBannerPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add New Banner" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Banner</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          Create a banner with title, type, target, position, link, image upload/preview, popup limit validation, and optional sports competition targeting.
        </p>
      </section>
      <BannerEditorClient mode="add" />
    </div>
  );
}
