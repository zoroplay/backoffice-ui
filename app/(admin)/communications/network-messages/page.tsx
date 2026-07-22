"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { withAuth } from "@/utils/withAuth";

function NetworkMessagesPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Network Messages" />
      <section className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Network Messages</h1>
        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          Status: <span className="text-red-500 dark:text-red-300">Not active</span>
        </p>
      </section>
    </div>
  );
}

export default withAuth(NetworkMessagesPage);
