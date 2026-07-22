import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import LuckyBallsShopTable from "../components/LuckyBallsShopTable";

export default function LuckyBallsShopPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Lucky Balls Shop" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Lucky Balls Shop</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          Preserve the Nuxt <span className="font-mono">/LuckyBalls/Shop</span> page as the shop credential and limits view, distinct from the broader shop-management list.
        </p>
      </section>
      <LuckyBallsShopTable mode="shop" />
    </div>
  );
}
