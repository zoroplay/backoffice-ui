"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { asRecord, clientId, rowValue, type AnyRecord } from "@/app/(admin)/tickets/components/ticketApiHelpers";
import { GETREQUEST, POSTREQUEST, PUTREQUEST } from "@/utils/base_request";
import { withAuth } from "@/utils/withAuth";

type Option = {
  id: string;
  name: string;
};

type AgentUserForm = {
  country_id: string;
  state_id: string;
  language: string;
  currency: string;
  firstName: string;
  lastName: string;
  date_of_birth: string;
  gender: string;
  address: string;
  phone_number: string;
  username: string;
  role_id: string;
  email: string;
  max_payout: string;
};

const defaultForm: AgentUserForm = {
  country_id: "160",
  state_id: "",
  language: "EN",
  currency: "NGN",
  firstName: "",
  lastName: "",
  date_of_birth: "",
  gender: "Male",
  address: "",
  phone_number: "",
  username: "",
  role_id: "",
  email: "",
  max_payout: "",
};

function AgentUserPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = String(params?.id ?? "");
  const agentId = searchParams.get("agentId") ?? "";
  const [form, setForm] = useState<AgentUserForm>(defaultForm);
  const [roles, setRoles] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [userResponse, rolesResponse, statesResponse] = await Promise.all([
        GETREQUEST<any>(`/admin/players/${userId}/details?clientId=${clientId()}`),
        GETREQUEST<any>("/api/admin/settings/user-roles"),
        GETREQUEST<any>("/admin/utilities/get-country-states"),
      ]);
      setLoading(false);

      const userBody = asRecord(userResponse.data);
      if (!userResponse.ok || userBody.success === false) {
        toast.error(userResponse.error || userBody.message || "Unable to fetch agent user");
      } else {
        setForm(mapUserToForm(userBody.data ?? userResponse.data));
      }

      const roleRows = recordsFrom(rolesResponse.data);
      setRoles(roleRows.map((role, index) => ({
        id: String(rowValue(role, ["id"], `role-${index}`)),
        name: String(rowValue(role, ["name"], "")),
      })));

      const stateRows = recordsFrom(asRecord(statesResponse.data).states ?? statesResponse.data);
      setStates(stateRows.map((state, index) => ({
        id: String(rowValue(state, ["id"], `state-${index}`)),
        name: String(rowValue(state, ["name"], "")),
      })));
    }

    if (userId) void load();
  }, [userId]);

  function updateField<Key extends keyof AgentUserForm>(key: Key, value: AgentUserForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.username.trim()) {
      toast.error("Username is required");
      return;
    }

    setSaving(true);
    const response = agentId
      ? await POSTREQUEST<any>(`/admin/agent-management/agent/${agentId}/update-user`, { ...form, id: userId })
      : await PUTREQUEST<any>(`/admin/players/${userId}/update-details`, form);
    setSaving(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "Internal server error!");
      return;
    }

    toast.success(body.message || "User updated");
    if (agentId) router.push(`/network/agent/${agentId}`);
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle={form.username ? `Edit Agent User: ${form.username}` : "Edit Agent User"} />

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit User</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update profile, role, contact, and payout details for this agent user.
            </p>
          </div>
          {agentId ? (
            <Link href={`/network/agent/${agentId}`} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300">
              Back to agent
            </Link>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading user</div>
        ) : (
          <form onSubmit={submit} className="space-y-6 p-5">
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-4">
                <SelectField label="Country" value={form.country_id} onChange={(value) => updateField("country_id", value)}>
                  <option value="160">Nigeria</option>
                </SelectField>
                <SelectField label="State" value={form.state_id} onChange={(value) => updateField("state_id", value)}>
                  <option value="">Select state</option>
                  {states.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}
                </SelectField>
                <SelectField label="Language" value={form.language} onChange={(value) => updateField("language", value)}>
                  <option value="EN">English</option>
                  <option value="FR">French</option>
                </SelectField>
                <SelectField label="Currency" value={form.currency} onChange={(value) => updateField("currency", value)}>
                  <option value="NGN">NGN</option>
                </SelectField>
                <TextField label="Name" value={form.firstName} onChange={(value) => updateField("firstName", value)} />
                <TextField label="Surname" value={form.lastName} onChange={(value) => updateField("lastName", value)} />
                <TextField label="Date of Birth" type="date" value={form.date_of_birth} onChange={(value) => updateField("date_of_birth", value)} />
                <SelectField label="Gender" value={form.gender} onChange={(value) => updateField("gender", value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </SelectField>
              </div>

              <div className="space-y-4">
                <TextField label="Address" value={form.address} onChange={(value) => updateField("address", value)} />
                <TextField label="Phone Number" value={form.phone_number} onChange={(value) => updateField("phone_number", value)} />
                <TextField label="Username" value={form.username} onChange={(value) => updateField("username", value)} required />
                <SelectField label="User Type" value={form.role_id} onChange={(value) => updateField("role_id", value)}>
                  <option value="">All</option>
                  {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                </SelectField>
                <TextField label="Email" type="email" value={form.email} onChange={(value) => updateField("email", value)} />
                <TextField label="Max Payout" type="number" value={form.max_payout} onChange={(value) => updateField("max_payout", value)} />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-5 dark:border-gray-800 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => agentId ? router.push(`/network/agent/${agentId}`) : router.back()}
                className="h-10 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-10 rounded-md bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function recordsFrom(data: unknown): AnyRecord[] {
  if (Array.isArray(data)) return data.map(asRecord);
  const body = asRecord(data);
  if (Array.isArray(body.data)) return body.data.map(asRecord);
  if (Array.isArray(body.items)) return body.items.map(asRecord);
  return [];
}

function mapUserToForm(data: unknown): AgentUserForm {
  const user = asRecord(data);
  return {
    country_id: String(rowValue(user, ["country_id", "countryId"], defaultForm.country_id)),
    state_id: String(rowValue(user, ["state_id", "stateId", "state"], defaultForm.state_id)),
    language: String(rowValue(user, ["language"], defaultForm.language)),
    currency: String(rowValue(user, ["currency"], defaultForm.currency)),
    firstName: String(rowValue(user, ["firstName", "first_name"], defaultForm.firstName)),
    lastName: String(rowValue(user, ["lastName", "last_name"], defaultForm.lastName)),
    date_of_birth: toDateInput(rowValue(user, ["date_of_birth", "dateOfBirth"], defaultForm.date_of_birth)),
    gender: String(rowValue(user, ["gender"], defaultForm.gender)),
    address: String(rowValue(user, ["address"], defaultForm.address)),
    phone_number: String(rowValue(user, ["phone_number", "phoneNumber"], defaultForm.phone_number)),
    username: String(rowValue(user, ["username"], defaultForm.username)),
    role_id: String(rowValue(user, ["role_id", "roleId"], defaultForm.role_id)),
    email: String(rowValue(user, ["email"], defaultForm.email)),
    max_payout: String(rowValue(user, ["max_payout", "maxPayout"], defaultForm.max_payout)),
  };
}

function toDateInput(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
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

export default withAuth(AgentUserPage);
