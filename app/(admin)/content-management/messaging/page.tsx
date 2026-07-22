import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import ContentMessagingClient from "../components/ContentMessagingClient";

export default function ContentMessagingPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Messaging" />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Messaging</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
          Manage CMS messages and SMS gateway settings from the two-tab content-management workflow.
        </p>
      </section>
      <ContentMessagingClient />
    </div>
  );
}
