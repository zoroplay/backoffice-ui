import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function CampaignTriggersPage() {
  return (
    <NuxtParityPage
      title="Campaign Triggers"
      nuxtRoute="/PlayerManagement/CampaignTriggers"
      reactRoute="/player-management/campaign-triggers"
      purpose="Manage CRM campaign trigger rules tied to player segments, preserving the Nuxt player-management workflow."
      preserved={[
        "The page is protected by the admin auth guard.",
        "The route remains in Player Management.",
        "Legacy Nuxt links redirect to this React page.",
      ]}
      pending={[
        "Port campaign trigger list, create, edit, and delete API calls.",
        "Restore segment and bonus selectors used by the Nuxt workflow.",
      ]}
    />
  );
}
