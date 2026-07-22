import { notFound } from "next/navigation";

import {
  CasinoField,
  CasinoFormGrid,
  CasinoMetrics,
  CasinoRouteShell,
  CasinoSection,
} from "../../components/CasinoRouteShell";
import { casinoGames, gameCategories, gameProviders } from "../../data";

export default async function EditCasinoGamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const game = casinoGames.find(
    (item) => item.id === gameId || item.slug === gameId
  );

  if (!game) {
    notFound();
  }

  const selectedProvider =
    gameProviders.find((provider) => provider.id === game.providerId)?.name ??
    "";
  const selectedCategory =
    gameCategories.find((category) => game.categories.includes(category.id))
      ?.name ?? "";

  return (
    <CasinoRouteShell
      title={`Edit Casino Game: ${game.name}`}
      description="Update game metadata, provider/category placement, status, and lobby priority from the legacy dynamic game edit route."
      actions={[
        { label: "Back to Games", href: "/casino/games", variant: "secondary" },
      ]}
    >
      <CasinoMetrics
        metrics={[
          { label: "Status", value: game.status, detail: "Lifecycle state" },
          { label: "RTP", value: `${game.rtp}%`, detail: "Configured return" },
          {
            label: "Volatility",
            value: game.volatility,
            detail: "Risk profile",
          },
          {
            label: "Priority",
            value: String(game.priority),
            detail: "Lobby ordering",
          },
        ]}
      />

      <CasinoSection title="Game Configuration">
        <form className="space-y-5">
          <CasinoFormGrid>
            <CasinoField label="Title" value={game.name} />
            <CasinoField label="Game ID" value={game.slug} />
            <CasinoField
              label="Provider"
              value={selectedProvider}
              options={gameProviders.map((provider) => provider.name)}
            />
            <CasinoField
              label="Category"
              value={selectedCategory}
              options={gameCategories.map((category) => category.name)}
            />
            <CasinoField
              label="Status"
              value={game.status}
              options={["active", "preview", "inactive"]}
            />
            <CasinoField
              label="Volatility"
              value={game.volatility}
              options={["Low", "Medium", "High", "Extreme"]}
            />
            <CasinoField label="RTP" value={game.rtp} type="number" />
            <CasinoField label="Priority" value={game.priority} type="number" />
            <CasinoField label="Thumbnail" value={game.thumbnail} />
          </CasinoFormGrid>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
            >
              Delete Game
            </button>
            <button
              type="button"
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </CasinoSection>
    </CasinoRouteShell>
  );
}
