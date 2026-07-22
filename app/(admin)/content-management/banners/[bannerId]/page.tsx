import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ bannerId: string }>;
}) {
  const { bannerId } = await params;

  return (
    <NuxtParityPage
      title={`Edit Banner: ${bannerId}`}
      nuxtRoute="/ContentManagement/Banners/:EditBanner"
      reactRoute="/content-management/banners/:bannerId"
      purpose="Edit existing CMS banners, their images, targeting, and publishing state."
      preserved={[
        "Dynamic banner ID route behavior is preserved.",
        "The route remains in authenticated Content Management.",
        "Legacy Nuxt edit links redirect to this React route.",
      ]}
      pending={[
        "Load banner details by ID and populate the edit form.",
        "Port update/delete API behavior, Firebase upload support, and validation feedback.",
      ]}
    />
  );
}
