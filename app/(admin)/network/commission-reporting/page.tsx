import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import CommissionReportingClient from "./CommissionReportingClient";

export default function NetworkCommissionReportingPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Commission Reporting" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Commission Reporting</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Report agency commissions by date range and channel, with expandable calculation detail per result row.
        </p>
      </section>
      <CommissionReportingClient />
    </div>
  );
}
