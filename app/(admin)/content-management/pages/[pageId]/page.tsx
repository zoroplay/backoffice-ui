import { notFound } from "next/navigation";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { contentPages } from "../data";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const page = contentPages.find((item) => item.id === pageId);

  if (!page) {
    notFound();
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle={`Edit Page: ${page.title}`} />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Content Page</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Update title, slug, target channel, active state, and content body for the selected CMS page.
        </p>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <input defaultValue={page.title} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input defaultValue={page.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <select defaultValue={page.target} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              <option>Web</option>
              <option>Mobile</option>
              <option>Hybrid</option>
            </select>
            <select defaultValue={page.isActive ? "Active" : "Inactive"} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <textarea defaultValue={page.content} className="min-h-48 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 dark:border-red-500/30 dark:text-red-300">Delete</button>
            <button type="button" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">Save Changes</button>
          </div>
        </form>
      </section>
    </div>
  );
}
