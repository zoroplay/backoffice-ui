import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function OperationBalanceTransferPage() {
  return (
    <NuxtParityPage
      title="Operation Balance Transfer"
      nuxtRoute="/Banking/OperationBalanceTransfer"
      reactRoute="/banking/operation-balance-transfer"
      purpose="Preserve the operations account transfer route for moving balances between operational wallets/accounts."
      preserved={[
        "The page is available under authenticated Banking.",
        "The original transfer workflow purpose is retained.",
        "Legacy Nuxt route behavior redirects to this React route.",
      ]}
      pending={[
        "Port operation transfer form fields, validation, and API mutation.",
        "Restore transfer history and approval/error feedback if present in Nuxt.",
      ]}
    />
  );
}
