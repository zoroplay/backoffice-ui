import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const messageRows = [
  {
    name: "Inbox welcome",
    audience: "New players",
    channel: "Inbox",
    status: "Active",
    updated: "Today",
  },
  {
    name: "Retail agent notice",
    audience: "Network users",
    channel: "Network",
    status: "Draft",
    updated: "Yesterday",
  },
  {
    name: "SMS delivery template",
    audience: "All players",
    channel: "SMS",
    status: "Active",
    updated: "Jul 15",
  },
];

export default function ContentMessagingPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Messaging" />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-brand-500">
              Content Management
            </p>
            <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
              Messaging
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
              Manage the same CMS messaging workflow from
              <span className="font-mono"> /ContentManagement/Messaging</span>:
              player inbox messages, network messages, mass inbox content, and SMS
              settings from a single content entry point.
            </p>
          </div>
          <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
            New Message
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Player Messages", "Inbox campaigns and service notices"],
            ["Network Messages", "Agent and retail communications"],
            ["Mass Inbox", "Bulk player inbox delivery"],
            ["SMS Settings", "Gateway and delivery configuration"],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
            >
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Recent Messaging Content
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            API wiring pending
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Audience</th>
                <th className="py-3 pr-4">Channel</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {messageRows.map((row) => (
                <tr key={row.name} className="text-gray-700 dark:text-gray-300">
                  <td className="py-3 pr-4 font-medium">{row.name}</td>
                  <td className="py-3 pr-4">{row.audience}</td>
                  <td className="py-3 pr-4">{row.channel}</td>
                  <td className="py-3 pr-4">{row.status}</td>
                  <td className="py-3">{row.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
