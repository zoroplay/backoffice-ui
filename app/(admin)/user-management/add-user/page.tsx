import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function AddUserPage() {
  return (
    <NuxtParityPage
      title="Add User"
      nuxtRoute="/UserManagement/AddUser"
      reactRoute="/user-management/add-user"
      purpose="Create back-office users and assign role/user details, preserving the Nuxt User Management creation flow."
      preserved={[
        "The route is protected by admin authentication.",
        "The page remains part of User Management.",
        "Legacy Nuxt links redirect to this React route.",
      ]}
      pending={[
        "Port user creation form fields, player/agent lookup, roles, and validation.",
        "Submit to the user creation endpoint and restore success/error feedback.",
      ]}
    />
  );
}
