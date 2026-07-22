import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function CommissionReportPage() {
  return (
    <NuxtParityPage
      title="Commission"
      nuxtRoute="/ReportingAndBI/Commission"
      reactRoute="/report/commission"
      purpose="Expose commission reporting for agency and finance review, preserving the Nuxt report page coverage."
      preserved={[
        "Admin-only access is enforced.",
        "The page purpose remains commission reporting.",
        "The Nuxt route redirects to the React route.",
      ]}
      pending={[
        "Port commission report query parameters and response mapping.",
        "Render commission profiles, earned amounts, and paid state from live data.",
      ]}
    />
  );
}
