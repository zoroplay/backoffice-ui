import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function ExpensesPage() {
  return (
    <NuxtParityPage
      title="Expenses"
      nuxtRoute="/Banking/Cashflows/Expenses"
      reactRoute="/banking/cashflow/expenses"
      purpose="Manage cashflow expense entries and categories for finance operations."
      preserved={[
        "Admin route guard is preserved.",
        "The page remains part of Banking Cashflows.",
        "Legacy Nuxt deep links redirect to React.",
      ]}
      pending={[
        "Port expense category and expense entry modal workflows.",
        "Render expenses, filters, totals, and delete/update actions.",
      ]}
    />
  );
}
