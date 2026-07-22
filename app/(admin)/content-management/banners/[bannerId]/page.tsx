import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import BannerEditorClient from "../../components/BannerEditorClient";
import { bannerItems } from "../data";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ bannerId: string }>;
}) {
  const { bannerId } = await params;
  const banner = bannerItems.find((item) => item.id === bannerId);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Edit Banner" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Banner</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          Update the banner for route parameter <span className="font-mono">{bannerId}</span>. Unknown migrated IDs still render the editor instead of becoming dead links.
        </p>
      </section>
      <BannerEditorClient
        mode="edit"
        initialValue={
          banner
            ? {
                id: banner.id,
                title: banner.title,
                bannerType: banner.type === "Registration" ? "registration" : "sport",
                target: banner.target === "Mobile" ? "mobile" : "web",
                position: banner.position === "Popup" ? "popup" : "slider",
                link: banner.link,
                image: banner.imageUrl,
              }
            : { id: bannerId }
        }
      />
    </div>
  );
}
