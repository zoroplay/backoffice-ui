import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const overviewRows = [
  { id: "premier-league", pool: "Premier League Pool", tickets: 1842, turnover: "NGN 9.2m", payout: "NGN 6.1m", status: "Open" },
  { id: "midweek-special", pool: "Midweek Special", tickets: 721, turnover: "NGN 2.8m", payout: "NGN 1.7m", status: "Settled" },
  { id: "weekend-jackpot", pool: "Weekend Jackpot", tickets: 3116, turnover: "NGN 15.6m", payout: "Pending", status: "Live" },
];

export default function PoolSalesOverviewPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Pool Sales Overview" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Pool Sales Overview
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Monitor pool ticket sales, turnover, payout exposure, and settlement status across active pools.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            ["Tickets", "5,679"],
            ["Turnover", "NGN 27.6m"],
            ["Paid Out", "NGN 7.8m"],
            ["Live Pools", "2"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>{["Pool", "Tickets", "Turnover", "Payout", "Status"].map((head) => <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {overviewRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.pool}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.tickets}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.turnover}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.payout}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
