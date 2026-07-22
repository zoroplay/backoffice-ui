import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function AddBannerPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add New Banner" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Banner</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Create a banner with title, creative, target channel, placement, link, and optional sport/category/tournament/fixture targeting.
        </p>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input placeholder="Banner title" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"><option>Sports</option><option>Registration</option><option>Casino</option><option>Promotion</option></select>
            <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"><option>Web</option><option>Mobile</option><option>All</option></select>
            <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"><option>Slider</option><option>Popup</option><option>Hero</option></select>
            <input placeholder="Link URL" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input placeholder="Image URL" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          </div>
          <div className="flex justify-end">
            <button type="button" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">Save Banner</button>
          </div>
        </form>
      </section>
    </div>
  );
}
