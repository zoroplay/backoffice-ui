import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function CashBooksPage() {
  return (
    <NuxtParityPage
      title="Cash Books"
      nuxtRoute="/Banking/Cashflows/CashBooks"
      reactRoute="/banking/cashflow/cash-books"
      purpose="Preserve the cash book management route for viewing and reconciling retail cashflow ledgers."
      preserved={[
        "The route remains inside authenticated Banking.",
        "The page keeps the Nuxt Cashflows/CashBooks purpose.",
        "Legacy Nuxt links redirect to this route.",
      ]}
      pending={[
        "Port cash book filters, listing, and create/edit workflows.",
        "Render balances, entries, and reconciliation status from live API data.",
      ]}
    />
  );
}
