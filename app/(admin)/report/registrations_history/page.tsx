import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function RegistrationsHistoryPage() {
  return (
    <NuxtParityPage
      title="Registrations History"
      nuxtRoute="/ReportingAndBI/RegistrationsHistory"
      reactRoute="/report/registrations_history"
      purpose="Track player registration activity and acquisition trends across date ranges, preserving the original Nuxt reporting page purpose."
      preserved={[
        "Admin route guard is inherited from the React admin layout.",
        "The page remains grouped under Reporting & BI.",
        "The legacy Nuxt route redirects to this React route.",
      ]}
      pending={[
        "Port the Nuxt registration report API query and filters.",
        "Render registration rows, totals, and pagination from backend data.",
      ]}
    />
  );
}
