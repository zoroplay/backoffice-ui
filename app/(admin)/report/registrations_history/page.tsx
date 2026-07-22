import { ReportMetrics, ReportPageShell } from "../components/ReportPageShell";

import RegistrationsHistoryClient from "./RegistrationsHistoryClient";

export default function RegistrationsHistoryPage() {
  return (
    <ReportPageShell
      title="Registrations History"
      description="Track new player registrations by date range, state, deposit behavior, product, client type, verification status, and grouping mode."
    >
      <ReportMetrics metrics={[
        { label: "Registrations", value: "4", detail: "Visible rows" },
        { label: "Deposited", value: "2", detail: "Made first deposit" },
        { label: "Products", value: "4", detail: "Sports, casino, games, virtual" },
        { label: "Group Modes", value: "6", detail: "Day, month, state, player, product, client" },
      ]} />
      <RegistrationsHistoryClient />
    </ReportPageShell>
  );
}
