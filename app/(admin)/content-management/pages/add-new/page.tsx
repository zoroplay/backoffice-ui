import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import ContentPageEditorClient from "../../components/ContentPageEditorClient";

export default function AddContentPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add New Page" />
      <ContentPageEditorClient mode="add" />
    </div>
  );
}
