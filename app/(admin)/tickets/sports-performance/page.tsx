import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function SportsPerformancePage() {
  return (
    <NuxtParityPage
      title="Sports Performance"
      nuxtRoute="/Tickets/SportsPerformance"
      reactRoute="/tickets/sports-performance"
      purpose="Review sport-level performance for trading and operational analysis, preserving Nuxt route coverage."
      preserved={[
        "The page is available in the authenticated Tickets section.",
        "The route purpose remains sports performance reporting.",
        "Legacy Nuxt deep links redirect to this page.",
      ]}
      pending={[
        "Connect to sports performance report data.",
        "Render sport/category metrics and filtering controls.",
      ]}
    />
  );
}
