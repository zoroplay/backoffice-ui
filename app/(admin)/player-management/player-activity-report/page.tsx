import {
  naira,
  PlayerFilters,
  PlayerManagementShell,
  PlayerMetrics,
  PlayerSection,
  PlayerTable,
} from "../components/PlayerManagementShell";

const rows = [
  { id: "ACT-001", username: "betking123", deposits: 150000, withdrawals: 80000, stakes: 420000, openBets: 3, lastActivity: "2026-07-22 12:44" },
  { id: "ACT-002", username: "queenbet", deposits: 90000, withdrawals: 45000, stakes: 210000, openBets: 1, lastActivity: "2026-07-22 11:18" },
  { id: "ACT-003", username: "luckystrike", deposits: 300000, withdrawals: 270000, stakes: 880000, openBets: 5, lastActivity: "2026-07-22 10:02" },
];

export default function PlayerActivityReportPage() {
  return (
    <PlayerManagementShell
      title="Player Activity Report"
      description="Report on player deposits, withdrawals, staking activity, open bets, and last activity by username and date range."
    >
      <PlayerMetrics metrics={[
        { label: "Deposits", value: naira(rows.reduce((sum, row) => sum + row.deposits, 0)), detail: "Selected players" },
        { label: "Withdrawals", value: naira(rows.reduce((sum, row) => sum + row.withdrawals, 0)), detail: "Selected players" },
        { label: "Stakes", value: naira(rows.reduce((sum, row) => sum + row.stakes, 0)), detail: "Turnover" },
        { label: "Open Bets", value: String(rows.reduce((sum, row) => sum + row.openBets, 0)), detail: "Unsettled tickets" },
      ]} />
      <PlayerFilters />
      <PlayerSection title="Results">
        <PlayerTable
          columns={[
            { label: "Username", key: "username" },
            { label: "Deposits", key: "deposits", align: "right" },
            { label: "Withdrawals", key: "withdrawals", align: "right" },
            { label: "Stakes", key: "stakes", align: "right" },
            { label: "Open Bets", key: "openBets", align: "right" },
            { label: "Last Activity", key: "lastActivity" },
          ]}
          rows={rows.map((row) => ({ ...row, deposits: naira(row.deposits), withdrawals: naira(row.withdrawals), stakes: naira(row.stakes) }))}
        />
      </PlayerSection>
    </PlayerManagementShell>
  );
}
