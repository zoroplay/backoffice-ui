import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import PromotionEditorClient from "../components/PromotionEditorClient";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ promotionId: string }>;
}) {
  const { promotionId } = await params;

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Update Promotion" />
      <PromotionEditorClient mode="edit" promotionId={promotionId} />
    </div>
  );
}
