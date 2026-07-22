import { notFound } from "next/navigation";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { userRoles, userStatuses, usersSeed } from "../../users/data";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = usersSeed.find((item) => item.id === userId || item.email === userId);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle={`Edit User: ${user.name}`} />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit User</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Update admin user profile details, role, permissions, location, and status. This preserves the Nuxt dynamic edit-user route.
        </p>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input defaultValue={user.name} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input defaultValue={user.email} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input defaultValue={user.phone} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <select defaultValue={user.role} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              {userRoles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
            <select defaultValue={user.status} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              {userStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
            <input defaultValue={user.location} className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 dark:border-red-500/30 dark:text-red-300">Suspend</button>
            <button type="button" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Save Changes</button>
          </div>
        </form>
      </section>
    </div>
  );
}
