"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Edit, Lock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { Agency } from "@/app/(admin)/network/agency-list/columns";
import {
  asRecord,
  clientId,
  money,
  rowValue,
  type AnyRecord,
} from "@/app/(admin)/tickets/components/ticketApiHelpers";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";

type RoleOption = {
  id: string;
  name: string;
};

type AgentUser = {
  id: string;
  username: string;
  name: string;
  role: string;
  balance: number;
  email: string;
  phoneNumber: string;
  address: string;
  raw: AnyRecord;
};

interface UsersTabProps {
  agentId: string;
  agent: Agency;
}

function mapUser(value: unknown, index: number): AgentUser {
  const user = asRecord(value);

  return {
    id: String(rowValue(user, ["id", "userId"], `agent-user-${index}`)),
    username: String(rowValue(user, ["username"])),
    name: String(
      rowValue(
        user,
        ["name"],
        `${rowValue(user, ["firstName", "first_name"], "")} ${rowValue(user, ["lastName", "last_name"], "")}`.trim()
      )
    ),
    role: String(rowValue(user, ["rolename", "role", "role_name"])),
    balance: Number(user.balance ?? 0),
    email: String(rowValue(user, ["email"])),
    phoneNumber: String(rowValue(user, ["phone_number", "phoneNumber"])),
    address: String(rowValue(user, ["address"])),
    raw: user,
  };
}

function mapRole(value: unknown, index: number): RoleOption {
  const role = asRecord(value);
  return {
    id: String(rowValue(role, ["id"], `role-${index}`)),
    name: String(rowValue(role, ["name"])),
  };
}

export default function UsersTab({ agentId }: UsersTabProps) {
  const [users, setUsers] = useState<AgentUser[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadUsers(page = 1, roleId = userType) {
    setLoading(true);
    const response = await GETREQUEST<any>(
      `/admin/retail/${clientId()}/agent-users?agentId=${agentId}&page=${page}&user_type=${roleId}`
    );
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    const data = body.data;
    const list = Array.isArray(data)
      ? data
      : Array.isArray(asRecord(data).data)
        ? asRecord(data).data
        : [];
    setUsers(list.map(mapUser));
  }

  async function loadRoles() {
    const response = await GETREQUEST<any>("/api/admin/settings/user-roles");
    if (!response.ok) return;

    const body = response.data;
    const list = Array.isArray(body)
      ? body
      : Array.isArray(asRecord(body).data)
        ? asRecord(body).data
        : [];
    setRoles(list.map(mapRole));
  }

  async function removeUser(userId: string) {
    if (!window.confirm("Are you sure?")) return;

    setUpdatingId(userId);
    const response = await POSTREQUEST<any>(`/admin/retail/add-remove-user/${clientId()}`, {
      agentId,
      userId,
      type: "remove",
    });
    setUpdatingId(null);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured");
      return;
    }

    toast.success(body.message || "User has been deleted");
    setUsers((current) => current.filter((user) => user.id !== userId));
  }

  useEffect(() => {
    void loadRoles();
    void loadUsers(1, "");
  }, [agentId]);

  return (
    <div className="space-y-6">
      <form
        className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950 sm:flex-row sm:items-center sm:justify-between"
        onSubmit={(event) => {
          event.preventDefault();
          void loadUsers(1);
        }}
      >
        <select
          value={userType}
          onChange={(event) => setUserType(event.target.value)}
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:max-w-xs"
        >
          <option value="">All</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={loading}
            className="h-10 rounded-md bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={() => toast.info("Agent user form parity is pending")}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700"
          >
            <Plus size={16} />
            Add New User
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Agent Users List
          </h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {["Username", "Name", "Role", "Availability", "Email", "Phone Number", "Address", ""].map((head) => (
                <th key={head || "actions"} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-600 dark:text-brand-300">
                  <Link href={`/player-management/player-info/${user.id}`}>{user.username}</Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{user.name}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{user.role}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{money(user.balance)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{user.email}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{user.phoneNumber}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{user.address}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/network/agent/user/${user.id}?agentId=${agentId}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-info-500 text-white hover:bg-info-600"
                      title="Edit user"
                    >
                      <Edit size={15} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => toast.info("Password modal parity is pending")}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-amber-500 text-white hover:bg-amber-600"
                      title="Change password"
                    >
                      <Lock size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === user.id}
                      onClick={() => void removeUser(user.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      title="Delete user"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!users.length ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {loading ? "Loading users" : "No record found"}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
