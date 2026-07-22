import Link from "next/link";

import { formatMoney, luckyBallsShops } from "../data";

type LuckyBallsShopTableProps = {
  mode: "shops" | "shop";
};

export default function LuckyBallsShopTable({ mode }: LuckyBallsShopTableProps) {
  const shopListColumns = [
    "ID Agency",
    "Address",
    "City",
    "Code",
    "Agent",
    "Is Active",
    "Min Bet",
    "Min Combination Bet",
    "Max Bet",
    "Max Payout",
    "Worker InOut",
    "Time Zone",
    "Assigned",
    "Track Credit",
    "Current Credit",
    "Commission",
    "Software Charge",
    "Action",
  ];

  const shopCredentialsColumns = [
    "ID",
    "Username",
    "Password",
    "Name",
    "User Level",
    "Language ID",
    "Min Bet",
    "Min Combination Bet",
    "Max Bet",
    "Max Payout",
    "Worker InOut",
    "Time Zone",
    "Assigned",
    "Track Credit",
    "Current Credit",
    "Commission",
    "Software Charge",
  ];

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Shops</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Source contract preserved from <span className="font-mono">/:client_id/shop/list</span>.
        </p>
      </div>
      <div className="overflow-x-auto p-5">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {(mode === "shops" ? shopListColumns : shopCredentialsColumns).map((head) => (
                <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {luckyBallsShops.map((shop) =>
              mode === "shops" ? (
                <tr key={shop.id}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{shop.agencyName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.address}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.city}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.code}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.agent}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.active ? "Active" : "Inactive"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(shop.minBet)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(shop.minCombinationBet)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(shop.maxBet)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(shop.maxPayout)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.workerInOut}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.timeZone}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.assigned ? "True" : "False"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(shop.trackCredit)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(shop.currentCredit)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.commissionPercent}%</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.softwareCharge}%</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link href={`/lucky-balls/shop/${shop.id}`} className="font-medium text-brand-600 dark:text-brand-400">
                      Manage Users
                    </Link>
                  </td>
                </tr>
              ) : (
                <tr key={shop.id}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{shop.id}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.code}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">••••••••</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.agencyName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">Shop</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">EN</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(shop.minBet)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(shop.minCombinationBet)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(shop.maxBet)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(shop.maxPayout)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.workerInOut}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.timeZone}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.assigned ? "True" : "False"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(shop.trackCredit)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatMoney(shop.currentCredit)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.commissionPercent}%</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{shop.softwareCharge}%</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
