import { ReportPageShell } from "../components/ReportPageShell";

type Panel = {
  id: string;
  title: string;
  variant: "line" | "bar" | "stacked";
};

const panels: Panel[] = [
  { id: "financial", title: "Financial Overview", variant: "line" },
  { id: "bonus", title: "Bonus Spent & NGR Overview", variant: "line" },
  { id: "virtual", title: "Virtual Actvity GGR", variant: "bar" },
  { id: "players", title: "Active Players", variant: "stacked" },
  { id: "client-type", title: "GGR & NGR by Client Type", variant: "bar" },
  { id: "ftds", title: "FTDS vs Conversions", variant: "stacked" },
];

export default function ReportingDashboardPage() {
  return (
    <ReportPageShell
      title="Reporting Dashboard"
      description="Executive reporting dashboard preserving the Nuxt chart panels for financials, bonus spend, virtual activity GGR, active players, client-type revenue, and FTD conversion."
    >
      <section className="grid gap-5 xl:grid-cols-2">
        {panels.map((panel) => (
          <DashboardPanel key={panel.id} panel={panel} />
        ))}
      </section>
    </ReportPageShell>
  );
}

function DashboardPanel({ panel }: { panel: Panel }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {panel.title}
        </h2>
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            Primary
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Secondary
          </span>
        </div>
        <div className="relative h-72 overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:48px_48px]" />
          {panel.variant === "line" ? <LineChartSketch /> : null}
          {panel.variant === "bar" ? <BarChartSketch stacked={false} /> : null}
          {panel.variant === "stacked" ? <BarChartSketch stacked /> : null}
        </div>
      </div>
    </article>
  );
}

function LineChartSketch() {
  return (
    <div className="absolute inset-5">
      <div className="absolute bottom-3 left-0 right-0 h-px bg-gray-300 dark:bg-gray-700" />
      <div className="absolute bottom-3 left-0 top-0 w-px bg-gray-300 dark:bg-gray-700" />
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <polyline
          fill="none"
          points="4,78 22,48 41,62 62,30 84,42 96,26"
          stroke="rgb(70 95 255)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <polyline
          fill="none"
          points="8,70 28,58 48,40 70,56 90,22"
          stroke="rgb(16 185 129)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

function BarChartSketch({ stacked }: { stacked: boolean }) {
  const bars = [44, 70, 58, 82, 50, 64, 76];

  return (
    <div className="absolute inset-5 flex items-end gap-4">
      <div className="absolute bottom-3 left-0 right-0 h-px bg-gray-300 dark:bg-gray-700" />
      <div className="absolute bottom-3 left-0 top-0 w-px bg-gray-300 dark:bg-gray-700" />
      {bars.map((height, index) => (
        <div
          key={`${height}-${index}`}
          className="z-10 flex flex-1 items-end justify-center"
          style={{ height: "100%" }}
        >
          {stacked ? (
            <div
              className="flex w-full max-w-10 flex-col overflow-hidden rounded-t-md"
              style={{ height: `${height}%` }}
            >
              <span
                className="block bg-emerald-500"
                style={{ height: "42%" }}
              />
              <span
                className="block bg-brand-500"
                style={{ height: "58%" }}
              />
            </div>
          ) : (
            <div className="flex w-full max-w-16 items-end gap-1.5">
              <span
                className="block flex-1 rounded-t-md bg-brand-500"
                style={{ height: `${height}%` }}
              />
              <span
                className="block flex-1 rounded-t-md bg-emerald-500"
                style={{ height: `${Math.max(22, height - 18)}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
