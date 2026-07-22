import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import WeeklyCouponClient from "../components/WeeklyCouponClient";

export default function WeeklyCouponPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Weekly Coupon Management" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Weekly Coupon Management</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          Configure the 49-fixture weekly coupon by selecting tournaments and events, copying 1/X/2 odds, and saving the coupon rows for publication.
        </p>
        <div className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
          <span className="font-mono">GET /admin/content-management/weekly-coupon/get-tournaments</span>
          <span className="mx-2">|</span>
          <span className="font-mono">POST /admin/content-management/weekly-coupon/save-coupon</span>
        </div>
      </section>
      <WeeklyCouponClient />
    </div>
  );
}
