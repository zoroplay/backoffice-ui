import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const payments = [
  ["TX-7001", "adaora", "Weekend accumulator", "₦1,000", "Paid"],
  ["TX-7002", "retail.shop.12", "Champions league banker", "₦500", "Pending"],
  ["TX-7003", "musa88", "Weekend accumulator", "₦1,000", "Paid"],
];

export default function SureOddsPaymentsPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Sure Odds Payments" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-semibold uppercase text-brand-500">
          Nuxt route: /ContentManagement/SureOdds/Payments
        </p>
        <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
          Payments
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Review Sure Odds purchases, pending payments, and payer details.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {payments.map(([ref, user, product, amount, status]) => (
                <tr key={ref} className="text-gray-700 dark:text-gray-300">
                  <td className="py-3 pr-4 font-mono">{ref}</td>
                  <td className="py-3 pr-4">{user}</td>
                  <td className="py-3 pr-4">{product}</td>
                  <td className="py-3 pr-4">{amount}</td>
                  <td className="py-3">{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
