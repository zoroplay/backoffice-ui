import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function UnsettledBetsPage() {
  return (
    <NuxtParityPage
      title="Unsettled Bets"
      nuxtRoute="/Tickets/UnsettledBets"
      reactRoute="/tickets/unsettled-bets"
      purpose="Track unsettled sports tickets that still require settlement or operational review."
      preserved={[
        "Authenticated access is preserved.",
        "The route remains in the ticket-management flow.",
        "The Nuxt URL redirects to the React route.",
      ]}
      pending={[
        "Port unsettled bet list fetching and pagination.",
        "Restore ticket action permissions for edit, cancel, void, and mark as won.",
      ]}
    />
  );
}
