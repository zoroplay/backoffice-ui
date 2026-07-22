import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function PlayerLiabilityReportPage() {
  return (
    <NuxtParityPage
      title="Player Liability Report"
      nuxtRoute="/PlayerManagement/PlayerLiabilityReport"
      reactRoute="/player-management/player-liability-report"
      purpose="Inspect player liability exposure for risk and trading operations."
      preserved={[
        "Admin-only access is preserved.",
        "The route remains in the player risk reporting area.",
        "Legacy Nuxt deep links redirect to the React page.",
      ]}
      pending={[
        "Wire the player liability API contract.",
        "Render liability totals, player rows, filters, and export controls.",
      ]}
    />
  );
}
