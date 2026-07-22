import { notFound } from "next/navigation";

import {
  naira,
  PlayerBadge,
  PlayerManagementShell,
  PlayerMetrics,
  PlayerSection,
  PlayerTable,
} from "../../components/PlayerManagementShell";
import { players } from "../../player-search/data";

const activeBonuses = [
  { id: "BON-001", name: "Welcome Reload", amount: 5000, rollover: "3x", status: "Active" },
  { id: "BON-002", name: "Acca Insurance", amount: 2500, rollover: "1x", status: "Completed" },
];

export default async function PlayerInfoPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const player = players.find((item) => item.code === playerId || item.username === playerId);

  if (!player) {
    notFound();
  }

  return (
    <PlayerManagementShell
      title={`Player Account: ${player.username}`}
      description="View a player's account profile, wallet position, transactions, gaming activity, login history, active bonuses, and account status actions."
    >
      <PlayerMetrics metrics={[
        { label: "Wallet Balance", value: naira(25000), detail: "Main wallet" },
        { label: "Bonus Balance", value: naira(5000), detail: "Active bonuses" },
        { label: "Open Bets", value: "3", detail: "Current exposure" },
        { label: "Status", value: player.playerStatus, detail: player.verificationStatus },
      ]} />
      <div className="grid gap-6 xl:grid-cols-[420px,minmax(0,1fr)]">
        <PlayerSection title="General">
          <dl className="space-y-3 text-sm">
            {[
              ["Full Name", player.fullName],
              ["Email", player.email],
              ["Phone", player.phone],
              ["Country", player.country],
              ["Currency", player.currency],
              ["Registered", player.registeredOn],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 grid gap-2">
            <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">Change Password</button>
            <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">Manual Deposit</button>
            <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">Manual Withdrawal</button>
            <button className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">Give Bonus</button>
          </div>
        </PlayerSection>
        <PlayerSection title="Active Bonuses">
          <PlayerTable
            columns={[
              { label: "Bonus", key: "name" },
              { label: "Amount", key: "amount", align: "right" },
              { label: "Rollover", key: "rollover" },
              { label: "Status", key: "status" },
              { label: "Action", key: "action", align: "right" },
            ]}
            rows={activeBonuses.map((bonus) => ({
              ...bonus,
              amount: naira(bonus.amount),
              status: <PlayerBadge tone={bonus.status === "Active" ? "success" : "neutral"}>{bonus.status}</PlayerBadge>,
              action: (
                <div className="flex justify-end gap-2">
                  <button className="rounded-md border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 dark:border-green-500/30 dark:text-green-300">Award</button>
                  <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 dark:border-red-500/30 dark:text-red-300">Deactivate</button>
                </div>
              ),
            }))}
          />
        </PlayerSection>
      </div>
    </PlayerManagementShell>
  );
}
