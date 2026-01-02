"use client";

import React, { useState} from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import { columns, PendingCashoutBet } from "./column";
import { pendingCashoutBets } from "./data";
import { withAuth } from "@/utils/withAuth";

function PendingCashoutPage() {
  
return (
    <div className="p-4">   

      <PageBreadcrumb pageTitle="Pending Cashout Bets" />
      
      <div className="mt-6">
        <DataTable columns={columns} data={pendingCashoutBets} />
      </div>
    </div>
  );
  }


export default withAuth(PendingCashoutPage);
