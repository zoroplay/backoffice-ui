import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default async function EditSureOddPage({
  params,
}: {
  params: Promise<{ sureOddId: string }>;
}) {
  const { sureOddId } = await params;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle={`Edit Sure Odd ${sureOddId}`} />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-semibold uppercase text-brand-500">
          Nuxt route: /ContentManagement/SureOdds/:EditSureOdd
        </p>
        <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
          Edit Sure Odd {sureOddId}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
          Update Sure Odds content, pricing, selections, and publishing state. The
          route parameter is preserved so existing Nuxt deep links can target the
          matching React editor.
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Status", "Published"],
            ["Selections", "8"],
            ["Payments", "23"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-gray-50 p-4 dark:bg-white/[0.03]">
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input
            className="h-10 rounded-lg border border-gray-200 px-3 text-sm dark:border-gray-800 dark:bg-gray-950"
            defaultValue="Weekend accumulator"
          />
          <input
            className="h-10 rounded-lg border border-gray-200 px-3 text-sm dark:border-gray-800 dark:bg-gray-950"
            defaultValue="₦1,000"
          />
        </div>
        <button className="mt-5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
          Update Sure Odd
        </button>
      </section>
    </div>
  );
}
