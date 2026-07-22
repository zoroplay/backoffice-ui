import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import VirtualSportClient from "./VirtualSportClient";

export default function VirtualSportPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Virtual Sport" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Virtual Sport
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Search and audit virtual sport tickets by period, date range, status, paging, player, stake, winnings, and jackpot amount.
        </p>
      </section>
      <VirtualSportClient />
    </div>
  );
}
