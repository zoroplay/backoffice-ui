import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function HotMatchesPage() {
  return (
    <NuxtParityPage
      title="Hot Matches"
      nuxtRoute="/Tickets/HotMatches"
      reactRoute="/tickets/hot-matches"
      purpose="Preserve the prediction setup/hot matches route used by operators to review highlighted betting events."
      preserved={[
        "Admin guard behavior is inherited from the layout.",
        "The route remains grouped with ticket and trading workflows.",
        "Legacy Nuxt URL access is preserved through redirect.",
      ]}
      pending={[
        "Port hot match listing and action endpoints.",
        "Render match selection, status, and update controls.",
      ]}
    />
  );
}
