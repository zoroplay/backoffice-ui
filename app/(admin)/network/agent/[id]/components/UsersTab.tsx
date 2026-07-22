"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Edit, Lock, Plus, Search, Trash2 } from "lucide-react";
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

type StateOption = {
  id: string;
  name: string;
};

type ExistingUserOption = {
  id: string;
  username: string;
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

type AddUserFormState = {
  isExisting: boolean;
  country: string;
  state: string;
  language: string;
  currency: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phoneNumber: string;
  username: string;
  password: string;
  passwordConfirmation: string;
  email: string;
  confirmEmail: string;
  balance: string;
  max_payout: string;
  roleId: string;
  parentId: string;
  existingUserId: string;
  existingUserQuery: string;
};

interface UsersTabProps {
  agentId: string;
  agent: Agency;
}

function emptyAddUserForm(parentId: string): AddUserFormState {
  return {
    isExisting: false,
    country: "Nigeria",
    state: "",
    language: "EN",
    currency: "NGN",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "Male",
    address: "",
    phoneNumber: "",
    username: "",
    password: "",
    passwordConfirmation: "",
    email: "",
    confirmEmail: "",
    balance: "",
    max_payout: "",
    roleId: "",
    parentId,
    existingUserId: "",
    existingUserQuery: "",
  };
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

function mapState(value: unknown, index: number): StateOption {
  const state = asRecord(value);
  return {
    id: String(rowValue(state, ["id"], `state-${index}`)),
    name: String(rowValue(state, ["name"])),
  };
}

function mapExistingUser(value: unknown, index: number): ExistingUserOption {
  const user = asRecord(value);
  return {
    id: String(rowValue(user, ["value", "id", "userId"], `user-${index}`)),
    username: String(rowValue(user, ["username", "label", "name"], "")),
  };
}

function recordsFrom(data: unknown): AnyRecord[] {
  if (Array.isArray(data)) return data.map(asRecord);
  const body = asRecord(data);
  if (Array.isArray(body.data)) return body.data.map(asRecord);
  if (Array.isArray(body.items)) return body.items.map(asRecord);
  return [];
}

export default function UsersTab({ agentId }: UsersTabProps) {
  const [users, setUsers] = useState<AgentUser[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addForm, setAddForm] = useState<AddUserFormState>(() => emptyAddUserForm(agentId));
  const [submittingUser, setSubmittingUser] = useState(false);
  const [searchingExistingUser, setSearchingExistingUser] = useState(false);
  const [existingUserResults, setExistingUserResults] = useState<ExistingUserOption[]>([]);

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

  async function loadStates() {
    const response = await GETREQUEST<any>("/admin/utilities/get-country-states");
    if (!response.ok) return;

    const list = recordsFrom(asRecord(response.data).states ?? response.data);
    setStates(list.map(mapState));
  }

  async function searchExistingUsers() {
    const query = addForm.existingUserQuery.trim();
    if (!query) {
      toast.error("Enter a username to search");
      return;
    }

    setSearchingExistingUser(true);
    const response = await GETREQUEST<any>(
      `/admin/players/get-select-dropdown?username=${encodeURIComponent(query)}&clientId=${clientId()}`
    );
    setSearchingExistingUser(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "Unable to search users");
      return;
    }

    setExistingUserResults(recordsFrom(response.data).map(mapExistingUser));
  }

  function updateAddForm<Key extends keyof AddUserFormState>(key: Key, value: AddUserFormState[Key]) {
    setAddForm((current) => ({ ...current, [key]: value }));
  }

  function selectExistingUser(user: ExistingUserOption) {
    setAddForm((current) => ({
      ...current,
      existingUserId: user.id,
      existingUserQuery: user.username,
      username: user.username,
    }));
    setExistingUserResults([]);
  }

  function validateNewUser() {
    if (!addForm.username.trim()) return "Username is required";
    if (!addForm.password.trim()) return "Password is required";
    if (addForm.password !== addForm.passwordConfirmation) return "Password confirmation must match password";
    if (addForm.email || addForm.confirmEmail) {
      if (addForm.email !== addForm.confirmEmail) return "Email confirmation must match email";
    }
    return "";
  }

  async function submitAddUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const existingUserId = addForm.existingUserId || addForm.existingUserQuery.trim();
    if (addForm.isExisting && !existingUserId) {
      toast.error("Select an existing user");
      return;
    }

    const validationError = addForm.isExisting ? "" : validateNewUser();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmittingUser(true);
    const response = addForm.isExisting
      ? await POSTREQUEST<any>(`/admin/retail/add-remove-user/${clientId()}`, {
          agentId: addForm.parentId,
          userId: existingUserId,
          type: "add",
        })
      : await POSTREQUEST<any>(`/admin/retail/${clientId()}/create-user`, {
          country: addForm.country,
          state: addForm.state,
          language: addForm.language,
          currency: addForm.currency,
          firstName: addForm.firstName,
          lastName: addForm.lastName,
          dateOfBirth: addForm.dateOfBirth,
          gender: addForm.gender,
          address: addForm.address,
          phoneNumber: addForm.phoneNumber,
          username: addForm.username,
          password: addForm.password,
          email: addForm.email,
          balance: addForm.balance,
          max_payout: addForm.max_payout,
          roleId: addForm.roleId,
          parentId: addForm.parentId,
          is_exist: false,
        });
    setSubmittingUser(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "Something went wrong. Unable to create new shop!");
      return;
    }

    toast.success(body.message || "User added");
    setAddForm(emptyAddUserForm(agentId));
    setExistingUserResults([]);
    setShowAddUser(false);
    await loadUsers(1, "");
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
    void loadStates();
    void loadUsers(1, "");
    setAddForm(emptyAddUserForm(agentId));
  }, [agentId]);

  if (showAddUser) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Add User</h3>
        </div>
        <form onSubmit={submitAddUser} className="space-y-6 p-5">
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4">
              {!addForm.isExisting ? (
                <>
                  <SelectField label="Country" value={addForm.country} onChange={(value) => updateAddForm("country", value)}>
                    <option value="Nigeria">Nigeria</option>
                  </SelectField>
                  <SelectField label="State" value={addForm.state} onChange={(value) => updateAddForm("state", value)}>
                    <option value="">Select state</option>
                    {states.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}
                  </SelectField>
                </>
              ) : null}

              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={addForm.isExisting}
                  onChange={(event) => {
                    updateAddForm("isExisting", event.target.checked);
                    setExistingUserResults([]);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500"
                />
                Are you moving an existing user?
              </label>

              {addForm.isExisting ? (
                <div className="space-y-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Username</span>
                    <div className="flex gap-2">
                      <input
                        value={addForm.existingUserQuery}
                        onChange={(event) => {
                          updateAddForm("existingUserQuery", event.target.value);
                          updateAddForm("existingUserId", "");
                        }}
                        className="h-10 min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        disabled={searchingExistingUser}
                        onClick={() => void searchExistingUsers()}
                        className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-500 px-3 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
                      >
                        <Search size={15} />
                        {searchingExistingUser ? "Searching" : "Search"}
                      </button>
                    </div>
                  </label>
                  {existingUserResults.length ? (
                    <div className="rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                      {existingUserResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => selectExistingUser(user)}
                          className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          {user.username} <span className="text-gray-400">#{user.id}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <TextField label="Username" value={addForm.username} onChange={(value) => updateAddForm("username", value)} required />
                  <TextField label="Name" value={addForm.firstName} onChange={(value) => updateAddForm("firstName", value)} />
                  <TextField label="Surname" value={addForm.lastName} onChange={(value) => updateAddForm("lastName", value)} />
                  <TextField label="Date of Birth" type="date" value={addForm.dateOfBirth} onChange={(value) => updateAddForm("dateOfBirth", value)} />
                  <SelectField label="Gender" value={addForm.gender} onChange={(value) => updateAddForm("gender", value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </SelectField>
                  <TextField label="Address" value={addForm.address} onChange={(value) => updateAddForm("address", value)} />
                  <TextField label="Phone Number" value={addForm.phoneNumber} onChange={(value) => updateAddForm("phoneNumber", value)} />
                </>
              )}
            </div>

            {!addForm.isExisting ? (
              <div className="space-y-4">
                <SelectField label="Language" value={addForm.language} onChange={(value) => updateAddForm("language", value)}>
                  <option value="EN">English</option>
                  <option value="FR">French</option>
                </SelectField>
                <SelectField label="Currency" value={addForm.currency} onChange={(value) => updateAddForm("currency", value)}>
                  <option value="NGN">NGN</option>
                </SelectField>
                <SelectField label="User Type" value={addForm.roleId} onChange={(value) => updateAddForm("roleId", value)}>
                  <option value="">All</option>
                  {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                </SelectField>
                <TextField label="Opening Balance" value={addForm.balance} onChange={(value) => updateAddForm("balance", value)} />
                <TextField label="Max Payout" value={addForm.max_payout} onChange={(value) => updateAddForm("max_payout", value)} />
                <TextField label="Password" type="password" value={addForm.password} onChange={(value) => updateAddForm("password", value)} required />
                <TextField label="Confirm Password" type="password" value={addForm.passwordConfirmation} onChange={(value) => updateAddForm("passwordConfirmation", value)} required />
                <TextField label="Email" type="email" value={addForm.email} onChange={(value) => updateAddForm("email", value)} />
                <TextField label="Confirm Email" type="email" value={addForm.confirmEmail} onChange={(value) => updateAddForm("confirmEmail", value)} />
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 pt-5 dark:border-gray-800 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setShowAddUser(false);
                setAddForm(emptyAddUserForm(agentId));
                setExistingUserResults([]);
              }}
              className="h-10 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingUser}
              className="h-10 rounded-md bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submittingUser ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </section>
    );
  }

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
            onClick={() => setShowAddUser(true)}
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

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required ? <span className="text-error-500"> *</span> : null}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      >
        {children}
      </select>
    </label>
  );
}
