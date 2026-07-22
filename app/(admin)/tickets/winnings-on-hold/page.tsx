import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function WinningsOnHoldPage() {
  return (
    <NuxtParityPage
      title="Winnings On Hold"
      nuxtRoute="/Tickets/WinningsOnHold"
      reactRoute="/tickets/winnings-on-hold"
      purpose="Review winning tickets held for manual approval or further investigation before payout."
      preserved={[
        "Admin-only access is preserved.",
        "The route remains part of ticket operations.",
        "Legacy Nuxt links redirect to this page.",
      ]}
      pending={[
        "Port winnings-on-hold API calls and approval workflow.",
        "Render held ticket rows, permission-gated actions, and audit feedback.",
      ]}
    />
  );
}
