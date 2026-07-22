import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;

  return (
    <NuxtParityPage
      title={`Edit Page: ${pageId}`}
      nuxtRoute="/ContentManagement/Pages/:EditPage"
      reactRoute="/content-management/pages/:pageId"
      purpose="Edit CMS page content and publishing details, preserving the Nuxt dynamic page editing route."
      preserved={[
        "Dynamic page ID route behavior is preserved.",
        "The page is available only inside the authenticated admin shell.",
        "Legacy Nuxt edit links redirect to this React route.",
      ]}
      pending={[
        "Load the CMS page by ID and populate the edit form.",
        "Port update/delete behavior, editor support, validation, and notifications.",
      ]}
    />
  );
}
