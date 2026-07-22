import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function PlayerActivityReportPage() {
  return (
    <NuxtParityPage
      title="Player Activity Report"
      nuxtRoute="/PlayerManagement/PlayerActivityReport"
      reactRoute="/player-management/player-activity-report"
      purpose="Review player activity history and engagement signals for support and CRM analysis."
      preserved={[
        "Authenticated route behavior is preserved.",
        "The page remains scoped to player reporting.",
        "The Nuxt URL redirects to this React page.",
      ]}
      pending={[
        "Port the Nuxt activity report filters and service call.",
        "Render activity rows, totals, and pagination from live data.",
      ]}
    />
  );
}
