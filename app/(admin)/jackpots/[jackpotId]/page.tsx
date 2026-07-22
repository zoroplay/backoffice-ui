import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default async function EditJackpotPage({
  params,
}: {
  params: Promise<{ jackpotId: string }>;
}) {
  const { jackpotId } = await params;

  return (
    <NuxtParityPage
      title={`Edit Jackpot: ${jackpotId}`}
      nuxtRoute="/ContentManagement/Jackpots/:Edit"
      reactRoute="/jackpots/:jackpotId"
      purpose="Edit jackpot campaign configuration and lifecycle state."
      preserved={[
        "Dynamic jackpot ID route behavior is preserved.",
        "The route is protected by the admin shell.",
        "Legacy Nuxt edit links redirect to this React route.",
      ]}
      pending={[
        "Load jackpot details by ID and populate the edit form.",
        "Port update/delete behavior and validation feedback.",
      ]}
    />
  );
}
