import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function NetworkTransferPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Fund Transfer" />
      <section className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Fund Transfer
        </h1>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          card
        </p>
      </section>
    </div>
  );
}
