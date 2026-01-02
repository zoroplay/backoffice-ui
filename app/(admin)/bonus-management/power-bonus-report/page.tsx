'use client';

import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { withAuth } from "@/utils/withAuth";

const PowerBonusReportPage = () => {

 return (
    <div>
        <PageBreadcrumb pageTitle="Power Bonus Report" />
    </div>
 )
}

export default withAuth(PowerBonusReportPage);