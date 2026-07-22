import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const commissionRows = [
  { id: "daily", level: "Daily Shop Sales", basis: "Turnover", rate: "3.5%", threshold: "NGN 500,000", status: "Active" },
  { id: "weekly", level: "Weekly Target Bonus", basis: "Net Revenue", rate: "6.0%", threshold: "NGN 3,000,000", status: "Active" },
  { id: "supervisor", level: "Supervisor Override", basis: "Shop GGR", rate: "1.5%", threshold: "NGN 10,000,000", status: "Draft" },
];

export default function LuckyBallsCommissionPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Lucky Balls Commission" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Lucky Balls Commission
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Configure Lucky Balls commission profiles by sales basis, target threshold, rate, and lifecycle status.
        </p>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>{["Level", "Basis", "Rate", "Threshold", "Status"].map((head) => <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {commissionRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.level}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.basis}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.rate}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.threshold}</td>
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
