import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import JackpotCampaignEditorClient from "../components/JackpotCampaignEditorClient";
import { jackpotCampaigns } from "../components/jackpotData";

export default async function EditJackpotPage({
  params,
}: {
  params: Promise<{ jackpotId: string }>;
}) {
  const { jackpotId } = await params;
  const jackpot = jackpotCampaigns.find((item) => item.id === jackpotId);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle={`Edit Jackpot${jackpot ? `: ${jackpot.title}` : ""}`} />
      <JackpotCampaignEditorClient mode="edit" jackpotId={jackpotId} />
    </div>
  );
}
