"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { withAuth } from "@/utils/withAuth";

import PoolsTicketLookup from "../components/PoolsTicketLookup";

function PoolsTicketsPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Pools Tickets" />
      <PoolsTicketLookup variant="pool" />
    </div>
  );
}

export default withAuth(PoolsTicketsPage);
