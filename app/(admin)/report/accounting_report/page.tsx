import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function AccountingReportPage() {
  return (
    <NuxtParityPage
      title="Accounting Report"
      nuxtRoute="/ReportingAndBI/AccountingReport"
      reactRoute="/report/accounting_report"
      purpose="Provide accounting-focused operational reporting for reconciliations and finance review, matching the Nuxt page coverage."
      preserved={[
        "Authenticated access is required.",
        "The page is available as a Reporting & BI report.",
        "The old Nuxt URL is preserved through redirect behavior.",
      ]}
      pending={[
        "Port accounting report filters and API request parameters.",
        "Render finance tables, totals, and export affordances from live data.",
      ]}
    />
  );
}
