import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function JackpotManagementPage() {
  return (
    <NuxtParityPage
      title="Jackpot Management"
      nuxtRoute="/ContentManagement/JackpotManagement"
      reactRoute="/content-management/jackpot-management"
      purpose="Preserve the Nuxt jackpot management route used for operational jackpot administration."
      preserved={[
        "Authenticated Content Management access is preserved.",
        "The page remains a jackpot administration entry point.",
        "Legacy Nuxt URLs redirect here.",
      ]}
      pending={[
        "Map the Nuxt jackpot management widgets and API calls.",
        "Restore management actions once the business workflow is fully ported.",
      ]}
    />
  );
}
