import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function OnlineSalesReportPage() {
  return (
    <NuxtParityPage
      title="Online Sales"
      nuxtRoute="/ReportingAndBI/OnlineSales"
      reactRoute="/report/online_sales"
      purpose="Review online channel sales performance over a selected period, preserving the Nuxt report page purpose for operational revenue monitoring."
      preserved={[
        "Admin guard and authenticated shell are enforced by the React admin layout.",
        "The page remains part of the Reporting & BI workflow.",
        "The route has a legacy Nuxt redirect for operators using the old URL.",
      ]}
      pending={[
        "Wire the report filters to the Nuxt reports service contract.",
        "Render online sales totals, breakdown tables, and export actions from live API data.",
      ]}
    />
  );
}
