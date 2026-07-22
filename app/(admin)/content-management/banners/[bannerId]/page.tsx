import { notFound } from "next/navigation";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { bannerItems } from "../data";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ bannerId: string }>;
}) {
  const { bannerId } = await params;
  const banner = bannerItems.find((item) => item.id === bannerId);

  if (!banner) {
    notFound();
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle={`Edit Banner: ${banner.title}`} />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Banner</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Update creative metadata, target channel, placement, active state, link, and sports targeting.
        </p>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input defaultValue={banner.title} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <select defaultValue={banner.type} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"><option>Sports</option><option>Registration</option><option>Casino</option><option>Promotion</option></select>
            <select defaultValue={banner.target} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"><option>Web</option><option>Mobile</option><option>All</option></select>
            <select defaultValue={banner.position} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"><option>Slider</option><option>Popup</option><option>Hero</option></select>
            <input defaultValue={banner.link} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input defaultValue={banner.imageUrl} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 dark:border-red-500/30 dark:text-red-300">Delete</button>
            <button type="button" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">Save Changes</button>
          </div>
        </form>
      </section>
    </div>
  );
}
