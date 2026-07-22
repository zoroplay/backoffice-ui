import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import JackpotManagementClient from "../../jackpots/components/JackpotManagementClient";

export default function JackpotManagementPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Jackpot Management" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Jackpot Management</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage global jackpot details and the selected fixtures used by the front-office jackpot module.
        </p>
      </section>
      <JackpotManagementClient />
    </div>
  );
}
