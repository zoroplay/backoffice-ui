import {
  ConfigurationBadge,
  ConfigurationField,
  ConfigurationFormGrid,
  ConfigurationMetrics,
  ConfigurationSection,
  ConfigurationShell,
  ConfigurationTable,
} from "../components/ConfigurationShell";

const thresholds = [
  { id: "agent-184", username: "retail-main-184", threshold: "NGN 2,500,000", exposure: "NGN 1,420,000", status: "Healthy" },
  { id: "agent-091", username: "ibadan-shop-091", threshold: "NGN 1,000,000", exposure: "NGN 980,000", status: "Watch" },
  { id: "agent-027", username: "lagos-kiosk-027", threshold: "NGN 500,000", exposure: "NGN 650,000", status: "Exceeded" },
];

const logs = [
  { id: "log-1", actor: "admin@sbe", action: "Threshold updated", target: "retail-main-184", date: "2026-07-22" },
  { id: "log-2", actor: "finance@sbe", action: "Manual settlement", target: "ibadan-shop-091", date: "2026-07-21" },
  { id: "log-3", actor: "risk@sbe", action: "Threshold reduced", target: "lagos-kiosk-027", date: "2026-07-20" },
];

export default function TrustThresholdPage() {
  return (
    <ConfigurationShell
      title="Trust Threshold Settings"
      description="Manage wallet trust thresholds for agents and players, including manual settlement and activity log review."
    >
      <ConfigurationMetrics
        metrics={[
          { label: "Tracked Accounts", value: String(thresholds.length), detail: "Visible records" },
          { label: "Exceeded", value: "1", detail: "Needs action" },
          { label: "Manual Settlements", value: "1", detail: "Recent period" },
          { label: "Log Entries", value: String(logs.length), detail: "Audit trail" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),420px]">
        <ConfigurationSection title="Trust Settings">
          <ConfigurationTable
            columns={[
              { label: "Username", key: "username" },
              { label: "Threshold", key: "threshold", align: "right" },
              { label: "Exposure", key: "exposure", align: "right" },
              { label: "Status", key: "status" },
            ]}
            rows={thresholds.map((row) => ({
              ...row,
              status: (
                <ConfigurationBadge
                  tone={
                    row.status === "Healthy"
                      ? "success"
                      : row.status === "Watch"
                        ? "warning"
                        : "danger"
                  }
                >
                  {row.status}
                </ConfigurationBadge>
              ),
            }))}
          />
        </ConfigurationSection>

        <ConfigurationSection title="Set Threshold">
          <form className="space-y-5">
            <ConfigurationFormGrid>
              <ConfigurationField label="Username" value="" />
              <ConfigurationField label="Threshold Amount" value="" type="number" />
              <ConfigurationField label="Settlement Amount" value="" type="number" />
            </ConfigurationFormGrid>
            <div className="grid gap-2">
              <button type="button" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
                Save Threshold
              </button>
              <button type="button" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900">
                Manual Settlement
              </button>
            </div>
          </form>
        </ConfigurationSection>
      </div>

      <ConfigurationSection title="Activity Logs">
        <ConfigurationTable
          columns={[
            { label: "Date", key: "date" },
            { label: "Actor", key: "actor" },
            { label: "Target", key: "target" },
            { label: "Action", key: "action" },
          ]}
          rows={logs}
        />
      </ConfigurationSection>
    </ConfigurationShell>
  );
}
