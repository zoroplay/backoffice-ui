import {
  CasinoMetrics,
  CasinoRouteShell,
  CasinoSection,
  CasinoStatusBadge,
  CasinoTable,
} from "../components/CasinoRouteShell";
import { gameCategories } from "../data";

const menuRows = [
  {
    id: "casino-home",
    label: "Casino Home",
    path: "/casino",
    target: "Web and mobile",
    status: true,
  },
  {
    id: "live-casino",
    label: "Live Casino",
    path: "/casino?category=live",
    target: "Web and mobile",
    status: true,
  },
  {
    id: "top-games",
    label: "Top Games",
    path: "/casino/top-games",
    target: "Web",
    status: true,
  },
  {
    id: "scratch-card",
    label: "Scratch Card",
    path: "/casino?category=scratch",
    target: "Mobile",
    status: false,
  },
];

export default function CasinoMenuPage() {
  return (
    <CasinoRouteShell
      title="Casino Menu"
      description="Configure casino lobby navigation and category links that players use to enter casino game groups."
    >
      <CasinoMetrics
        metrics={[
          { label: "Menu Items", value: String(menuRows.length), detail: "Configured links" },
          {
            label: "Active Items",
            value: String(menuRows.filter((row) => row.status).length),
            detail: "Visible entries",
          },
          {
            label: "Categories",
            value: String(gameCategories.length),
            detail: "Lobby sources",
          },
          { label: "Targets", value: "2", detail: "Web and mobile" },
        ]}
      />

      <CasinoSection title="Menu Items">
        <CasinoTable
          columns={[
            { label: "Label", key: "label" },
            { label: "Path", key: "path" },
            { label: "Target", key: "target" },
            { label: "Status", key: "status" },
            { label: "Actions", key: "actions", align: "right" },
          ]}
          rows={menuRows.map((row) => ({
            ...row,
            status: <CasinoStatusBadge active={row.status} />,
            actions: (
              <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900">
                Edit
              </button>
            ),
          }))}
        />
      </CasinoSection>
    </CasinoRouteShell>
  );
}
