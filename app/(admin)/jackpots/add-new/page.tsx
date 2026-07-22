import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import JackpotCampaignEditorClient from "../components/JackpotCampaignEditorClient";

export default function AddJackpotPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add New Jackpot" />
      <JackpotCampaignEditorClient mode="add" />
    </div>
  );
}
