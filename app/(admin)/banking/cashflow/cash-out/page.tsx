import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function CashOutPage() {
  return (
    <NuxtParityPage
      title="Cash Out"
      nuxtRoute="/Banking/Cashflows/CashOut"
      reactRoute="/banking/cashflow/cash-out"
      purpose="Track and manage cash-out entries for retail banking operations."
      preserved={[
        "The page is protected by the admin guard.",
        "The route remains in Cashflows.",
        "Legacy Nuxt URL access is preserved through redirect.",
      ]}
      pending={[
        "Port cash-out creation and approval behavior.",
        "Render cash-out rows, totals, and cashbook linkage from backend data.",
      ]}
    />
  );
}
