import PageBreadcrumb from "@/components/common/PageBreadCrumb";

type NuxtParityPageProps = {
  title: string;
  nuxtRoute: string;
  reactRoute: string;
  purpose: string;
  preserved: string[];
  pending: string[];
};

export default function NuxtParityPage({
  title,
  nuxtRoute,
  reactRoute,
  purpose,
  preserved,
  pending,
}: NuxtParityPageProps) {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle={title} />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 dark:border-gray-800 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-brand-500">
              Nuxt parity route
            </p>
            <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
              {purpose}
            </p>
          </div>
          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
            <div>
              Nuxt: <span className="font-mono">{nuxtRoute}</span>
            </div>
            <div className="mt-1">
              React: <span className="font-mono">{reactRoute}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 pt-4 lg:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Preserved Page Behavior
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {preserved.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-success-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Remaining Migration Work
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {pending.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-warning-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
