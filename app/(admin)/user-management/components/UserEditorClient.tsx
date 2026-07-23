"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Button from "@/components/ui/button/Button";

import {
  createAdminUser,
  fetchAdminRoles,
  fetchAdminUser,
  fetchCountries,
  fetchStates,
  searchParentUsers,
  updateAdminUser,
  type AdminRole,
  type AdminUserFormValue,
  type CountryOption,
  type ParentUserOption,
  type StateOption,
} from "../api";

const emptyForm = (): AdminUserFormValue => ({
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
  parent_agent: "",
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
});

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function UserEditorClient({
  mode,
  userId,
}: {
  mode: "add" | "edit";
  userId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<AdminUserFormValue>(emptyForm());
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [parentQuery, setParentQuery] = useState("");
  const [parentResults, setParentResults] = useState<ParentUserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [searchingParents, setSearchingParents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedCountry = useMemo(
    () => countries.find((country) => country.name === form.country) ?? null,
    [countries, form.country]
  );

  useEffect(() => {
    void loadMeta();
  }, []);

  useEffect(() => {
    if (mode === "edit" && userId) {
      void loadUser(userId);
    }
  }, [mode, userId, countries.length]);

  async function loadMeta() {
    try {
      const [nextRoles, nextCountries] = await Promise.all([fetchAdminRoles(), fetchCountries()]);
      setRoles(nextRoles);
      setCountries(nextCountries);

      const nigeria = nextCountries.find((country) => country.name === "Nigeria") ?? nextCountries[0] ?? null;
      if (mode === "add" && nigeria) {
        setForm((current) => ({
          ...current,
          country: nigeria.name,
          currency: nigeria.currencyCode || current.currency,
        }));
        await loadStatesForCountry(nigeria.id, "");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load user metadata");
    } finally {
      if (mode === "add") {
        setLoading(false);
      }
    }
  }

  async function loadStatesForCountry(countryId: string, stateValue?: string) {
    setLoadingStates(true);
    try {
      const nextStates = await fetchStates(countryId);
      setStates(nextStates);
      if (stateValue !== undefined) {
        setForm((current) => ({ ...current, state: stateValue }));
      } else if (nextStates[0]) {
        setForm((current) => ({ ...current, state: nextStates[0].id }));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occured while fetching states");
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  }

  async function loadUser(targetUserId: string) {
    if (countries.length === 0) return;
    setLoading(true);
    try {
      const user = await fetchAdminUser(targetUserId);
      setForm((current) => ({
        ...current,
        country: user.country,
        state: user.state,
        language: user.language || "EN",
        currency: user.currency || "NGN",
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender || "Male",
        address: user.address,
        phoneNumber: user.phoneNumber,
        username: user.username,
        password: "",
        email: user.email,
        balance: "",
        roleId: user.roleId,
        parent_agent: "",
        clientId: process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
        userId: targetUserId,
      }));
      setConfirmEmail(user.email);
      setConfirmPassword("");

      const country = countries.find((item) => item.name === user.country) ?? null;
      if (country) {
        await loadStatesForCountry(country.id, user.state);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to fetch user");
    } finally {
      setLoading(false);
    }
  }

  function updateField<Key extends keyof AdminUserFormValue>(key: Key, value: AdminUserFormValue[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleCountryChange(countryName: string) {
    const country = countries.find((item) => item.name === countryName) ?? null;
    setForm((current) => ({
      ...current,
      country: countryName,
      state: "",
      currency: country?.currencyCode || current.currency,
    }));
    setStates([]);

    if (country) {
      await loadStatesForCountry(country.id);
    }
  }

  async function handleSearchParents() {
    const query = parentQuery.trim();
    if (!query) {
      toast.error("Enter a username to search");
      return;
    }

    setSearchingParents(true);
    try {
      const results = await searchParentUsers(query);
      setParentResults(results);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to search parent users");
    } finally {
      setSearchingParents(false);
    }
  }

  function selectParentUser(user: ParentUserOption) {
    setParentQuery(user.username);
    setParentResults([]);
    updateField("parent_agent", user.id);
  }

  function validateForm() {
    if (!form.firstName.trim()) return "Name is required";
    if (!form.lastName.trim()) return "Surname is required";
    if (!form.username.trim()) return "Username is required";

    if (mode === "add") {
      if (!form.address.trim()) return "Address is required";
      if (!form.phoneNumber.trim()) return "Phone Number is required";
      if (!form.password.trim()) return "Password is required";
      if (form.password !== confirmPassword) return "Password confirmation must match password";
      if (!form.email.trim()) return "Email is required";
      if (!isEmail(form.email)) return "Enter a valid email address";
      if (!confirmEmail.trim()) return "Confirm Email is required";
      if (form.email !== confirmEmail) return "Email confirmation must match email";
    } else if (form.email && !isEmail(form.email)) {
      return "Enter a valid email address";
    } else if (form.email !== confirmEmail) {
      return "Email confirmation must match email";
    }

    return "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "add") {
        const response = await createAdminUser(form);
        const body = response as { message?: string };
        toast.success(body.message || "User created");
      } else {
        const response = await updateAdminUser(form);
        const body = response as { message?: string };
        toast.success(body.message || "User updated");
      }
      router.push("/user-management/users");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : mode === "add"
            ? "Internal server error!"
            : "Something went wrong. Unable to update user details!"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <User className="h-5 w-5 text-brand-500" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {mode === "add" ? "Add New User" : "Edit User"}
            </h1>
          </div>
        </div>
        <div className="p-5 text-sm text-gray-500 dark:text-gray-400">Loading user details...</div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <User className="h-5 w-5 text-brand-500" />
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === "add" ? "Add New User" : "Edit User"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {mode === "add"
              ? "Create a back-office user with profile, role, parent user, password, and email confirmation."
              : "Update profile, role, parent user, and contact details for an existing user."}
          </p>
        </div>
      </div>

      <form className="space-y-6 p-5" onSubmit={(event) => void handleSubmit(event)}>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <SelectField label="Country" value={form.country} onChange={handleCountryChange}>
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
              <option value="">{loadingStates ? "Loading states" : "Select state"}</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="Language" value={form.language} onChange={(value) => updateField("language", value)}>
              <option value="EN">English</option>
              <option value="FR">French</option>
            </SelectField>
            <TextField label="Currency" value={form.currency} onChange={(value) => updateField("currency", value)} />
            <TextField label="Name" value={form.firstName} onChange={(value) => updateField("firstName", value)} required />
            <TextField label="Surname" value={form.lastName} onChange={(value) => updateField("lastName", value)} required />
            <TextField
              label="Date of Birth"
              value={form.dateOfBirth}
              onChange={(value) => updateField("dateOfBirth", value)}
            />
            <SelectField label="Gender" value={form.gender} onChange={(value) => updateField("gender", value)}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </SelectField>
            <TextField
              label="Address"
              value={form.address}
              onChange={(value) => updateField("address", value)}
              required={mode === "add"}
            />
            <TextField
              label="Phone Number"
              value={form.phoneNumber}
              onChange={(value) => updateField("phoneNumber", value)}
              required={mode === "add"}
            />
          </div>

          <div className="space-y-4">
            <TextField label="Username" value={form.username} onChange={(value) => updateField("username", value)} required />
            <SelectField label={mode === "add" ? "User Level" : "User Type"} value={form.roleId} onChange={(value) => updateField("roleId", value)}>
              {mode === "edit" ? <option value="">All</option> : null}
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </SelectField>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Parent User
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    value={parentQuery}
                    onChange={(event) => setParentQuery(event.target.value)}
                    placeholder="Search"
                    className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <Button type="button" variant="outline" onClick={() => void handleSearchParents()} disabled={searchingParents}>
                  {searchingParents ? "Searching..." : "Search"}
                </Button>
              </div>
              {parentResults.length > 0 ? (
                <div className="rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  {parentResults.map((parent) => (
                    <button
                      key={parent.id}
                      type="button"
                      onClick={() => selectParentUser(parent)}
                      className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03]"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">{parent.username}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {mode === "add" ? (
              <TextField label="Opening Balance" value={form.balance} onChange={(value) => updateField("balance", value)} />
            ) : null}
            {mode === "add" ? (
              <>
                <TextField label="Password" value={form.password} onChange={(value) => updateField("password", value)} type="password" required />
                <TextField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} type="password" required />
              </>
            ) : null}
            <TextField label="Email" value={form.email} onChange={(value) => updateField("email", value)} type="email" required={mode === "add"} />
            <TextField label="Confirm Email" value={confirmEmail} onChange={setConfirmEmail} type="email" required={mode === "add"} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/user-management/users"
            className="rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.03]"
          >
            Cancel
          </Link>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required ? <span className="text-red-500">*</span> : null}
      <input
        value={value}
        type={type}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      >
        {children}
      </select>
    </label>
  );
}
