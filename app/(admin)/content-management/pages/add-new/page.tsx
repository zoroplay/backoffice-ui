import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function AddContentPage() {
  return (
    <NuxtParityPage
      title="Add Page"
      nuxtRoute="/ContentManagement/Pages/AddNew"
      reactRoute="/content-management/pages/add-new"
      purpose="Create CMS pages for the public site while preserving the Nuxt content-management page creation flow."
      preserved={[
        "The route is protected by the admin auth guard.",
        "The page remains in Content Management under Pages.",
        "Legacy Nuxt links redirect to this React route.",
      ]}
      pending={[
        "Port title, slug, status, content editor, and metadata fields.",
        "Submit through the CMS create-page API and restore success/error feedback.",
      ]}
    />
  );
}
