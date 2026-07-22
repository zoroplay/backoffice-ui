import { ReportMetrics, ReportPageShell } from "../components/ReportPageShell";

import PayoutTransactionsClient from "./PayoutTransactionsClient";

export default function PayoutTransactionsPage() {
  return (
    <ReportPageShell
      title="Payout Transactions"
      description="Review payout exposure by network user, bet count, winnings, paid payouts, pending payout, and available balance."
    >
      <ReportMetrics metrics={[
        { label: "No of Bets", value: "174", detail: "Visible rows" },
        { label: "Total Winning", value: "NGN 2.43m", detail: "Aggregate winnings" },
        { label: "Total Payout", value: "NGN 1.73m", detail: "Settled payouts" },
        { label: "Pending", value: "NGN 695k", detail: "Winnings less payouts" },
      ]} />
      <PayoutTransactionsClient />
    </ReportPageShell>
  );
}
