import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import SureOddsEditorClient from "../../components/SureOddsEditorClient";
import { sureOdds } from "../../components/contentManagementData";

export default async function EditSureOddPage({
  params,
}: {
  params: Promise<{ sureOddId: string }>;
}) {
  const { sureOddId } = await params;
  const sureOdd = sureOdds.find((item) => item.id === sureOddId);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Edit Sure Odd" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Sure Odd</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          Update the Sure Odds record for route parameter <span className="font-mono">{sureOddId}</span>. Unknown IDs still render the editor to preserve migrated deep-link behavior.
        </p>
      </section>
      <SureOddsEditorClient
        mode="edit"
        initialValue={sureOdd ?? { id: sureOddId, title: "", amount: 0, description: "", imagePath: "" }}
      />
    </div>
  );
}
