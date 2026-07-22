import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const virtualRows = [
  { id: "vf-1001", player: "samuel.ng", event: "Virtual Football League", stake: "NGN 20,000", payout: "NGN 64,000", status: "Won" },
  { id: "vh-1002", player: "linda7", event: "Virtual Horse Racing", stake: "NGN 5,000", payout: "NGN 0", status: "Lost" },
  { id: "vd-1003", player: "agent-kiosk-12", event: "Virtual Dogs", stake: "NGN 12,000", payout: "Pending", status: "Open" },
];

export default function VirtualSportPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Virtual Sport" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Virtual Sport
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Search and audit virtual sport tickets by username, event, stake, payout, and settlement status.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <input placeholder="Username" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
            <option>All events</option>
            <option>Virtual Football League</option>
            <option>Virtual Horse Racing</option>
            <option>Virtual Dogs</option>
          </select>
          <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
            <option>All statuses</option>
            <option>Open</option>
            <option>Won</option>
            <option>Lost</option>
          </select>
          <button className="h-10 rounded-md bg-brand-500 px-4 text-sm font-medium text-white">Search</button>
        </div>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>{["Ticket ID", "Player", "Event", "Stake", "Payout", "Status"].map((head) => <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {virtualRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.id}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.player}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.event}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.stake}</td>
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
