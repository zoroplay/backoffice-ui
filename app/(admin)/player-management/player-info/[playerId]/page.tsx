import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default async function PlayerInfoPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;

  return (
    <NuxtParityPage
      title={`Player Info: ${playerId}`}
      nuxtRoute="/PlayerManagement/PlayerInfo/:PlayerId"
      reactRoute="/player-management/player-info/:playerId"
      purpose="Preserve the player profile drill-down route for account details, transactions, betting parameters, gaming activity, sports bets, and login history."
      preserved={[
        "Dynamic player ID route behavior is preserved.",
        "The page is available only in the authenticated admin shell.",
        "Legacy Nuxt player info links redirect to the React route shape.",
      ]}
      pending={[
        "Port player detail tabs and API calls for profile, transactions, sport, gaming activity, and logins.",
        "Restore permission-gated manual deposit, withdrawal, freeze, bonus, and terminate actions.",
      ]}
    />
  );
}
