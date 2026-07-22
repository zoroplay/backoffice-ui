import NuxtParityPage from "@/components/migration/NuxtParityPage";

export default function LoginsHistoryPage() {
  return (
    <NuxtParityPage
      title="Logins History"
      nuxtRoute="/ReportingAndBI/LoginsHistory"
      reactRoute="/report/logins_history"
      purpose="Inspect account login activity for security, support, and operational audit workflows."
      preserved={[
        "Admin guard behavior is preserved.",
        "The report remains accessible under Reporting & BI.",
        "Legacy Nuxt URL access is preserved through redirect.",
      ]}
      pending={[
        "Wire the login history endpoint and date/user filters.",
        "Render audit rows with user, IP/device, timestamp, and pagination.",
      ]}
    />
  );
}
