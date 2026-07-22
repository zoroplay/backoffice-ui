import {
  ReportBadge,
  ReportFilters,
  ReportMetrics,
  ReportPageShell,
  ReportSection,
  ReportTable,
} from "../components/ReportPageShell";

const rows = [
  { id: "LOG-1001", username: "admin@sbe", ip: "102.88.12.7", device: "Chrome macOS", result: "Success", date: "2026-07-22 09:14" },
  { id: "LOG-1002", username: "risk@sbe", ip: "41.190.3.4", device: "Edge Windows", result: "Success", date: "2026-07-22 10:02" },
  { id: "LOG-1003", username: "unknown", ip: "197.210.45.9", device: "Firefox Linux", result: "Failed", date: "2026-07-22 10:45" },
];

export default function LoginsHistoryPage() {
  return (
    <ReportPageShell
      title="Logins History"
      description="Audit admin login attempts by username, date range, IP address, device, and success/failure outcome."
    >
      <ReportMetrics metrics={[
        { label: "Attempts", value: "3", detail: "Visible rows" },
        { label: "Successful", value: "2", detail: "Authenticated" },
        { label: "Failed", value: "1", detail: "Rejected attempts" },
        { label: "Unique IPs", value: "3", detail: "Security audit" },
      ]} />
      <ReportFilters filters={[
        { label: "Username", placeholder: "Username" },
        { label: "From", value: "2026-07-22" },
        { label: "To", value: "2026-07-22" },
        { label: "Result", placeholder: "All results", options: ["Success", "Failed"] },
      ]} />
      <ReportSection title="Results">
        <ReportTable
          columns={[
            { label: "Username", key: "username" },
            { label: "IP Address", key: "ip" },
            { label: "Device", key: "device" },
            { label: "Result", key: "result" },
            { label: "Date", key: "date" },
          ]}
          rows={rows.map((row) => ({
            ...row,
            result: <ReportBadge tone={row.result === "Success" ? "success" : "danger"}>{row.result}</ReportBadge>,
          }))}
        />
      </ReportSection>
    </ReportPageShell>
  );
}
