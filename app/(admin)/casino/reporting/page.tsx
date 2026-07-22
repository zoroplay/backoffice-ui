import {
  CasinoFilterPanel,
  CasinoMetrics,
  CasinoRouteShell,
  CasinoSection,
  CasinoTable,
} from "../components/CasinoRouteShell";
import { casinoGames, gameProviders } from "../data";

const reportRows = [
  {
    provider: "Hacksaw Gaming",
    turnover: "NGN 34.8m",
    ggr: "NGN 4.6m",
    rounds: "18,421",
    margin: "13.2%",
  },
  {
    provider: "Evolution Gaming",
    turnover: "NGN 21.1m",
    ggr: "NGN 2.2m",
    rounds: "6,944",
    margin: "10.4%",
  },
  {
    provider: "Pragmatic Play",
    turnover: "NGN 16.5m",
    ggr: "NGN 1.7m",
    rounds: "11,083",
    margin: "10.3%",
  },
];

export default function CasinoReportingPage() {
  return (
    <CasinoRouteShell
      title="Casino Reporting"
      description="Track casino turnover, gross gaming revenue, provider performance, and game activity by date range."
    >
      <CasinoMetrics
        metrics={[
          { label: "Turnover", value: "NGN 72.4m", detail: "Selected period" },
          { label: "GGR", value: "NGN 8.5m", detail: "Selected period" },
          { label: "Rounds", value: "36,448", detail: "Casino game rounds" },
          { label: "Avg Margin", value: "11.7%", detail: "Provider blend" },
        ]}
      />

      <CasinoFilterPanel
        fields={[
          { label: "From", value: "2026-07-01", placeholder: "YYYY-MM-DD" },
          { label: "To", value: "2026-07-22", placeholder: "YYYY-MM-DD" },
          {
            label: "Provider",
            placeholder: "All providers",
            options: gameProviders.map((provider) => provider.name),
          },
          {
            label: "Game",
            placeholder: "All games",
            options: casinoGames.map((game) => game.name),
          },
        ]}
      />

      <CasinoSection title="Provider Performance">
        <CasinoTable
          columns={[
            { label: "Provider", key: "provider" },
            { label: "Turnover", key: "turnover", align: "right" },
            { label: "GGR", key: "ggr", align: "right" },
            { label: "Rounds", key: "rounds", align: "right" },
            { label: "Margin", key: "margin", align: "right" },
          ]}
          rows={reportRows}
        />
      </CasinoSection>
    </CasinoRouteShell>
  );
}
