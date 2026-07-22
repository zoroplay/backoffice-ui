import { TicketOpsShell, TicketSection } from "../components/TicketOpsShell";

export default function SportsPerformancePage() {
  return (
    <TicketOpsShell
      title="Sports Performance"
      description="The source Nuxt page for this route is still marked as undergoing development, so this React route preserves that user-visible state without fabricated performance data."
    >
      <TicketSection title="Status">
        <div className="py-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Undergoing Development
          </h2>
        </div>
      </TicketSection>
    </TicketOpsShell>
  );
}
