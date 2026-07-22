import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function AddJackpotPage() {
  return (
    <NuxtParityPage
      title="Create Jackpot"
      nuxtRoute="/ContentManagement/Jackpots/AddNew"
      reactRoute="/jackpots/add-new"
      purpose="Create jackpot campaigns with prize, schedule, game, and publishing settings."
      preserved={[
        "Authenticated admin access is preserved.",
        "The route keeps the Nuxt create-jackpot purpose.",
        "Legacy Nuxt links redirect to this page.",
      ]}
      pending={[
        "Port jackpot creation form fields and validation.",
        "Submit through the jackpot create endpoint and restore notifications.",
      ]}
    />
  );
}
