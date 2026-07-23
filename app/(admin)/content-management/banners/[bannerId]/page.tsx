import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import BannerEditorClient from "../../components/BannerEditorClient";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ bannerId: string }>;
}) {
  const { bannerId } = await params;

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Edit Banner" />
      <BannerEditorClient mode="edit" bannerId={bannerId} />
    </div>
  );
}
