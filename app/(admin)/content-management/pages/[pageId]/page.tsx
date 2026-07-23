import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import ContentPageEditorClient from "../../components/ContentPageEditorClient";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Edit Page" />
      <ContentPageEditorClient mode="edit" pageId={pageId} />
    </div>
  );
}
