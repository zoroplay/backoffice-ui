import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return (
    <NuxtParityPage
      title={`Edit User: ${userId}`}
      nuxtRoute="/UserManagement/EditUser/:UserId"
      reactRoute="/user-management/edit-user/:userId"
      purpose="Edit an existing back-office user, including identity, role, and account linkage fields from the Nuxt workflow."
      preserved={[
        "Dynamic user ID route behavior is preserved.",
        "The page remains inside authenticated User Management.",
        "Legacy Nuxt edit links redirect to the React route.",
      ]}
      pending={[
        "Port single-user load, role list load, and update mutation.",
        "Restore validation, permission-sensitive controls, and post-save navigation.",
      ]}
    />
  );
}
