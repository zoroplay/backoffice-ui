import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function DeductionsPage() {
  return (
    <NuxtParityPage
      title="Deductions"
      nuxtRoute="/Banking/Cashflows/Deductions"
      reactRoute="/banking/cashflow/deductions"
      purpose="Manage deduction entries that affect cashflow accounting and settlement."
      preserved={[
        "Authenticated route behavior is preserved.",
        "The page remains a Cashflows subsection.",
        "The Nuxt URL redirects to this route.",
      ]}
      pending={[
        "Port deduction type and entry API workflows.",
        "Render deduction table, filters, and modal actions.",
      ]}
    />
  );
}
