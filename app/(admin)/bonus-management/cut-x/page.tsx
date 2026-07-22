import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const cutXBonuses = [
  {
    id: "CUTX-001",
    noLostGames: 1,
    minEvents: 5,
    minTotalOdds: 3.5,
    bonusType: "Stake Return",
    percentage: 100,
    maxPayable: 50000,
    minStake: 1000,
  },
  {
    id: "CUTX-002",
    noLostGames: 2,
    minEvents: 8,
    minTotalOdds: 7.0,
    bonusType: "% of Pot. Winning",
    percentage: 20,
    maxPayable: 100000,
    minStake: 2000,
  },
  {
    id: "CUTX-003",
    noLostGames: 3,
    minEvents: 12,
    minTotalOdds: 15.0,
    bonusType: "% of Pot. Winning",
    percentage: 10,
    maxPayable: 250000,
    minStake: 5000,
  },
];

const money = (value: number) => `NGN ${value.toLocaleString()}`;

export default function CutXPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="CUT (X) Bonus Manager" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">CUT (X) Bonus Manager</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              Configure Cut X bonus rules by lost games, minimum events, cumulative odds, bonus type, percentage, maximum payable amount, and minimum stake.
            </p>
          </div>
          <button className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Add New</button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rules</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{cutXBonuses.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Max Payable</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{money(250000)}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Highest Odds</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">15.0</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Endpoint</p>
            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">cut-x-bonuses</p>
          </div>
        </div>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Cut (X) Bonus List</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Nuxt supported add, edit, delete, and refresh-list behavior for these bonus rules.</p>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {["No of Lost Games", "Min. Events", "Min Cum. Odds", "Bonus Type", "Value", "Max Payable", "Min Stake", "Actions"].map((head) => (
                  <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {cutXBonuses.map((bonus) => (
                <tr key={bonus.id}>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{bonus.noLostGames}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{bonus.minEvents}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{bonus.minTotalOdds}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{bonus.bonusType}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{bonus.percentage}%</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(bonus.maxPayable)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(bonus.minStake)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium dark:border-gray-700">Edit</button>
                      <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 dark:border-red-500/30 dark:text-red-300">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">CUT X Form</h2>
        <form className="mt-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input placeholder="No of Lost Games" type="number" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input placeholder="Min no. of Events per ticket" type="number" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input placeholder="Min Cumulative Odds" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input placeholder="Min. Stake Amount" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              <option>Percentage on Winnings</option>
              <option>Stake Return</option>
            </select>
            <input placeholder="Maximum Bonus Amount" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input placeholder="Percentage" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          </div>
          <div className="flex justify-end">
            <button type="button" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Save</button>
          </div>
        </form>
      </section>
    </div>
  );
}
