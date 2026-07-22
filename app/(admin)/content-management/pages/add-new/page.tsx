import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function AddContentPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add New Page" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Page</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Create a content page with required title, generated slug, target channel, active status, and page body.
        </p>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <input placeholder="Page title" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input placeholder="Slug is generated from title" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              <option>Web</option>
              <option>Mobile</option>
              <option>Hybrid</option>
            </select>
            <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <textarea placeholder="Content" className="min-h-48 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <div className="flex justify-end">
            <button type="button" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">Save Page</button>
          </div>
        </form>
      </section>
    </div>
  );
}
