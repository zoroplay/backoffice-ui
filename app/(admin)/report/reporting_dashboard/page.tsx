import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function ReportingDashboardPage() {
  return (
    <NuxtParityPage
      title="Reporting Dashboard"
      nuxtRoute="/ReportingAndBI/ReportingDashboard"
      reactRoute="/report/reporting_dashboard"
      purpose="Provide the Reporting & BI overview route from Nuxt for operators who use the reporting dashboard entry point."
      preserved={[
        "The route is available in the authenticated admin shell.",
        "The page remains scoped to Reporting & BI summary workflows.",
        "Nuxt deep links redirect to the React implementation.",
      ]}
      pending={[
        "Port dashboard summary cards and chart API calls.",
        "Rebuild drill-down links into the React report pages.",
      ]}
    />
  );
}
