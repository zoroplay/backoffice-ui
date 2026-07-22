import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function CommissionReportingPage() {
  return (
    <NuxtParityPage
      title="Commission Reporting"
      nuxtRoute="/Network/CommissionReporting"
      reactRoute="/network/commission-reporting"
      purpose="Review network commission reports for agents and agency hierarchies."
      preserved={[
        "The route is protected by the admin guard.",
        "The page remains in the Network feature area.",
        "Legacy Nuxt links redirect to this React page.",
      ]}
      pending={[
        "Port commission report filters and API calls.",
        "Render commission rows, payout state, totals, and export actions.",
      ]}
    />
  );
}
