import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function CashInPage() {
  return (
    <NuxtParityPage
      title="Cash In"
      nuxtRoute="/Banking/Cashflows/CashIn"
      reactRoute="/banking/cashflow/cash-in"
      purpose="Track and manage cash-in entries for retail banking operations."
      preserved={[
        "Authenticated banking access is preserved.",
        "The route remains part of the Cashflows workflow.",
        "Legacy Nuxt route behavior redirects to React.",
      ]}
      pending={[
        "Port cash-in form and API mutation behavior.",
        "Render cash-in history, filters, totals, and validation messages.",
      ]}
    />
  );
}
