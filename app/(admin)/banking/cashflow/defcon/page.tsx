import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function DefconPage() {
  return (
    <NuxtParityPage
      title="Defcon"
      nuxtRoute="/Banking/Cashflows/Defcon"
      reactRoute="/banking/cashflow/defcon"
      purpose="Preserve the Nuxt Defcon cashflow route used for operational cashflow control."
      preserved={[
        "The route is available in Banking under the admin guard.",
        "The original route purpose is retained.",
        "Legacy Nuxt route access redirects here.",
      ]}
      pending={[
        "Identify and port the Defcon-specific backend contract.",
        "Rebuild the table/actions once the Nuxt behavior is fully mapped.",
      ]}
    />
  );
}
