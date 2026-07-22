import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function AddBannerPage() {
  return (
    <NuxtParityPage
      title="Add Banner"
      nuxtRoute="/ContentManagement/Banners/AddNew"
      reactRoute="/content-management/banners/add-new"
      purpose="Create site banners and campaign artwork placements, preserving the Nuxt banner creation route."
      preserved={[
        "The route uses the authenticated Content Management shell.",
        "The page remains part of banner management.",
        "Legacy Nuxt links redirect to this React page.",
      ]}
      pending={[
        "Port banner image upload, platform, position, date, sport/fixture targeting, and validation fields.",
        "Submit through the create-banner API and restore post-save navigation.",
      ]}
    />
  );
}
