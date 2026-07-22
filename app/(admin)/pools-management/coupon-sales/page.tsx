import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const salesRows = [
  { id: "PCS-10491", agent: "retail-main-184", coupons: 248, stake: "NGN 1,240,000", winnings: "NGN 820,000", margin: "33.9%" },
  { id: "PCS-10492", agent: "ibadan-shop-091", coupons: 119, stake: "NGN 410,000", winnings: "NGN 285,000", margin: "30.5%" },
  { id: "PCS-10493", agent: "lagos-kiosk-027", coupons: 87, stake: "NGN 295,000", winnings: "NGN 190,000", margin: "35.6%" },
];

export default function PoolCouponSalesPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Pool Coupon Sales" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Pool Coupon Sales
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Review pool coupon sales by agent, coupon count, stake, winnings, and margin. This preserves the Nuxt coupon-sales reporting workflow with date and user filtering ready for API integration.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            ["Coupons", "454"],
            ["Stake", "NGN 1.95m"],
            ["Winnings", "NGN 1.29m"],
            ["Margin", "33.8%"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="grid gap-4 md:grid-cols-4">
          <input placeholder="Username" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <input defaultValue="2026-07-01" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <input defaultValue="2026-07-22" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <button className="h-10 rounded-md bg-brand-500 px-4 text-sm font-medium text-white">Search</button>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>{["Coupon ID", "Agent", "Coupons", "Stake", "Winnings", "Margin"].map((head) => <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {salesRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.id}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.agent}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.coupons}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.stake}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.winnings}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
