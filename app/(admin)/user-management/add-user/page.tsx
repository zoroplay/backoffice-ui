import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import UserEditorClient from "../components/UserEditorClient";

export default function AddUserPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add New User" />
      <UserEditorClient mode="add" />
    </div>
  );
}
