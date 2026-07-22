import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function TaxOnTurnoverReportPage() {
  return (
    <NuxtParityPage
      title="Tax On Turnover Report"
      nuxtRoute="/ReportingAndBI/TaxOnTurnoverReport"
      reactRoute="/report/tax_on_turnover_report"
      purpose="Preserve the Nuxt tax-on-turnover reporting route for compliance and finance review workflows."
      preserved={[
        "The route is protected by the React admin guard.",
        "The page remains in the tax reporting workflow.",
        "Legacy Nuxt route access redirects to this React route.",
      ]}
      pending={[
        "Port tax-on-turnover API query and calculations.",
        "Render report totals, date filters, and export behavior.",
      ]}
    />
  );
}
