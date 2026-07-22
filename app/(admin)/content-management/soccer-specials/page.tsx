import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const specials = [
  ["Derby Specials", "Soccer", "Active"],
  ["Weekend Banker", "Soccer", "Draft"],
  ["Goals Market Boost", "Soccer", "Active"],
];

export default function SoccerSpecialsPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Soccer Specials" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-brand-500">
              Nuxt route: /ContentManagement/SoccerSpecials
            </p>
            <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
              Soccer Specials
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
              Manage curated soccer specials, category assignments, and promoted
              betting content.
            </p>
          </div>
          <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
            Add Special
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          {specials.map(([name, sport, status]) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800"
            >
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{sport}</p>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">{status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
