import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const fixtures = [
  { id: "EPL001", event: "Arsenal - Chelsea", market: "Correct Score" },
  { id: "UCL002", event: "Barcelona - PSG", market: "1X2" },
  { id: "SER003", event: "Inter - Juventus", market: "Over 2.5" },
];

export default function JackpotManagementPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Jackpot Management" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Jackpot Management</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage global jackpot title/details and fixture selection, preserving the Nuxt split between Jackpot Details and Manage Fixtures.
        </p>
      </section>
      <div className="grid gap-6 xl:grid-cols-[420px,minmax(0,1fr)]">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Jackpot Details</h2>
          <form className="mt-5 space-y-4">
            <input defaultValue="Weekly Jackpot" className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <textarea defaultValue="Predict selected fixtures to qualify for jackpot rewards." className="min-h-32 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <button type="button" className="w-full rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">Save Details</button>
          </form>
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Manage Fixtures</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900"><tr>{["Fixture ID", "Event", "Market", "Action"].map((head) => <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                {fixtures.map((fixture) => (
                  <tr key={fixture.id}>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{fixture.id}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{fixture.event}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{fixture.market}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Remove</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
