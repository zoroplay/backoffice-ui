"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { withAuth } from "@/utils/withAuth";

import PoolsTicketLookup from "../components/PoolsTicketLookup";

function CouponTicketsPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Coupon Tickets" />
      <PoolsTicketLookup variant="coupon" />
    </div>
  );
}

export default withAuth(CouponTicketsPage);
