import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function TicketExposureMonitorPage() {
  return (
    <NuxtParityPage
      title="Exposure Monitor"
      nuxtRoute="/Tickets/ExposureMonitor"
      reactRoute="/tickets/exposure-monitor"
      purpose="Monitor betting exposure across events and tickets so trading teams can identify risk concentrations."
      preserved={[
        "Authenticated access and sidebar context are preserved.",
        "The route remains in the Tickets operational area.",
        "The Nuxt route redirects to this React implementation.",
      ]}
      pending={[
        "Port exposure monitor data fetching and filters.",
        "Render exposure totals, event rows, risk thresholds, and drill-down actions.",
      ]}
    />
  );
}
