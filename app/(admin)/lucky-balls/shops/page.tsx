import Link from "next/link";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const shops = [
  { id: "shop-1001", name: "Lagos Central", manager: "Ada Okafor", users: 18, sales: "NGN 4.6m", status: "Active" },
  { id: "shop-1002", name: "Ibadan Ring Road", manager: "Musa Bello", users: 11, sales: "NGN 2.1m", status: "Active" },
  { id: "shop-1003", name: "Enugu Express", manager: "Nkechi Obi", users: 7, sales: "NGN 880k", status: "Paused" },
];

export default function LuckyBallsShopsPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Lucky Balls Shops" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Lucky Balls Shops
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Review Lucky Balls retail shops, manager ownership, user counts, sales, and status from the legacy shop list workflow.
        </p>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>{["Shop", "Manager", "Users", "Sales", "Status", "Action"].map((head) => <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {shops.map((shop) => (
                <tr key={shop.id}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{shop.name}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{shop.manager}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{shop.users}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{shop.sales}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{shop.status}</td>
                  <td className="px-4 py-3">
                    <Link href={`/lucky-balls/shop/${shop.id}`} className="text-sm font-medium text-brand-600 dark:text-brand-400">
                      Manage Users
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
