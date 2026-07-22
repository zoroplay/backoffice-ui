import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { userRoles, userStatuses } from "../users/data";

export default function AddUserPage() {
  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add New User" />
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add New User</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Create an admin user with account details, role assignment, contact information, location, and activation status.
        </p>
      </section>
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <form className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input placeholder="Username" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input placeholder="Full name" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input placeholder="Email" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <input placeholder="Phone" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
            <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              {userRoles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
            <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              {userStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
            <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              <option>Nigeria</option>
              <option>Ghana</option>
              <option>Kenya</option>
            </select>
            <select className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              <option>Lagos</option>
              <option>Abuja</option>
              <option>Rivers</option>
            </select>
            <input placeholder="Password" type="password" className="h-10 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900" />
          </div>
          <div className="flex justify-end">
            <button type="button" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Create User</button>
          </div>
        </form>
      </section>
    </div>
  );
}
