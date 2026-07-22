"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Search, User } from "lucide-react";

import { userRoles, usersSeed } from "../users/data";

type CountryOption = {
  id: string;
  name: string;
  currencyCode: string;
  states: { id: string; name: string }[];
};

type UserEditorValues = {
  country: string;
  state: string;
  language: "EN" | "FR";
  currency: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
  address: string;
  phoneNumber: string;
  username: string;
  roleId: string;
  parentId: string;
  parentUser: string;
  balance: string;
  password: string;
  passwordConfirmation: string;
  email: string;
  confirmEmail: string;
  clientId: string;
  userId?: string;
};

type UserEditorErrors = Partial<Record<keyof UserEditorValues, string>>;

const countries: CountryOption[] = [
  {
    id: "NG",
    name: "Nigeria",
    currencyCode: "NGN",
    states: [
      { id: "lagos", name: "Lagos" },
      { id: "abuja", name: "Abuja" },
      { id: "rivers", name: "Rivers" },
      { id: "oyo", name: "Oyo" },
    ],
  },
  {
    id: "GH",
    name: "Ghana",
    currencyCode: "GHS",
    states: [
      { id: "greater-accra", name: "Greater Accra" },
      { id: "ashanti", name: "Ashanti" },
    ],
  },
  {
    id: "KE",
    name: "Kenya",
    currencyCode: "KES",
    states: [
      { id: "nairobi", name: "Nairobi" },
      { id: "mombasa", name: "Mombasa" },
    ],
  },
];

const parentUsers = [
  { id: "USR-2024001", username: "chidi.arinze" },
  { id: "USR-2024002", username: "aisha.bello" },
  { id: "USR-2024003", username: "diego.martins" },
  { id: "AGT-1001", username: "lagos.shop.parent" },
];

const defaultValues: UserEditorValues = {
  country: "Nigeria",
  state: "lagos",
  language: "EN",
  currency: "NGN",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "Male",
  address: "",
  phoneNumber: "",
  username: "",
  roleId: userRoles[2]?.value ?? "Customer Support",
  parentId: "",
  parentUser: "",
  balance: "",
  password: "",
  passwordConfirmation: "",
  email: "",
  confirmEmail: "",
  clientId: "process.env.clientId",
};

function getInitialValues(mode: "add" | "edit", userId?: string): UserEditorValues {
  if (mode === "add") return defaultValues;

  const user = usersSeed.find((item) => item.id === userId || item.email === userId);
  if (!user) {
    return {
      ...defaultValues,
      username: userId ?? "",
      userId,
    };
  }

  const [firstName, ...lastNameParts] = user.name.split(" ");
  return {
    ...defaultValues,
    firstName: firstName ?? "",
    lastName: lastNameParts.join(" "),
    phoneNumber: user.phone,
    username: user.email.split("@")[0] ?? user.id,
    email: user.email,
    confirmEmail: user.email,
    roleId: user.role,
    address: user.location,
    userId: user.id,
  };
}

function isEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validate(values: UserEditorValues, mode: "add" | "edit"): UserEditorErrors {
  const errors: UserEditorErrors = {};
  const requiredFields: (keyof UserEditorValues)[] = ["firstName", "lastName", "username"];

  if (mode === "add") {
    requiredFields.push("address", "phoneNumber", "password", "passwordConfirmation", "email", "confirmEmail");
  }

  requiredFields.forEach((field) => {
    if (!String(values[field] ?? "").trim()) {
      errors[field] = "Required";
    }
  });

  if (mode === "add" && values.password !== values.passwordConfirmation) {
    errors.passwordConfirmation = "Password confirmation must match password";
  }

  if (!isEmail(values.email)) {
    errors.email = "Enter a valid email address";
  }

  if (values.email || values.confirmEmail) {
    if (values.email !== values.confirmEmail) {
      errors.confirmEmail = "Email confirmation must match email";
    }
  }

  return errors;
}

export default function UserEditorClient({
  mode,
  userId,
}: {
  mode: "add" | "edit";
  userId?: string;
}) {
  const initialValues = useMemo(() => getInitialValues(mode, userId), [mode, userId]);
  const [values, setValues] = useState<UserEditorValues>(initialValues);
  const [errors, setErrors] = useState<UserEditorErrors>({});
  const [parentQuery, setParentQuery] = useState(initialValues.parentUser);
  const [saveMessage, setSaveMessage] = useState("");

  const selectedCountry = countries.find((country) => country.name === values.country) ?? countries[0];
  const parentResults = parentQuery.trim()
    ? parentUsers.filter((parent) => parent.username.toLowerCase().includes(parentQuery.toLowerCase())).slice(0, 5)
    : [];

  function updateValue(key: keyof UserEditorValues, value: string) {
    setValues((current) => {
      if (key === "country") {
        const nextCountry = countries.find((country) => country.name === value) ?? countries[0];
        return {
          ...current,
          country: nextCountry.name,
          state: nextCountry.states[0]?.id ?? "",
          currency: nextCountry.currencyCode,
        };
      }
      return { ...current, [key]: value };
    });
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function selectParent(parent: (typeof parentUsers)[number]) {
    setParentQuery(parent.username);
    setValues((current) => ({ ...current, parentId: parent.id, parentUser: parent.username }));
  }

  function submit() {
    const nextErrors = validate(values, mode);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setSaveMessage("Unable to save details.");
      return;
    }

    setSaveMessage(
      mode === "add"
        ? "Ready to POST process.env.newAPI/admin/users."
        : "Ready to PUT process.env.newAPI/admin/users/update.",
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
              ? "Create an admin user with profile, role, parent user, password, and email confirmation."
              : "Update profile, role, parent user, and contact details for an existing admin user."}
          </p>
        </div>
      </div>

      <form className="space-y-6 p-5">
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <SelectField label="Country" value={values.country} onChange={(value) => updateValue("country", value)}>
              {countries.map((country) => (
                <option key={country.id} value={country.name}>
                  {country.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="State" value={values.state} onChange={(value) => updateValue("state", value)}>
              {selectedCountry.states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="Language" value={values.language} onChange={(value) => updateValue("language", value)}>
              <option value="EN">English</option>
              <option value="FR">French</option>
            </SelectField>
            <TextField label="Currency" value={values.currency} onChange={(value) => updateValue("currency", value)} />
            <TextField label="Name" value={values.firstName} onChange={(value) => updateValue("firstName", value)} error={errors.firstName} required />
            <TextField label="Surname" value={values.lastName} onChange={(value) => updateValue("lastName", value)} error={errors.lastName} required />
            <TextField label="Date of Birth" value={values.dateOfBirth} onChange={(value) => updateValue("dateOfBirth", value)} type="date" />
            <SelectField label="Gender" value={values.gender} onChange={(value) => updateValue("gender", value)}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </SelectField>
            <TextField label="Address" value={values.address} onChange={(value) => updateValue("address", value)} error={errors.address} required={mode === "add"} />
            <TextField label="Phone Number" value={values.phoneNumber} onChange={(value) => updateValue("phoneNumber", value)} error={errors.phoneNumber} required={mode === "add"} />
          </div>

          <div className="space-y-4">
            <TextField label="Username" value={values.username} onChange={(value) => updateValue("username", value)} error={errors.username} required />
            <SelectField label={mode === "add" ? "User Level" : "User Type"} value={values.roleId} onChange={(value) => updateValue("roleId", value)}>
              {mode === "edit" ? <option value="">All</option> : null}
              {userRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </SelectField>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Parent User
                <span className="relative mt-2 block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    value={parentQuery}
                    onChange={(event) => {
                      setParentQuery(event.target.value);
                      updateValue("parentUser", event.target.value);
                    }}
                    placeholder="Search"
                    className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </span>
              </label>
              {parentResults.length ? (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  {parentResults.map((parent) => (
                    <button
                      key={parent.id}
                      type="button"
                      onClick={() => selectParent(parent)}
                      className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03]"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">{parent.username}</span>{" "}
                      <span className="text-gray-500 dark:text-gray-400">{parent.id}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {mode === "add" ? (
              <TextField label="Opening Balance" value={values.balance} onChange={(value) => updateValue("balance", value)} inputMode="decimal" />
            ) : null}
            {mode === "add" ? (
              <>
                <TextField label="Password" value={values.password} onChange={(value) => updateValue("password", value)} type="password" error={errors.password} required />
                <TextField
                  label="Confirm Password"
                  value={values.passwordConfirmation}
                  onChange={(value) => updateValue("passwordConfirmation", value)}
                  type="password"
                  error={errors.passwordConfirmation}
                  required
                />
              </>
            ) : null}
            <TextField label="Email" value={values.email} onChange={(value) => updateValue("email", value)} type="email" error={errors.email} required={mode === "add"} />
            <TextField
              label="Confirm Email"
              value={values.confirmEmail}
              onChange={(value) => updateValue("confirmEmail", value)}
              type="email"
              error={errors.confirmEmail}
              required={mode === "add"}
            />
          </div>
        </div>

        <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
          <div>clientId: <span className="font-mono">{values.clientId}</span></div>
          {mode === "edit" ? <div className="mt-1">userId: <span className="font-mono">{values.userId ?? userId}</span></div> : null}
        </div>

        {saveMessage ? (
          <div className="rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            {saveMessage}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/user-management/users"
            className="rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.03]"
          >
            Cancel
          </Link>
          <button type="button" onClick={submit} className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
            Submit
          </button>
        </div>
      </form>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
  inputMode?: "decimal" | "numeric";
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required ? <span className="text-red-500">*</span> : null}
      <input
        value={value}
        type={type}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 h-10 w-full rounded-md border px-3 text-sm dark:bg-gray-900 dark:text-white ${
          error ? "border-red-300 dark:border-red-500" : "border-gray-300 dark:border-gray-700"
        }`}
      />
      {error ? <span className="mt-1 block text-xs text-red-500">{error}</span> : null}
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
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      >
        {children}
      </select>
    </label>
  );
}
