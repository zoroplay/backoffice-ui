import {
  CasinoFilterPanel,
  CasinoMetrics,
  CasinoRouteShell,
  CasinoSection,
  CasinoStatusBadge,
  CasinoTable,
} from "../components/CasinoRouteShell";
import { casinoGames, gameCategories } from "../data";

const categoryNames = new Map(
  gameCategories.map((category) => [category.id, category.name])
);

export default function CasinoTopGamesPage() {
  const topGames = [...casinoGames].sort((a, b) => b.priority - a.priority);

  return (
    <CasinoRouteShell
      title="Casino Top Games"
      description="Curate high-priority casino lobby games, preserving Nuxt category filtering, ranked ordering, and active/inactive controls."
      actions={[{ label: "Open Games", href: "/casino/games", variant: "secondary" }]}
    >
      <CasinoMetrics
        metrics={[
          {
            label: "Ranked Games",
            value: String(topGames.length),
            detail: "Sorted by priority",
          },
          {
            label: "Featured",
            value: String(topGames.filter((game) => game.isFeatured).length),
            detail: "Promoted games",
          },
          {
            label: "Bonus Buy",
            value: String(topGames.filter((game) => game.hasBonusBuy).length),
            detail: "Special mechanics",
          },
          {
            label: "Categories",
            value: String(gameCategories.length),
            detail: "Available filters",
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
          { label: "Search", placeholder: "Game title or ID" },
        ]}
      />

      <CasinoSection title="Top Games List">
        <CasinoTable
          columns={[
            { label: "Rank", key: "rank", align: "right" },
            { label: "Game", key: "game" },
            { label: "Category", key: "category" },
            { label: "Priority", key: "priority", align: "right" },
            { label: "Status", key: "status" },
          ]}
          rows={topGames.map((game, index) => ({
            id: game.id,
            rank: index + 1,
            game: game.name,
            category: game.categories
              .map((categoryId) => categoryNames.get(categoryId))
              .filter(Boolean)
              .join(", "),
            priority: game.priority,
            status: (
              <CasinoStatusBadge
                active={game.status === "active"}
                label={game.status === "preview" ? "Preview" : undefined}
              />
            ),
          }))}
        />
      </CasinoSection>
    </CasinoRouteShell>
  );
}
