import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import PromotionEditorClient from "../components/PromotionEditorClient";

export default function AddPromotionPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add New Promotion" />
      <PromotionEditorClient mode="add" />
    </div>
  );
}
