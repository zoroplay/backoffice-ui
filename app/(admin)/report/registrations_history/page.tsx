import {
  ReportBadge,
  ReportFilters,
  ReportMetrics,
  ReportPageShell,
  ReportSection,
  ReportTable,
} from "../components/ReportPageShell";

const rows = [
  { id: "REG-001", username: "john_doe", phone: "+2348010001000", channel: "Web", kyc: "Verified", date: "2026-07-22 08:45" },
  { id: "REG-002", username: "mary_j", phone: "+2348010002000", channel: "Mobile", kyc: "Pending", date: "2026-07-22 09:31" },
  { id: "REG-003", username: "retail_user_09", phone: "+2348010003000", channel: "Retail", kyc: "Rejected", date: "2026-07-22 10:22" },
];

export default function RegistrationsHistoryPage() {
  return (
    <ReportPageShell
      title="Registrations History"
      description="Track new player registrations by date range, username, phone number, client channel, and verification outcome."
    >
      <ReportMetrics metrics={[
        { label: "Registrations", value: "3", detail: "Visible rows" },
        { label: "Verified", value: "1", detail: "KYC approved" },
        { label: "Pending KYC", value: "1", detail: "Needs follow-up" },
        { label: "Channels", value: "3", detail: "Web, mobile, retail" },
      ]} />
      <ReportFilters filters={[
        { label: "Username", placeholder: "Username or phone" },
        { label: "From", value: "2026-07-22" },
        { label: "To", value: "2026-07-22" },
        { label: "Channel", placeholder: "All channels", options: ["Web", "Mobile", "Retail"] },
      ]} />
      <ReportSection title="Results">
        <ReportTable
          columns={[
            { label: "Username", key: "username" },
            { label: "Phone", key: "phone" },
            { label: "Channel", key: "channel" },
            { label: "KYC", key: "kyc" },
            { label: "Registered At", key: "date" },
          ]}
          rows={rows.map((row) => ({
            ...row,
            kyc: (
              <ReportBadge
                tone={row.kyc === "Verified" ? "success" : row.kyc === "Rejected" ? "danger" : "warning"}
              >
                {row.kyc}
              </ReportBadge>
            ),
          }))}
        />
      </ReportSection>
    </ReportPageShell>
  );
}
