import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import BannerEditorClient from "../../components/BannerEditorClient";

export default function AddBannerPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add New Banner" />
      <BannerEditorClient mode="add" />
    </div>
  );
}
