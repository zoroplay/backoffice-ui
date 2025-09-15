"use client";
 import  Button  from "@/components/ui/button/Button";
import type { Metadata } from "next";
import { withAuth } from "@/utils/withAuth";
// import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
// import React from "react";
// import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
// import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "@/components/ecommerce/StatisticsChart";
// import RecentOrders from "@/components/ecommerce/RecentOrders";
// import DemographicCard from "@/components/ecommerce/DemographicCard";

// export const metadata: Metadata = {
//   title:
//     "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
//   description: "This is Next.js Home for TailAdmin Dashboard Template",
// };

function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
     <div className= "size-24 bg-red-200">
     


  
    <div className="">
      {/* <Button variant="default">Default</Button> */}
      <Button variant="outline">Outline</Button>
      <Button variant="primary">primary</Button>
    </div>
         </div>
      {/* <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div> */}
    </div>
  );
}

export default withAuth(Dashboard);
