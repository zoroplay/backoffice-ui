import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function PayoutTransactionsPage() {
  return (
    <NuxtParityPage
      title="Payout Transactions"
      nuxtRoute="/ReportingAndBI/PayoutTransactions"
      reactRoute="/report/payout_transactions"
      purpose="Review payout transaction activity for finance and support investigation workflows preserved from the Nuxt back office."
      preserved={[
        "The page is protected by the admin route guard.",
        "The route remains in the Reporting & BI feature area.",
        "Legacy Nuxt deep links redirect to this page.",
      ]}
      pending={[
        "Connect to the payout transaction API contract.",
        "Add filters, pagination, status badges, and export behavior.",
      ]}
    />
  );
}
