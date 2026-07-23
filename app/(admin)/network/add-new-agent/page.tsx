"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Search } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";
import { withAuth } from "@/utils/withAuth";
import {
  asRecord,
  clientId,
  rowValue,
} from "@/app/(admin)/tickets/components/ticketApiHelpers";

type CountryOption = {
  id: string;
  name: string;
  currencyCode: string;
};

type StateOption = {
  id: string;
  name: string;
};

type RoleOption = {
  id: string;
  name: string;
};

type ParentUserOption = {
  id: string;
  username: string;
};

type AddAgentForm = {
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
  email: string;
  balance: string;
  roleId: string;
  parentId: string | null;
};

const emptyForm: AddAgentForm = {
  country: "",
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
  email: "",
  balance: "",
  roleId: "",
  parentId: null,
};

function recordsFrom(value: unknown) {
  if (Array.isArray(value)) return value.map(asRecord);

  const body = asRecord(value);
  if (Array.isArray(body.data)) return body.data.map(asRecord);
  if (Array.isArray(body.countries)) return body.countries.map(asRecord);
  if (Array.isArray(body.states)) return body.states.map(asRecord);

  return [];
}

function mapCountry(value: unknown, index: number): CountryOption {
  const country = asRecord(value);

  return {
    id: String(rowValue(country, ["id"], `country-${index}`)),
    name: String(rowValue(country, ["name"], "")),
    currencyCode: String(rowValue(country, ["currency_code", "currencyCode"], "")),
  };
}

function mapState(value: unknown, index: number): StateOption {
  const state = asRecord(value);

  return {
    id: String(rowValue(state, ["id"], `state-${index}`)),
    name: String(rowValue(state, ["name"], "")),
  };
}

function mapRole(value: unknown, index: number): RoleOption {
  const role = asRecord(value);

  return {
    id: String(rowValue(role, ["id"], `role-${index}`)),
    name: String(rowValue(role, ["name"], "")),
  };
}

function mapParentUser(value: unknown, index: number): ParentUserOption {
  const user = asRecord(value);

  return {
    id: String(rowValue(user, ["value", "id", "userId"], `parent-user-${index}`)),
    username: String(rowValue(user, ["username", "label", "name"], "")),
  };
}

function responseList(data: unknown, key?: string) {
  const body = asRecord(data);
  if (key) return recordsFrom(body[key]);
  return recordsFrom(data);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function AddNewAgentPage() {
  const router = useRouter();
  const [form, setForm] = useState<AddAgentForm>(emptyForm);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [parentQuery, setParentQuery] = useState("");
  const [parentResults, setParentResults] = useState<ParentUserOption[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [searchingParents, setSearchingParents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedCountry = useMemo(
    () => countries.find((country) => country.name === form.country),
    [countries, form.country]
  );

  function updateField<Key extends keyof AddAgentForm>(key: Key, value: AddAgentForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function loadStates(country: CountryOption) {
    setLoadingStates(true);
    const response = await GETREQUEST<any>(`/content-management/states/${country.id}`);
    setLoadingStates(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "An error occured while fetching states");
      setStates([]);
      return;
    }

    setStates(responseList(response.data, "states").map(mapState));
  }

  async function loadMeta() {
    setLoadingMeta(true);
    const [rolesResponse, countriesResponse] = await Promise.all([
      GETREQUEST<any>("/admin/roles/agency"),
      GETREQUEST<any>("/content-management/countries"),
    ]);
    setLoadingMeta(false);

    const rolesBody = asRecord(rolesResponse.data);
    if (rolesResponse.ok && rolesBody.success !== false) {
      setRoles(responseList(rolesResponse.data, "data").map(mapRole));
    }

    const countriesBody = asRecord(countriesResponse.data);
    if (!countriesResponse.ok || countriesBody.success === false) {
      toast.error(
        countriesResponse.error ||
          countriesBody.message ||
          "An error occured while fetching countries"
      );
      return;
    }

    const countryList = responseList(countriesResponse.data, "countries").map(mapCountry);
    setCountries(countryList);
  }

  useEffect(() => {
    loadMeta();
  }, []);

  function handleCountryChange(countryName: string) {
    const country = countries.find((item) => item.name === countryName);

    setForm((current) => ({
      ...current,
      country: countryName,
      state: "",
      currency: country?.currencyCode || current.currency,
    }));
    setStates([]);

    if (country) {
      void loadStates(country);
    }
  }

  async function searchParentUsers() {
    const query = parentQuery.trim();
    if (!query) {
      toast.error("Enter a username to search");
      return;
    }

    setSearchingParents(true);
    const response = await GETREQUEST<any>(
      `/admin/players/get-select-dropdown?username=${encodeURIComponent(query)}&clientId=${clientId()}`
    );
    setSearchingParents(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "Unable to search parent users");
      return;
    }

    setParentResults(responseList(response.data, "data").map(mapParentUser));
  }

  function selectParentUser(user: ParentUserOption) {
    updateField("parentId", user.id);
    setParentQuery(user.username);
    setParentResults([]);
  }

  function validateForm() {
    if (!form.firstName.trim()) return "Name is required";
    if (!form.lastName.trim()) return "Surname is required";
    if (!form.address.trim()) return "Address is required";
    if (!form.phoneNumber.trim()) return "Phone Number is required";
    if (!form.username.trim()) return "Username is required";
    if (!form.password.trim()) return "Password is required";
    if (form.password !== confirmPassword) return "Password confirmation must match password";
    if (!form.email.trim()) return "Email is required";
    if (!isValidEmail(form.email)) return "Enter a valid email address";
    if (!confirmEmail.trim()) return "Confirm Email is required";
    if (form.email !== confirmEmail) return "Email confirmation must match email";

    return "";
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      country: countries.find((country) => country.name === "Nigeria")?.name || "",
    });
    setConfirmPassword("");
    setConfirmEmail("");
    setParentQuery("");
    setParentResults([]);
    setStates([]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);
    const response = await POSTREQUEST<any>(
      `/admin/retail/${clientId()}/create-user`,
      form
    );
    setSubmitting(false);

    const body = asRecord(response.data);
    const hasStatus = body.status !== undefined && body.status !== null;
    const succeeded = hasStatus
      ? Number(body.status) === 1
      : body.success !== false;
    if (!response.ok || !succeeded) {
      toast.error(response.error || body.message || "Something went wrong. Unable to create new shop!");
      return;
    }

    toast.success(body.message || "User created");
    resetForm();

    const data = asRecord(body.data);
    const createdId = rowValue(data, ["id"], "");
    if (createdId) {
      router.push(`/network/agent/${createdId}`);
    }
  }

  function handleCancel() {
    router.push("/user-management/users");
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add New User" />

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-2 bg-brand-500 px-6 py-4 text-white">
          <Pencil className="h-5 w-5" />
          <h2 className="text-lg font-semibold">User Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <SelectField
                label="Country"
                value={form.country}
                onChange={handleCountryChange}
                disabled={loadingMeta}
              >
                <option value="">Select country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="State"
                value={form.state}
                onChange={(value) => updateField("state", value)}
                disabled={!selectedCountry || loadingStates}
              >
                <option value="">
                  {loadingStates ? "Loading states" : "Select state"}
                </option>
                {states.map((state) => (
                  <option key={state.id} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Language"
                value={form.language}
                onChange={(value) => updateField("language", value)}
              >
                <option value="EN">English</option>
                <option value="FR">French</option>
              </SelectField>

              <TextField
                label="Currency"
                value={form.currency}
                onChange={(value) => updateField("currency", value)}
              />
              <TextField
                label="Name"
                value={form.firstName}
                onChange={(value) => updateField("firstName", value)}
                required
              />
              <TextField
                label="Surname"
                value={form.lastName}
                onChange={(value) => updateField("lastName", value)}
                required
              />
              <TextField
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(value) => updateField("dateOfBirth", value)}
              />
              <SelectField
                label="Gender"
                value={form.gender}
                onChange={(value) => updateField("gender", value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </SelectField>
              <TextField
                label="Address"
                value={form.address}
                onChange={(value) => updateField("address", value)}
                required
              />
              <TextField
                label="Phone Number"
                value={form.phoneNumber}
                onChange={(value) => updateField("phoneNumber", value)}
                required
              />
            </div>

            <div className="space-y-4">
              <TextField
                label="Username"
                value={form.username}
                onChange={(value) => updateField("username", value)}
                required
              />
              <SelectField
                label="User Level"
                value={form.roleId}
                onChange={(value) => updateField("roleId", value)}
                disabled={loadingMeta}
              >
                <option value="">Select user level</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </SelectField>

              <div className="space-y-2">
                <LabelText>Parent User</LabelText>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      value={parentQuery}
                      onChange={(event) => {
                        setParentQuery(event.target.value);
                        updateField("parentId", null);
                      }}
                      placeholder="Search"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void searchParentUsers()}
                    disabled={searchingParents}
                  >
                    {searchingParents ? "Searching" : "Search"}
                  </Button>
                </div>
                {parentResults.length ? (
                  <div className="rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    {parentResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => selectParentUser(user)}
                        className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        {user.username} <span className="text-gray-400">#{user.id}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <TextField
                label="Opening Balance"
                value={form.balance}
                onChange={(value) => updateField("balance", value)}
              />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={(value) => updateField("password", value)}
                required
              />
              <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
              />
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                required
              />
              <TextField
                label="Confirm Email"
                type="email"
                value={confirmEmail}
                onChange={setConfirmEmail}
                required
              />
            </div>
          </div>

          <div className="mt-8 grid gap-3 border-t border-gray-200 pt-6 dark:border-gray-800 sm:ml-auto sm:max-w-md sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
              className="w-full"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Submit..." : "Submit"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function LabelText({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {children}
      {required ? <span className="ml-1 text-error-500">*</span> : null}
    </label>
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
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="space-y-2">
      <LabelText required={required}>{label}</LabelText>
      <input
        id={id}
        value={value}
        type={type}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="space-y-2">
      <LabelText>{label}</LabelText>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:disabled:bg-gray-800"
      >
        {children}
      </select>
    </div>
  );
}

export default withAuth(AddNewAgentPage);
