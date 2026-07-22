import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import LuckyBallsShopTable from "./../components/LuckyBallsShopTable";
import { formatMoney, luckyBallsShops } from "../data";

export default function LuckyBallsShopsPage() {
  const activeShops = luckyBallsShops.filter((shop) => shop.active).length;
  const totalCredit = luckyBallsShops.reduce((total, shop) => total + shop.currentCredit, 0);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Lucky Balls Shops" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Lucky Balls Shops</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              Review Lucky Balls shop configuration including agency identity, betting limits, worker cash movement, timezone, assignment state, credit, commission, and software charge.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
              <p className="text-xs font-semibold uppercase text-gray-500">Shops</p>
              <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{luckyBallsShops.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
              <p className="text-xs font-semibold uppercase text-gray-500">Active</p>
              <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{activeShops}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
              <p className="text-xs font-semibold uppercase text-gray-500">Credit</p>
              <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{formatMoney(totalCredit)}</p>
            </div>
          </div>
        </div>
      </section>
      <LuckyBallsShopTable mode="shops" />
    </div>
  );
}
