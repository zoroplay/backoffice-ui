import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import SoccerSpecialsClient from "../components/SoccerSpecialsClient";

export default function SoccerSpecialsPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Soccer Specials" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Soccer Specials</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          Manage soccer special categories and specials, filter the list by category, edit or delete specials, and settle special markets as won, lost, or void.
        </p>
        <div className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
          <span className="font-mono">GET /admin/content-management/specials/get-categories</span>
          <span className="mx-2">|</span>
          <span className="font-mono">CMS.settleSpecial</span>
        </div>
      </section>
      <SoccerSpecialsClient />
    </div>
  );
}
