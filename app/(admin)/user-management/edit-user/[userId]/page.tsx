import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import UserEditorClient from "../../components/UserEditorClient";
import { usersSeed } from "../../users/data";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = usersSeed.find((item) => item.id === userId || item.email === userId);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle={`Edit User${user ? `: ${user.name}` : ""}`} />
      <UserEditorClient mode="edit" userId={userId} />
    </div>
  );
}
