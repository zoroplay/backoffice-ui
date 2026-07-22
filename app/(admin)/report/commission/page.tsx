import {
  ReportBadge,
  ReportFilters,
  ReportMetrics,
  ReportPageShell,
  ReportSection,
  ReportTable,
} from "../components/ReportPageShell";

const rows = [
  { id: "weekly", tab: "Weekly Commissions", agent: "retail-main-184", turnover: "NGN 38.2m", commission: "NGN 2.1m", status: "Pending" },
  { id: "paid", tab: "Paid Commissions", agent: "ibadan-shop-091", turnover: "NGN 14.5m", commission: "NGN 870k", status: "Paid" },
  { id: "bonus", tab: "Bonus Commissions", agent: "lagos-kiosk-027", turnover: "NGN 9.8m", commission: "NGN 520k", status: "Approved" },
];

export default function CommissionReportPage() {
  return (
    <ReportPageShell
      title="Commissions Report"
      description="Track weekly, paid, and bonus commissions across agents. This preserves the Nuxt three-tab commission reporting workflow."
    >
      <ReportMetrics metrics={[
        { label: "Commission", value: "NGN 3.49m", detail: "Visible rows" },
        { label: "Turnover", value: "NGN 62.5m", detail: "Commission basis" },
        { label: "Pending", value: "1", detail: "Needs payment" },
        { label: "Tabs", value: "3", detail: "Weekly, paid, bonus" },
      ]} />
      <ReportFilters filters={[
        { label: "Commission Type", placeholder: "All tabs", options: ["Weekly Commissions", "Paid Commissions", "Bonus Commissions"] },
        { label: "Agent", placeholder: "Username or agency" },
        { label: "From", value: "2026-07-01" },
        { label: "To", value: "2026-07-22" },
      ]} />
      <ReportSection title="Commission Results">
        <ReportTable
          columns={[
            { label: "Report", key: "tab" },
            { label: "Agent", key: "agent" },
            { label: "Turnover", key: "turnover", align: "right" },
            { label: "Commission", key: "commission", align: "right" },
            { label: "Status", key: "status" },
          ]}
          rows={rows.map((row) => ({
            ...row,
            status: <ReportBadge tone={row.status === "Paid" ? "success" : "warning"}>{row.status}</ReportBadge>,
          }))}
        />
      </ReportSection>
    </ReportPageShell>
  );
}
