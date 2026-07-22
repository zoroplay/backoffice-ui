import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function JackpotsListPage() {
  return (
    <NuxtParityPage
      title="Jackpots"
      nuxtRoute="/ContentManagement/Jackpots/List"
      reactRoute="/jackpots"
      purpose="List and manage jackpot campaigns, preserving the Nuxt Content Management jackpot list route."
      preserved={[
        "The route is protected by admin authentication.",
        "The page remains part of jackpot management.",
        "Legacy Nuxt links redirect to this React route.",
      ]}
      pending={[
        "Port jackpot list fetching, delete actions, and status display.",
        "Link create/edit/detail actions to React jackpot routes.",
      ]}
    />
  );
}
