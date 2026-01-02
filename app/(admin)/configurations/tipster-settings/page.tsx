'use client'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { withAuth } from '@/utils/withAuth'

function TipsterSettingsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Tipster Settings" />
    </div>
  );
}

export default withAuth(TipsterSettingsPage);