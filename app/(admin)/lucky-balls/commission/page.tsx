import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import LuckyBallsCommissionClient from "../components/LuckyBallsCommissionClient";

export default function LuckyBallsCommissionPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Lucky Balls Commissions" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Lucky Balls Commissions
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              Calculate commission for Lucky Balls agents over a date window, select eligible agents, enter the bonus amount, and run the preserved pay-all workflow.
            </p>
          </div>
          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
            <div>Search: <span className="font-mono">luckyBallsCommission(page, filters)</span></div>
            <div className="mt-1">Pay: <span className="font-mono">payCommission(agentIDs, startTime, endTime)</span></div>
          </div>
        </div>
      </section>
      <LuckyBallsCommissionClient />
    </div>
  );
}
