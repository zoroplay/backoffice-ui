import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const users = [
  { id: "user-01", username: "lb-cashier-01", role: "Cashier", stake: "NGN 920k", payout: "NGN 610k", status: "Active" },
  { id: "user-02", username: "lb-supervisor", role: "Supervisor", stake: "NGN 1.4m", payout: "NGN 880k", status: "Active" },
  { id: "user-03", username: "lb-kiosk-07", role: "Terminal", stake: "NGN 310k", payout: "NGN 250k", status: "Paused" },
];

export default async function LuckyBallsShopUsersPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle={`Lucky Balls Shop: ${userId}`} />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Shop User Management
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage users linked to a Lucky Balls shop, preserving the Nuxt dynamic shop-user list route.
        </p>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>{["Username", "Role", "Stake", "Payout", "Status"].map((head) => <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{user.username}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.role}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.stake}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.payout}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
