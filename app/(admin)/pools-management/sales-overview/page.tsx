import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import PoolsSalesReport from "../components/PoolsSalesReport";

export default function PoolSalesOverviewPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Pools Sales Report" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Pools Sales Report</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          Monitor pool sales overview by shop with the Nuxt report filters, totals footer, expandable ticket rows, and ticket status actions.
        </p>
      </section>
      <PoolsSalesReport variant="sales-overview" />
    </div>
  );
}
