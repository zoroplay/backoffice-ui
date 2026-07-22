import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function WeeklyCouponPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Weekly Coupon" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-semibold uppercase text-brand-500">
          Nuxt route: /ContentManagement/WeeklyCoupon
        </p>
        <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
          Weekly Coupon
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
          Configure weekly coupon presentation, fixture selections, and coupon layout
          for retail and web users.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {["Coupon Layout", "Fixtures", "Publish Window"].map((item) => (
            <div key={item} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                {item}
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Preserved workflow area; API save/load wiring pending.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
