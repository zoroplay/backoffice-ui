import {
  naira,
  PlayerBadge,
  PlayerManagementShell,
  PlayerMetrics,
  PlayerSection,
  PlayerTable,
} from "../components/PlayerManagementShell";

const balances = [
  { id: "BAL-001", username: "betking123", balance: 25000, bonus: 5000, withdrawable: 20000, status: "Active" },
  { id: "BAL-002", username: "queenbet", balance: 12000, bonus: 2500, withdrawable: 9500, status: "Inactive" },
  { id: "BAL-003", username: "luckystrike", balance: 46000, bonus: 10000, withdrawable: 36000, status: "Active" },
];

const transit = [
  { id: "FIT-001", username: "betking123", type: "Pending withdrawal", amount: 15000, reference: "WDR-1001" },
  { id: "FIT-002", username: "queenbet", type: "Unsettled winnings", amount: 8500, reference: "BET-8291" },
];

export default function PlayerLiabilityReportPage() {
  return (
    <PlayerManagementShell
      title="Player Liability Report"
      description="Review player balances and funds in transit, preserving the Nuxt split between Player Balances and Funds In Transit."
    >
      <PlayerMetrics metrics={[
        { label: "Balances", value: naira(balances.reduce((sum, row) => sum + row.balance, 0)), detail: "Wallet liability" },
        { label: "Bonuses", value: naira(balances.reduce((sum, row) => sum + row.bonus, 0)), detail: "Bonus liability" },
        { label: "In Transit", value: naira(transit.reduce((sum, row) => sum + row.amount, 0)), detail: "Pending movement" },
        { label: "Players", value: String(balances.length), detail: "Visible rows" },
      ]} />
      <PlayerSection title="Player Balances">
        <PlayerTable
          columns={[
            { label: "Username", key: "username" },
            { label: "Balance", key: "balance", align: "right" },
            { label: "Bonus", key: "bonus", align: "right" },
            { label: "Withdrawable", key: "withdrawable", align: "right" },
            { label: "Status", key: "status" },
          ]}
          rows={balances.map((row) => ({
            ...row,
            balance: naira(row.balance),
            bonus: naira(row.bonus),
            withdrawable: naira(row.withdrawable),
            status: <PlayerBadge tone={row.status === "Active" ? "success" : "neutral"}>{row.status}</PlayerBadge>,
          }))}
        />
      </PlayerSection>
      <PlayerSection title="Funds In Transit">
        <PlayerTable
          columns={[
            { label: "Username", key: "username" },
            { label: "Type", key: "type" },
            { label: "Reference", key: "reference" },
            { label: "Amount", key: "amount", align: "right" },
          ]}
          rows={transit.map((row) => ({ ...row, amount: naira(row.amount) }))}
        />
      </PlayerSection>
    </PlayerManagementShell>
  );
}
