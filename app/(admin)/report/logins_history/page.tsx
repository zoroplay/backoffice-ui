import { ReportPageShell } from "../components/ReportPageShell";

import LoginHistoryClient from "./LoginHistoryClient";

export default function LoginsHistoryPage() {
  return (
    <ReportPageShell
      title="Logins History"
      description="Audit admin login attempts by username, date range, IP address, device, and success/failure outcome."
    >
      <LoginHistoryClient />
    </ReportPageShell>
  );
}
