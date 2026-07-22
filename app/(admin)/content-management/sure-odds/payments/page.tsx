import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { sureOddPayments } from "../../components/contentManagementData";

export default function SureOddsPaymentsPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Sure Odds Payments" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Sure Odds Payments</h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          Review Sure Odds buyers, phone numbers, payment treatment status, pagination, and the mark-treated action preserved from Nuxt.
        </p>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">List</h2>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {["Name", "Phone", "Sure Odd", "Status", "Action"].map((head) => (
                  <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {sureOddPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{payment.paidBy}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{payment.phoneNumber}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{payment.sureOddTitle}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{payment.status === 0 ? "Not Treated" : "Treated"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {payment.status === 0 ? (
                      <button type="button" className="rounded-md bg-success-500 px-3 py-1.5 text-xs font-medium text-white">Mark Treated</button>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">-</span>
                    )}
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
