import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import JackpotCampaignsClient from "./components/JackpotCampaignsClient";

export default function JackpotsPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Jackpots" />
      <JackpotCampaignsClient />
    </div>
  );
}
