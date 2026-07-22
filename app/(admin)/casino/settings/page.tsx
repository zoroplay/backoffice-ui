import {
  CasinoField,
  CasinoFormGrid,
  CasinoMetrics,
  CasinoRouteShell,
  CasinoSection,
} from "../components/CasinoRouteShell";

const settings = {
  minimumStake: 50,
  maximumStake: 500000,
  maximumPayout: 5000000,
  liveCasinoEnabled: "Enabled",
  bonusBuyEnabled: "Enabled",
  providerTimeout: 30,
};

export default function CasinoSettingsPage() {
  return (
    <CasinoRouteShell
      title="Casino Settings"
      description="Control global casino limits, feature availability, provider timeout rules, and player-facing casino options."
    >
      <CasinoMetrics
        metrics={[
          { label: "Minimum Stake", value: `NGN ${settings.minimumStake}`, detail: "Global floor" },
          {
            label: "Maximum Stake",
            value: `NGN ${settings.maximumStake.toLocaleString()}`,
            detail: "Per round cap",
          },
          {
            label: "Maximum Payout",
            value: `NGN ${settings.maximumPayout.toLocaleString()}`,
            detail: "Liability cap",
          },
          {
            label: "Timeout",
            value: `${settings.providerTimeout}s`,
            detail: "Provider request window",
          },
        ]}
      />

      <CasinoSection title="Global Settings">
        <form className="space-y-5">
          <CasinoFormGrid>
            <CasinoField
              label="Minimum Stake"
              value={settings.minimumStake}
              type="number"
            />
            <CasinoField
              label="Maximum Stake"
              value={settings.maximumStake}
              type="number"
            />
            <CasinoField
              label="Maximum Payout"
              value={settings.maximumPayout}
              type="number"
            />
            <CasinoField
              label="Provider Timeout Seconds"
              value={settings.providerTimeout}
              type="number"
            />
            <CasinoField
              label="Live Casino"
              value={settings.liveCasinoEnabled}
              options={["Enabled", "Disabled"]}
            />
            <CasinoField
              label="Bonus Buy"
              value={settings.bonusBuyEnabled}
              options={["Enabled", "Disabled"]}
            />
          </CasinoFormGrid>

          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Save Settings
            </button>
          </div>
        </form>
      </CasinoSection>
    </CasinoRouteShell>
  );
}
