import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import PoolsSalesReport from "../components/PoolsSalesReport";

export default function PoolCouponSalesPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Coupon Sales Report" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Coupon Sales Report</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          Review pool coupon sales by shop with period, date, week, status, paging, totals, expandable child coupon tickets, and ticket update action surfaces preserved from Nuxt.
        </p>
      </section>
      <PoolsSalesReport variant="coupon-sales" />
    </div>
  );
}
