import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const sureOdds = [
  {
    id: "SO-1024",
    title: "Weekend accumulator",
    selections: 8,
    price: "₦1,000",
    status: "Published",
  },
  {
    id: "SO-1025",
    title: "Champions league banker",
    selections: 5,
    price: "₦500",
    status: "Draft",
  },
];

export default function SureOddsPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Sure Odds" />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-brand-500">
              Nuxt route: /ContentManagement/SureOdds
            </p>
            <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
              Sure Odds
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
              Maintain paid betting tips, selections, publishing status, and payment
              review links. This route preserves the Nuxt list page while using the
              React content-management shell.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/content-management/sure-odds/payments"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Payments
            </Link>
            <Link
              href="/content-management/sure-odds/add-new"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Add Sure Odd
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500">
                <th className="py-3 pr-4">Code</th>
                <th className="py-3 pr-4">Title</th>
                <th className="py-3 pr-4">Selections</th>
                <th className="py-3 pr-4">Price</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {sureOdds.map((item) => (
                <tr key={item.id} className="text-gray-700 dark:text-gray-300">
                  <td className="py-3 pr-4 font-mono">{item.id}</td>
                  <td className="py-3 pr-4 font-medium">{item.title}</td>
                  <td className="py-3 pr-4">{item.selections}</td>
                  <td className="py-3 pr-4">{item.price}</td>
                  <td className="py-3 pr-4">{item.status}</td>
                  <td className="py-3">
                    <Link
                      href={`/content-management/sure-odds/${item.id}`}
                      className="text-brand-600 hover:text-brand-700"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
