import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import PromotionEditorClient from "../components/PromotionEditorClient";
import { promotionsSeed } from "../data";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ promotionId: string }>;
}) {
  const { promotionId } = await params;
  const promotion = promotionsSeed.find((item) => item.id === promotionId);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Update Promotion" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Update Promotion</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          Edit the promotion resolved from the dynamic route parameter. Unknown migrated IDs still render the update form so legacy deep links do not become dead routes.
        </p>
      </section>
      <PromotionEditorClient
        mode="edit"
        promotionId={promotionId}
        initialValues={
          promotion
            ? {
                title: promotion.title,
                description: promotion.description,
                image: promotion.image,
                type: promotion.type,
                platform: promotion.platform,
                startDate: promotion.startDate,
                endDate: promotion.endDate,
                targetUrl: promotion.targetUrl,
                status: promotion.status,
              }
            : { targetUrl: "", type: "sport_web" }
        }
      />
    </div>
  );
}
