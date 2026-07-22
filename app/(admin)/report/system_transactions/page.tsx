import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function SystemTransactionsPage() {
  return (
    <NuxtParityPage
      title="System Transactions"
      nuxtRoute="/ReportingAndBI/SystemTransactions"
      reactRoute="/report/system_transactions"
      purpose="Review system-generated transaction activity for reconciliation and operational audit parity with the Nuxt app."
      preserved={[
        "Authenticated route behavior is preserved.",
        "The page remains part of Reporting & BI.",
        "Legacy route behavior is preserved through redirect.",
      ]}
      pending={[
        "Port system transaction filters and API request.",
        "Render transaction table, status, totals, and pagination.",
      ]}
    />
  );
}
