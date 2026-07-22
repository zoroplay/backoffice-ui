import {
  CasinoFilterPanel,
  CasinoMetrics,
  CasinoRouteShell,
  CasinoSection,
  CasinoStatusBadge,
  CasinoTable,
} from "../components/CasinoRouteShell";
import { casinoGames, gameCategories, gameProviders } from "../data";

export default function CasinoCategoriesPage() {
  const topCategories = [...gameCategories]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);

  return (
    <CasinoRouteShell
      title="Casino Categories Management"
      description="Manage category names, status, provider filtering, and top-category placement carried over from Nuxt."
      actions={[{ label: "Open Unified Manager", href: "/casino", variant: "secondary" }]}
    >
      <CasinoMetrics
        metrics={[
          {
            label: "Categories",
            value: String(gameCategories.length),
            detail: "Lobby groupings",
          },
          {
            label: "Active",
            value: String(gameCategories.filter((item) => item.isActive).length),
            detail: "Available filters",
          },
          {
            label: "Top Categories",
            value: String(topCategories.length),
            detail: "Promoted groups",
          },
          {
            label: "Providers",
            value: String(gameProviders.length),
            detail: "Filter source",
          },
        ]}
      />

      <CasinoFilterPanel
        fields={[
          {
            label: "Filter by Provider",
            placeholder: "All providers",
            options: gameProviders.map((provider) => provider.name),
          },
        ]}
      />

      <CasinoSection title="Categories">
        <CasinoTable
          columns={[
            { label: "Name", key: "name" },
            { label: "Slug", key: "slug" },
            { label: "Games", key: "games", align: "right" },
            { label: "Status", key: "status" },
            { label: "Actions", key: "actions", align: "right" },
          ]}
          rows={gameCategories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.id.replace("cat-", ""),
            games: casinoGames.filter((game) =>
              game.categories.includes(category.id)
            ).length,
            status: <CasinoStatusBadge active={category.isActive} />,
            actions: (
              <div className="flex justify-end gap-2">
                <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900">
                  Edit
                </button>
                <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10">
                  Delete
                </button>
              </div>
            ),
          }))}
        />
      </CasinoSection>

      <CasinoSection
        title="Top Categories"
        description="Nuxt maintained a separate top-category tab for curated casino lobby groups."
      >
        <CasinoTable
          columns={[
            { label: "Name", key: "name" },
            { label: "Number of Games", key: "games", align: "right" },
            { label: "Priority", key: "priority", align: "right" },
          ]}
          rows={topCategories.map((category) => ({
            id: category.id,
            name: category.name,
            games: casinoGames.filter((game) =>
              game.categories.includes(category.id)
            ).length,
            priority: category.priority,
          }))}
        />
      </CasinoSection>
    </CasinoRouteShell>
  );
}
