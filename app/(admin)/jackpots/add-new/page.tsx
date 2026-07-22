import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function AddJackpotPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add New Jackpot" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Jackpot</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Create a jackpot campaign with title, amount, minimum stake, game count, agent commission, terms, fixtures, and consolation bonuses.
        </p>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input placeholder="Title" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input placeholder="Amount" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input placeholder="Minimum stake" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input placeholder="Number of games" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input placeholder="Agent commission %" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input placeholder="Fixture ID lookup" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          </div>
          <textarea placeholder="Terms" className="min-h-32 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
          <div className="flex justify-end">
            <button type="button" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">Save Jackpot</button>
          </div>
        </form>
      </section>
    </div>
  );
}
