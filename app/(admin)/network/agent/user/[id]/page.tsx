import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default async function NetworkAgentUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <NuxtParityPage
      title={`Agent User: ${id}`}
      nuxtRoute="/Network/Agent/User/:Index"
      reactRoute="/network/agent/user/:id"
      purpose="Preserve the nested agent-user detail and management route from the Nuxt Network module."
      preserved={[
        "Dynamic agent user route behavior is preserved.",
        "The page is available in the authenticated Network section.",
        "Legacy Nuxt links redirect to the React route.",
      ]}
      pending={[
        "Port nested agent user profile, activity, bets, transactions, and commission tabs.",
        "Restore permission-gated actions such as delete user and funds transfer.",
      ]}
    />
  );
}
