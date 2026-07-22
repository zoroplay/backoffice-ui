import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function DeclinedBetsHistoryPage() {
  return (
    <NuxtParityPage
      title="Declined Bets History"
      nuxtRoute="/Tickets/DeclinedBetsHistory"
      reactRoute="/tickets/declined-bets-history"
      purpose="Review declined bet slips and rejection outcomes for trading, support, and risk follow-up."
      preserved={[
        "The route is available inside the authenticated admin shell.",
        "The page remains part of the Tickets workflow.",
        "Legacy Nuxt deep links redirect to this React page.",
      ]}
      pending={[
        "Port declined bet filters and API query from the Nuxt tickets service.",
        "Render declined ticket table, reason/status columns, and pagination.",
      ]}
    />
  );
}
