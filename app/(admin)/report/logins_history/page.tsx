import { ReportMetrics, ReportPageShell } from "../components/ReportPageShell";

import LoginHistoryClient from "./LoginHistoryClient";

export default function LoginsHistoryPage() {
  return (
    <ReportPageShell
      title="Logins History"
      description="Audit admin login attempts by username, date range, IP address, device, and success/failure outcome."
    >
      <ReportMetrics metrics={[
        { label: "Attempts", value: "4", detail: "Visible rows" },
        { label: "Website", value: "2", detail: "Web client type" },
        { label: "Mobile", value: "1", detail: "Mobile client type" },
        { label: "Shop", value: "1", detail: "Retail client type" },
      ]} />
      <LoginHistoryClient />
    </ReportPageShell>
  );
}
