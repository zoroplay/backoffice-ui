"use client";

import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { withAuth } from "@/utils/withAuth";

type SmsGateway = {
  id: string;
  displayName: string;
  gatewayName: string;
  senderId: string;
  apiKey: string;
  username: string;
  password: string;
  status: boolean;
};

const initialGateways: SmsGateway[] = [
  {
    id: "1",
    displayName: "Primary Transactional",
    gatewayName: "Termii",
    senderId: "SportBet",
    apiKey: "TERM-6a91d2c3fcab",
    username: "ops@sportbet",
    password: "secret-password",
    status: true,
  },
  {
    id: "2",
    displayName: "Marketing Backup",
    gatewayName: "Africa's Talking",
    senderId: "Promo",
    apiKey: "ATK-9e47ab115002",
    username: "marketing@sportbet",
    password: "marketing-password",
    status: false,
  },
];

const blankGateway: SmsGateway = {
  id: "",
  displayName: "",
  gatewayName: "",
  senderId: "",
  apiKey: "",
  username: "",
  password: "",
  status: true,
};

function maskApiKey(key: string) {
  if (!key || key.length < 8) return "********";
  return `${key.slice(0, 4)}********${key.slice(-4)}`;
}

function SmsSettingsPage() {
  const [gateways, setGateways] = useState(initialGateways);
  const [editingGateway, setEditingGateway] = useState<SmsGateway | null>(null);
  const [form, setForm] = useState<SmsGateway>(blankGateway);

  function startEdit(gateway: SmsGateway) {
    setEditingGateway(gateway);
    setForm(gateway);
  }

  function resetForm() {
    setEditingGateway(null);
    setForm(blankGateway);
  }

  function saveGateway() {
    if (!form.displayName || !form.gatewayName || !form.senderId) return;

    if (editingGateway) {
      setGateways((current) =>
        current.map((gateway) =>
          gateway.id === editingGateway.id ? { ...form, id: editingGateway.id } : gateway,
        ),
      );
    } else {
      setGateways((current) => [
        ...current,
        { ...form, id: String(current.length + 1) },
      ]);
    }

    resetForm();
  }

  function deleteGateway(id: string) {
    if (window.confirm("Are you sure? You won't be able to revert this!")) {
      setGateways((current) => current.filter((gateway) => gateway.id !== id));
    }
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="SMS Gateway Settings" />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">SMS Gateway Settings</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              Manage SMS gateway credentials, sender IDs, enabled status, edit/delete actions, and the add-new gateway form preserved from Nuxt.
            </p>
          </div>
          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
            <div>List: <span className="font-mono">getSMSGateways()</span></div>
            <div className="mt-1">Events: <span className="font-mono">saved_sms_gateway</span>, <span className="font-mono">updated_sms_gateway</span></div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Configured Gateways</h2>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {["ID", "Display Name", "Gateway Name", "Sender ID", "API Key", "Username", "Password", "Status", "Actions"].map((head) => (
                  <th key={head} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {gateways.map((gateway) => (
                <tr key={gateway.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{gateway.id}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-white">{gateway.displayName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{gateway.gatewayName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{gateway.senderId}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">{maskApiKey(gateway.apiKey)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{gateway.username}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">********</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      gateway.status
                        ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300"
                        : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                    }`}>
                      {gateway.status ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(gateway)}
                        className="rounded-md border border-brand-200 p-2 text-brand-600 hover:bg-brand-50 dark:border-brand-500/30 dark:text-brand-300 dark:hover:bg-brand-500/10"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteGateway(gateway.id)}
                        className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {editingGateway ? "Edit SMS Gateway" : "Add New SMS Gateway"}
          </h2>
        </div>
        <form className="space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["Display Name", "displayName"],
              ["Gateway Name", "gatewayName"],
              ["Sender ID", "senderId"],
              ["API Key", "apiKey"],
              ["Username", "username"],
              ["Password", "password"],
            ].map(([label, key]) => (
              <label key={key} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
                <input
                  type={key === "password" ? "password" : "text"}
                  value={String(form[key as keyof SmsGateway])}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
              </label>
            ))}
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
              <select
                value={form.status ? "enabled" : "disabled"}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value === "enabled" }))}
                className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            {editingGateway ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                Close
              </button>
            ) : null}
            <button
              type="button"
              onClick={saveGateway}
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              {editingGateway ? "Update Gateway" : "Save Gateway"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default withAuth(SmsSettingsPage);
