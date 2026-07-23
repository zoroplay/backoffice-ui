import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import CommissionReportingClient from "./CommissionReportingClient";

export default function NetworkCommissionReportingPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Commission Reporting" />
      <CommissionReportingClient />
    </div>
  );
}
