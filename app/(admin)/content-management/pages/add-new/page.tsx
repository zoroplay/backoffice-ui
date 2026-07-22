import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import ContentPageEditorClient from "../../components/ContentPageEditorClient";

export default function AddContentPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add New Page" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Page</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          Create a CMS page with required title validation, generated slug, WYSIWYG-style content body, target channel, created-by metadata, save, and reset behavior.
        </p>
      </section>
      <ContentPageEditorClient mode="add" />
    </div>
  );
}
