import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import ContentPageEditorClient from "../../components/ContentPageEditorClient";
import { contentPages } from "../data";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const page = contentPages.find((item) => item.id === pageId);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Edit Page" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Page</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          Update the CMS page for route parameter <span className="font-mono">{pageId}</span>. Unknown migrated IDs still render the editor so legacy deep links remain usable.
        </p>
      </section>
      <ContentPageEditorClient
        mode="edit"
        initialValue={
          page
            ? {
                id: page.id,
                title: page.title,
                slug: page.title.trim().toLowerCase().replace(/\s+/g, "_"),
                content: page.content,
                target: page.target === "Mobile" ? "mobile" : "web",
                createdBy: page.createdBy,
              }
            : { id: pageId }
        }
      />
    </div>
  );
}
