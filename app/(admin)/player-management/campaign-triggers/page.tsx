import {
  PlayerBadge,
  PlayerManagementShell,
  PlayerMetrics,
  PlayerSection,
  PlayerTable,
} from "../components/PlayerManagementShell";
import { playerSegments } from "../player-segmentation/data";

const triggers = [
  { id: "TRG-001", name: "7-Day JetRanger Reactivation", event: "Inactive 7 days", segment: "High Rollers", bonus: "Reload Bonus", status: "Active" },
  { id: "TRG-002", name: "Weekend Acca Insurance", event: "7+ legs placed", segment: "Weekend Warriors", bonus: "Free Bet", status: "Active" },
  { id: "TRG-003", name: "Zero-Balance Reload", event: "Balance hits zero", segment: "Newcomers", bonus: "Deposit Match", status: "Paused" },
];

export default function CampaignTriggersPage() {
  return (
    <PlayerManagementShell
      title="Campaign Triggers"
      description="Create and manage CRM campaign triggers for player events, bonus awards, segments, duplicate/delete actions, and lifecycle state."
    >
      <PlayerMetrics metrics={[
        { label: "Triggers", value: String(triggers.length), detail: "Configured automations" },
        { label: "Active", value: "2", detail: "Currently firing" },
        { label: "Segments", value: String(playerSegments.length), detail: "Eligibility sources" },
        { label: "Bonuses", value: "3", detail: "Award targets" },
      ]} />
      <PlayerSection title="Campaign Triggers">
        <PlayerTable
          columns={[
            { label: "Name", key: "name" },
            { label: "Event", key: "event" },
            { label: "Segment", key: "segment" },
            { label: "Bonus", key: "bonus" },
            { label: "Status", key: "status" },
            { label: "Actions", key: "actions", align: "right" },
          ]}
          rows={triggers.map((trigger) => ({
            ...trigger,
            status: <PlayerBadge tone={trigger.status === "Active" ? "success" : "warning"}>{trigger.status}</PlayerBadge>,
            actions: (
              <div className="flex justify-end gap-2">
                <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium dark:border-gray-700">Edit</button>
                <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium dark:border-gray-700">Duplicate</button>
                <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 dark:border-red-500/30 dark:text-red-300">Delete</button>
              </div>
            ),
          }))}
        />
      </PlayerSection>
    </PlayerManagementShell>
  );
}
