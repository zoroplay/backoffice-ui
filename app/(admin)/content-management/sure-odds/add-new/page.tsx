import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function AddSureOddPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Add Sure Odd" />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-semibold uppercase text-brand-500">
          Nuxt route: /ContentManagement/SureOdds/AddNew
        </p>
        <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
          Create Sure Odd
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
          Build a paid Sure Odds ticket with title, pricing, selections, market
          notes, and publishing state. The form layout is React-native but keeps the
          same content creation purpose as the Nuxt page.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Ticket Details
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {["Title", "Price", "Sport", "Tournament", "Publish Date", "Status"].map(
              (label) => (
                <label key={label} className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                  <input
                    className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand-400 dark:border-gray-800 dark:bg-gray-950"
                    placeholder={label}
                  />
                </label>
              )
            )}
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </span>
            <textarea
              className="mt-1 min-h-28 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-gray-800 dark:bg-gray-950"
              placeholder="Public description or operator note"
            />
          </label>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Migration Status
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li>Route parity and guarded page shell are implemented.</li>
            <li>Sport/tournament/fixture API selectors still need wiring.</li>
            <li>Create mutation and validation feedback still need wiring.</li>
          </ul>
          <button className="mt-5 w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
            Save Draft
          </button>
        </div>
      </section>
    </div>
  );
}
