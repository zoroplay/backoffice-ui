import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function CutXPage() {
  return (
    <NuxtParityPage
      title="CUT (X)"
      nuxtRoute="/Bonuses/CutX"
      reactRoute="/bonus-management/cut-x"
      purpose="Configure and review CUT (X) bonus behavior preserved from the Nuxt bonus management module."
      preserved={[
        "The page is available under authenticated Bonus Management.",
        "The route keeps the Nuxt CUT (X) settings purpose.",
        "Legacy Nuxt links redirect to this React page.",
      ]}
      pending={[
        "Port CUT (X) form fields, validations, and save endpoint.",
        "Restore permission-gated access with the Nuxt 'Cut X settings' permission.",
      ]}
    />
  );
}
