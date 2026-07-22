import {
  CasinoFilterPanel,
  CasinoMetrics,
  CasinoRouteShell,
  CasinoSection,
  CasinoStatusBadge,
  CasinoTable,
} from "../components/CasinoRouteShell";
import { casinoGames, gameProviders } from "../data";

const betRows = [
  {
    id: "CB-912381",
    player: "samuel.ng",
    game: "Camino De Chili: Bonus Buy",
    provider: "Hacksaw Gaming",
    stake: "NGN 25,000",
    payout: "NGN 183,500",
    status: "Settled",
  },
  {
    id: "CB-912382",
    player: "linda7",
    game: "Immersive Roulette Live",
    provider: "Evolution Gaming",
    stake: "NGN 75,000",
    payout: "NGN 0",
    status: "Lost",
  },
  {
    id: "CB-912383",
    player: "agent-kiosk-12",
    game: "Sportsbook Royale",
    provider: "Pragmatic Play",
    stake: "NGN 10,000",
    payout: "Pending",
    status: "Open",
  },
];

export default function CasinoBetsHistoryPage() {
  return (
    <CasinoRouteShell
      title="Casino Bets History"
      description="Review casino wagers by player, provider, game, date range, and settlement status. This preserves the Nuxt operational audit flow for casino bet investigation."
    >
      <CasinoMetrics
        metrics={[
          { label: "Total Stake", value: "NGN 110,000", detail: "Visible rows" },
          { label: "Total Payout", value: "NGN 183,500", detail: "Settled rows" },
          { label: "Open Bets", value: "1", detail: "Awaiting settlement" },
          { label: "Games", value: String(casinoGames.length), detail: "Catalogue" },
        ]}
      />

      <CasinoFilterPanel
        fields={[
          { label: "Player", placeholder: "Username, phone, or ID" },
          {
            label: "Provider",
            placeholder: "All providers",
            options: gameProviders.map((provider) => provider.name),
          },
          {
            label: "Game",
            placeholder: "All games",
            options: casinoGames.map((game) => game.name),
          },
          {
            label: "Status",
            placeholder: "All statuses",
            options: ["Open", "Settled", "Lost", "Cancelled"],
          },
        ]}
      />

      <CasinoSection title="Bet History">
        <CasinoTable
          columns={[
            { label: "Bet ID", key: "id" },
            { label: "Player", key: "player" },
            { label: "Game", key: "game" },
            { label: "Provider", key: "provider" },
            { label: "Stake", key: "stake", align: "right" },
            { label: "Payout", key: "payout", align: "right" },
            { label: "Status", key: "status" },
          ]}
          rows={betRows.map((row) => ({
            ...row,
            status: (
              <CasinoStatusBadge
                active={row.status === "Settled"}
                label={row.status}
              />
            ),
          }))}
        />
      </CasinoSection>
    </CasinoRouteShell>
  );
}
