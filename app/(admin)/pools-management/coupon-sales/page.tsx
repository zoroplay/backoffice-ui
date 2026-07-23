"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { withAuth } from "@/utils/withAuth";

import PoolsSalesReport from "../components/PoolsSalesReport";

function PoolCouponSalesPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Coupon Sales Report" />
      <PoolsSalesReport variant="coupon-sales" />
    </div>
  );
}

export default withAuth(PoolCouponSalesPage);
