import {
  CasinoMetrics,
  CasinoRouteShell,
  CasinoSection,
  CasinoStatusBadge,
  CasinoTable,
} from "../components/CasinoRouteShell";
import { casinoGames, gameCategories, gameProviders } from "../data";

export default function CasinoGameSetupPage() {
  return (
    <CasinoRouteShell
      title="Casino Game Setup"
      description="Legacy Nuxt entry point for combined game, category, provider, and top-game setup. The React version keeps the consolidated overview and links users into the dedicated screens."
      actions={[
        { label: "Games", href: "/casino/games" },
        { label: "Categories", href: "/casino/categories", variant: "secondary" },
        { label: "Providers", href: "/casino/providers", variant: "secondary" },
      ]}
    >
      <CasinoMetrics
        metrics={[
          { label: "Games", value: String(casinoGames.length), detail: "Catalogue" },
          { label: "Categories", value: String(gameCategories.length), detail: "Lobby groups" },
          { label: "Providers", value: String(gameProviders.length), detail: "Suppliers" },
          {
            label: "Top Games",
            value: String(casinoGames.filter((game) => game.isFeatured).length),
            detail: "Featured entries",
          },
        ]}
      />

      <CasinoSection title="Setup Checklist">
        <CasinoTable
          columns={[
            { label: "Area", key: "area" },
            { label: "Purpose", key: "purpose" },
            { label: "Current State", key: "state" },
            { label: "Route", key: "route" },
          ]}
          rows={[
            {
              id: "games",
              area: "Games",
              purpose: "Add, edit, activate, and retire casino games.",
              state: <CasinoStatusBadge active label="Available" />,
              route: "/casino/games",
            },
            {
              id: "categories",
              area: "Categories",
              purpose: "Manage lobby grouping and top-category placement.",
              state: <CasinoStatusBadge active label="Available" />,
              route: "/casino/categories",
            },
            {
              id: "providers",
              area: "Providers",
              purpose: "Control supplier activation and catalogue ownership.",
              state: <CasinoStatusBadge active label="Available" />,
              route: "/casino/providers",
            },
            {
              id: "settings",
              area: "Settings",
              purpose: "Maintain global casino limits and feature toggles.",
              state: <CasinoStatusBadge active label="Available" />,
              route: "/casino/settings",
            },
          ]}
        />
      </CasinoSection>
    </CasinoRouteShell>
  );
}
