import {
  CasinoMetrics,
  CasinoRouteShell,
  CasinoSection,
  CasinoStatusBadge,
  CasinoTable,
} from "../components/CasinoRouteShell";
import { gameProviders } from "../data";

export default function CasinoProvidersPage() {
  return (
    <CasinoRouteShell
      title="Casino Provider Management"
      description="Maintain provider records and availability controls, including the Nuxt activate/deactivate and delete action surface."
      actions={[{ label: "Open Unified Manager", href: "/casino", variant: "secondary" }]}
    >
      <CasinoMetrics
        metrics={[
          {
            label: "Providers",
            value: String(gameProviders.length),
            detail: "Configured suppliers",
          },
          {
            label: "Active",
            value: String(gameProviders.filter((item) => item.isActive).length),
            detail: "Enabled for play",
          },
          {
            label: "Games",
            value: String(
              gameProviders.reduce((sum, provider) => sum + provider.totalGames, 0)
            ),
            detail: "Provider catalogue total",
          },
          {
            label: "Inactive",
            value: String(gameProviders.filter((item) => !item.isActive).length),
            detail: "Hidden providers",
          },
        ]}
      />

      <CasinoSection title="List">
        <CasinoTable
          columns={[
            { label: "Name", key: "name" },
            { label: "Slug", key: "slug" },
            { label: "Games", key: "games", align: "right" },
            { label: "Status", key: "status" },
            { label: "Actions", key: "actions", align: "right" },
          ]}
          rows={gameProviders.map((provider) => ({
            id: provider.id,
            name: provider.name,
            slug: provider.slug,
            games: provider.totalGames,
            status: <CasinoStatusBadge active={provider.isActive} />,
            actions: (
              <div className="flex justify-end gap-2">
                <button className="rounded-md border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 dark:border-green-500/30 dark:text-green-300 dark:hover:bg-green-500/10">
                  Activate
                </button>
                <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900">
                  Deactivate
                </button>
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
