import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function CashflowSettingsPage() {
  return (
    <NuxtParityPage
      title="Cashflow Settings"
      nuxtRoute="/Banking/Cashflows/Settings"
      reactRoute="/banking/cashflow/settings"
      purpose="Configure cashflow settings and supporting reference data used by retail banking workflows."
      preserved={[
        "The route is protected by admin authentication.",
        "The page remains under Banking Cashflows.",
        "The Nuxt route redirects to this React page.",
      ]}
      pending={[
        "Port cashflow settings tabs and save behavior.",
        "Restore validation, success/error feedback, and settings reloads.",
      ]}
    />
  );
}
