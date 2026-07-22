import {
  CasinoField,
  CasinoFormGrid,
  CasinoRouteShell,
  CasinoSection,
} from "../../components/CasinoRouteShell";
import { gameCategories, gameProviders } from "../../data";

export default function AddCasinoGamePage() {
  return (
    <CasinoRouteShell
      title="Add Casino Game"
      description="Create a casino game with the same fields the Nuxt form required: title, game identifier, provider/category assignment, image path, type, and activation status."
      actions={[
        { label: "Back to Games", href: "/casino/games", variant: "secondary" },
      ]}
    >
      <CasinoSection
        title="Game Details"
        description="The current React batch keeps this as a route-level form shell; API-backed submission will be connected in the data integration phase."
      >
        <form className="space-y-5">
          <CasinoFormGrid>
            <CasinoField label="Title" value="" />
            <CasinoField label="Game ID" value="" />
            <CasinoField
              label="Provider"
              options={gameProviders.map((provider) => provider.name)}
            />
            <CasinoField
              label="Category"
              options={gameCategories.map((category) => category.name)}
            />
            <CasinoField
              label="Type"
              options={["slot", "table", "live", "crash", "scratch"]}
            />
            <CasinoField
              label="Status"
              options={["Active", "Deactivated", "Preview"]}
            />
            <CasinoField label="Image Path" value="" />
            <CasinoField label="Priority" value={100} type="number" />
          </CasinoFormGrid>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Save Game
            </button>
          </div>
        </form>
      </CasinoSection>
    </CasinoRouteShell>
  );
}
