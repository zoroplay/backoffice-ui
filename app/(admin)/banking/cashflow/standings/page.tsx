import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function CashflowStandingsPage() {
  return (
    <NuxtParityPage
      title="Cashflow Standings"
      nuxtRoute="/Banking/Cashflows/Standings"
      reactRoute="/banking/cashflow/standings"
      purpose="Review cashflow standings and balances for retail finance oversight."
      preserved={[
        "Authenticated access is preserved.",
        "The route remains part of the Banking Cashflows set.",
        "Legacy Nuxt URLs redirect to this route.",
      ]}
      pending={[
        "Port standings filters and balance API calls.",
        "Render standings tables, totals, and reconciliation states.",
      ]}
    />
  );
}
