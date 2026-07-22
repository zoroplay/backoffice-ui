import {
  ConfigurationField,
  ConfigurationFormGrid,
  ConfigurationMetrics,
  ConfigurationSection,
  ConfigurationShell,
  ConfigurationTable,
} from "../components/ConfigurationShell";

const gameKeys = [
  { id: "pragmatic-client", provider: "pragmatic-play", option: "client_secret", value: "••••••••" },
  { id: "evolution-token", provider: "evolution-gaming", option: "api_token", value: "••••••••" },
  { id: "hacksaw-operator", provider: "hacksaw-gaming", option: "operator_id", value: "SBE-NG" },
];

export default function GameKeysPage() {
  return (
    <ConfigurationShell
      title="Game Key Settings"
      description="Maintain provider-specific game integration keys. Nuxt supported add-row, remove-row, provider selection, and bulk save behavior."
    >
      <ConfigurationMetrics
        metrics={[
          { label: "Keys", value: String(gameKeys.length), detail: "Configured entries" },
          { label: "Providers", value: "3", detail: "With stored keys" },
          { label: "Secrets", value: "2", detail: "Masked values" },
          { label: "Client", value: "Default", detail: "Environment scoped" },
        ]}
      />

      <ConfigurationSection title="Keys">
        <ConfigurationTable
          columns={[
            { label: "Provider", key: "provider" },
            { label: "Key", key: "option" },
            { label: "Value", key: "value" },
            { label: "Action", key: "action", align: "right" },
          ]}
          rows={gameKeys.map((key) => ({
            ...key,
            action: (
              <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10">
                Remove
              </button>
            ),
          }))}
        />
      </ConfigurationSection>

      <ConfigurationSection title="Add Key">
        <form className="space-y-5">
          <ConfigurationFormGrid>
            <ConfigurationField label="Provider" options={["pragmatic-play", "evolution-gaming", "hacksaw-gaming", "netent"]} />
            <ConfigurationField label="Key" value="" />
            <ConfigurationField label="Value" value="" />
          </ConfigurationFormGrid>
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900">
              Add More
            </button>
            <button type="button" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
              Submit
            </button>
          </div>
        </form>
      </ConfigurationSection>
    </ConfigurationShell>
  );
}
