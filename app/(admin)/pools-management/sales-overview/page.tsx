"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { withAuth } from "@/utils/withAuth";

import PoolsSalesReport from "../components/PoolsSalesReport";

function PoolSalesOverviewPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Pools Sales Report" />
      <PoolsSalesReport variant="sales-overview" />
    </div>
  );
}

export default withAuth(PoolSalesOverviewPage);
