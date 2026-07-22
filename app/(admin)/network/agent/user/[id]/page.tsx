import { notFound } from "next/navigation";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { agencies } from "../../../agency-list/data";

const money = (value: number) => `NGN ${value.toLocaleString()}`;

export default async function AgentUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = agencies.find((item) => item.id === id || item.username === id);

  if (!agent) {
    notFound();
  }

  const userRows = [
    { id: "USR-1", username: `${agent.username}-cashier-1`, role: "Cashier", balance: agent.availBalance, status: agent.status },
    { id: "USR-2", username: `${agent.username}-manager`, role: "Manager", balance: agent.balance, status: agent.status },
  ];

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle={`Agent Users: ${agent.username}`} />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Agent User Management</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Review users under a network agent, including balances, role, status, and account action surface.
        </p>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="grid gap-4 md:grid-cols-4">
          <div><p className="text-xs text-gray-500">Network Balance</p><p className="text-xl font-semibold">{money(agent.networkBalance)}</p></div>
          <div><p className="text-xs text-gray-500">Available Balance</p><p className="text-xl font-semibold">{money(agent.availBalance)}</p></div>
          <div><p className="text-xs text-gray-500">Trust User</p><p className="text-xl font-semibold">{money(agent.trustUser)}</p></div>
          <div><p className="text-xs text-gray-500">Status</p><p className="text-xl font-semibold">{agent.status}</p></div>
        </div>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>{["Username", "Role", "Balance", "Status", "Actions"].map((head) => <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {userRows.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.username}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.role}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{money(user.balance)}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.status}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Edit / Block / Transfer</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
