import Link from "next/link";

import {
  CasinoFilterPanel,
  CasinoMetrics,
  CasinoRouteShell,
  CasinoSection,
  CasinoStatusBadge,
  CasinoTable,
} from "../components/CasinoRouteShell";
import { casinoGames, gameCategories, gameProviders } from "../data";

const categoryNames = new Map(
  gameCategories.map((category) => [category.id, category.name])
);
const providerNames = new Map(
  gameProviders.map((provider) => [provider.id, provider.name])
);

export default function CasinoGamesPage() {
  const activeGames = casinoGames.filter((game) => game.status === "active");
  const featuredGames = casinoGames.filter((game) => game.isFeatured);

  return (
    <CasinoRouteShell
      title="Casino Games Management"
      description="Search, review, add, edit, and retire games in the casino catalogue. This keeps the Nuxt list, category filtering, status visibility, edit links, and delete action surface."
      actions={[
        { label: "Add New Game", href: "/casino/games/add-new" },
        { label: "Open Unified Manager", href: "/casino", variant: "secondary" },
      ]}
    >
      <CasinoMetrics
        metrics={[
          {
            label: "Total Games",
            value: String(casinoGames.length),
            detail: "Catalogue records",
          },
          {
            label: "Active",
            value: String(activeGames.length),
            detail: "Visible in lobby",
          },
          {
            label: "Featured",
            value: String(featuredGames.length),
            detail: "Promoted placements",
          },
          {
            label: "Providers",
            value: String(gameProviders.length),
            detail: "Integrated suppliers",
          },
        ]}
      />

      <CasinoFilterPanel
        fields={[
          {
            label: "Filter by Category",
            placeholder: "All categories",
            options: gameCategories.map((category) => category.name),
          },
          {
            label: "Provider",
            placeholder: "All providers",
            options: gameProviders.map((provider) => provider.name),
          },
          {
            label: "Status",
            placeholder: "All statuses",
            options: ["active", "preview", "inactive"],
          },
        ]}
      />

      <CasinoSection
        title="List"
        description="Nuxt showed image, title, game ID, type, category, status, and edit/delete actions."
      >
        <CasinoTable
          columns={[
            { label: "Title", key: "title" },
            { label: "Game ID", key: "gameId" },
            { label: "Provider", key: "provider" },
            { label: "Category", key: "category" },
            { label: "Status", key: "status" },
            { label: "Actions", key: "actions", align: "right" },
          ]}
          rows={casinoGames.map((game) => ({
            id: game.id,
            title: (
              <Link
                href={`/casino/games/${game.id}`}
                className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                {game.name}
              </Link>
            ),
            gameId: game.slug,
            provider: providerNames.get(game.providerId) ?? "Unassigned",
            category: game.categories
              .map((categoryId) => categoryNames.get(categoryId))
              .filter(Boolean)
              .join(", "),
            status: (
              <CasinoStatusBadge
                active={game.status === "active"}
                label={game.status === "preview" ? "Preview" : undefined}
              />
            ),
            actions: (
              <div className="flex justify-end gap-2">
                <Link
                  href={`/casino/games/${game.id}`}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
                >
                  Edit
                </Link>
                <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10">
                  Delete
                </button>
              </div>
            ),
          }))}
        />
      </CasinoSection>
    </CasinoRouteShell>
  );
}
