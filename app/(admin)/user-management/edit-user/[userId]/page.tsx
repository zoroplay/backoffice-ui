import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import UserEditorClient from "../../components/UserEditorClient";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Edit User" />
      <UserEditorClient mode="edit" userId={userId} />
    </div>
  );
}
