'use client';

import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { withAuth } from "@/utils/withAuth";

const SmsSettingsPage = () => {

 return (
    <div>
        <PageBreadcrumb pageTitle="SMS Settings" />
    </div>
  );
};

export default withAuth(SmsSettingsPage);