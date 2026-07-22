import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function NetworkTransferPage() {
  return (
    <NuxtParityPage
      title="Network Transfer"
      nuxtRoute="/Network/Transfer"
      reactRoute="/network/transfer"
      purpose="Move funds through the network/agent hierarchy while preserving the Nuxt transfer route coverage."
      preserved={[
        "Authenticated route behavior is preserved.",
        "The page remains part of Network operations.",
        "Legacy Nuxt deep links redirect here.",
      ]}
      pending={[
        "Port transfer form validation and funds-transfer endpoint behavior.",
        "Restore balances, user selectors, confirmation prompts, and result feedback.",
      ]}
    />
  );
}
