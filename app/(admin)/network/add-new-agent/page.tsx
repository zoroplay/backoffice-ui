"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import { withAuth } from "@/utils/withAuth";
import { agentsApi, normalizeApiError } from "@/lib/api";

type FormData = {
  country: string;
  state: string;
  language: string;
  currency: string;
  name: string;
  surname: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phoneNumber: string;
  username: string;
  userLevel: string;
  parentUser: string;
  openingBalance: string;
  password: string;
  confirmPassword: string;
  email: string;
  confirmEmail: string;
};

type ParentUserOption = {
  id: string;
  username: string;
  name: string;
};

type RoleOption = {
  value: string;
  label: string;
};

const initialState: FormData = {
  country: "",
  state: "",
  language: "EN",
  currency: "NGN",
  name: "",
  surname: "",
  dateOfBirth: "",
  gender: "Male",
  address: "",
  phoneNumber: "",
  username: "",
  userLevel: "",
  parentUser: "",
  openingBalance: "0",
  password: "",
  confirmPassword: "",
  email: "",
  confirmEmail: "",
};

const countryOptions = [
  { value: "Nigeria", label: "Nigeria" },
  { value: "Ghana", label: "Ghana" },
  { value: "Kenya", label: "Kenya" },
];

const stateOptions = [
  { value: "Lagos", label: "Lagos" },
  { value: "Abuja", label: "Abuja" },
  { value: "Kano", label: "Kano" },
];

const languageOptions = [{ value: "EN", label: "English" }];

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const parseRoles = (response: unknown): RoleOption[] => {
  if (!response || typeof response !== "object") return [];
  const root = response as Record<string, unknown>;
  const list =
    (Array.isArray(root.data) && root.data) ||
    (root.data &&
    typeof root.data === "object" &&
    Array.isArray((root.data as Record<string, unknown>).data)
      ? ((root.data as Record<string, unknown>).data as unknown[])
      : []);

  return (list as unknown[])
    .map((item) => {
      const role = (item as Record<string, unknown>) ?? {};
      const id = String(role.id ?? "");
      const name = String(role.name ?? "");
      if (!id || !name) return null;
      return {
        value: id,
        label: name,
      };
    })
    .filter((role): role is RoleOption => Boolean(role));
};

const parseParentUsers = (response: unknown): ParentUserOption[] => {
  if (Array.isArray(response)) {
    return response
      .map((item) => {
        const row = (item as Record<string, unknown>) ?? {};
        const id = String(row.id ?? row.userId ?? row.value ?? "");
        const username = String(
          row.username ?? row.userName ?? row.label ?? row.name ?? ""
        );
        const name = String(row.name ?? row.fullName ?? username);
        if (!id || !username) return null;
        return { id, username, name };
      })
      .filter((user): user is ParentUserOption => Boolean(user));
  }

  if (!response || typeof response !== "object") return [];
  const root = response as Record<string, unknown>;

  const listCandidates = [
    root.data,
    root.result,
    root.users,
    root.options,
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>).data
      : null,
  ];

  const list = listCandidates.find(Array.isArray) as unknown[] | undefined;
  if (!Array.isArray(list)) return [];

  return list
    .map((item) => {
      const row = (item as Record<string, unknown>) ?? {};
      const id = String(row.id ?? row.userId ?? row.value ?? "");
      const username = String(
        row.username ?? row.userName ?? row.label ?? row.name ?? ""
      );
      const name = String(row.name ?? row.fullName ?? username);
      if (!id || !username) return null;
      return { id, username, name };
    })
    .filter((user): user is ParentUserOption => Boolean(user));
};

const toMMDDYYYY = (dateValue: string) => {
  if (!dateValue) return "";
  const [yyyy, mm, dd] = dateValue.split("-");
  if (!yyyy || !mm || !dd) return "";
  return `${mm}/${dd}/${yyyy}`;
};

function AddNewAgentPage() {
  const [formData, setFormData] = useState<FormData>(initialState);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [parentOptions, setParentOptions] = useState<ParentUserOption[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [showParentOptions, setShowParentOptions] = useState(false);
  const [isSearchingParent, setIsSearchingParent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadRoles = async () => {
      try {
        const response = await agentsApi.getAgencyRoles();
        if (cancelled) return;
        setRoleOptions(parseRoles(response));
      } catch (error) {
        const apiError = normalizeApiError(error);
        toast.error(apiError.message ?? "Failed to load user levels");
      }
    };
    void loadRoles();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!formData.parentUser.trim()) {
      setParentOptions([]);
      setIsSearchingParent(false);
      return;
    }

    const handle = setTimeout(async () => {
      setIsSearchingParent(true);
      try {
        const response = await agentsApi.searchParentUsers({
          username: formData.parentUser.trim(),
        });
        setParentOptions(parseParentUsers(response));
        setShowParentOptions(true);
      } catch (error) {
        const apiError = normalizeApiError(error);
        toast.error(apiError.message ?? "Failed to search parent user");
      } finally {
        setIsSearchingParent(false);
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [formData.parentUser]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "parentUser") {
      setSelectedParentId(null);
    }
  };

  const handleSelectParent = (option: ParentUserOption) => {
    setFormData((prev) => ({ ...prev, parentUser: option.username }));
    setSelectedParentId(option.id);
    setShowParentOptions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password and Confirm Password do not match.");
      return;
    }

    if (formData.email !== formData.confirmEmail) {
      toast.error("Email and Confirm Email do not match.");
      return;
    }

    if (!formData.userLevel) {
      toast.error("Please select User Level.");
      return;
    }

    setIsSubmitting(true);
    try {
      await agentsApi.createRetailUser({
        country: formData.country,
        state: formData.state,
        language: formData.language,
        currency: formData.currency,
        firstName: formData.name,
        lastName: formData.surname,
        dateOfBirth: toMMDDYYYY(formData.dateOfBirth),
        gender: formData.gender,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        balance: formData.openingBalance || "0",
        roleId: formData.userLevel,
        parentId: selectedParentId,
      });

      toast.success("Agent created successfully");
      setFormData(initialState);
      setParentOptions([]);
      setSelectedParentId(null);
      setShowParentOptions(false);
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialState);
    setParentOptions([]);
    setSelectedParentId(null);
    setShowParentOptions(false);
  };

  const parentHelper = useMemo(() => {
    if (isSearchingParent) return "Searching...";
    if (!showParentOptions) return "";
    if (!parentOptions.length && formData.parentUser.trim()) return "No parent user found";
    return "";
  }, [formData.parentUser, isSearchingParent, parentOptions.length, showParentOptions]);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add New User" />

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-2 rounded-t-lg bg-brand-500 px-6 py-4 text-white">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          <h2 className="text-lg font-semibold">User Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  options={countryOptions}
                  placeholder="Select country"
                  value={formData.country}
                  onChange={(value) => handleInputChange("country", value)}
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Select
                  options={stateOptions}
                  placeholder="Select state"
                  value={formData.state}
                  onChange={(value) => handleInputChange("state", value)}
                />
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  options={languageOptions}
                  placeholder="Select language"
                  value={formData.language}
                  onChange={(value) => handleInputChange("language", value)}
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input
                  type="text"
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                  placeholder="NGN"
                />
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter name"
                />
              </div>

              <div>
                <Label htmlFor="surname">Surname</Label>
                <Input
                  type="text"
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={(e) => handleInputChange("surname", e.target.value)}
                  placeholder="Enter surname"
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  options={genderOptions}
                  placeholder="Select gender"
                  value={formData.gender}
                  onChange={(value) => handleInputChange("gender", value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter address"
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="Enter username"
                />
              </div>

              <div>
                <Label htmlFor="userLevel">User Level</Label>
                <Select
                  options={roleOptions}
                  placeholder="Select user level"
                  value={formData.userLevel}
                  onChange={(value) => handleInputChange("userLevel", value)}
                />
              </div>

              <div>
                <Label htmlFor="parentUser">Parent User</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="text"
                    id="parentUser"
                    name="parentUser"
                    value={formData.parentUser}
                    onChange={(e) => handleInputChange("parentUser", e.target.value)}
                    placeholder="Search"
                    className="pl-10"
                    onFocus={() => setShowParentOptions(true)}
                  />
                  {showParentOptions && parentOptions.length > 0 && (
                    <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                      {parentOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => handleSelectParent(option)}
                        >
                          <span className="font-medium">{option.username}</span>
                          <span className="ml-2 text-gray-500">{option.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {parentHelper ? (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{parentHelper}</p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="openingBalance">Opening Balance</Label>
                <Input
                  type="number"
                  id="openingBalance"
                  name="openingBalance"
                  value={formData.openingBalance}
                  onChange={(e) => handleInputChange("openingBalance", e.target.value)}
                  placeholder="Enter opening balance"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter password"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Confirm password"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email"
                />
              </div>

              <div>
                <Label htmlFor="confirmEmail">Confirm Email</Label>
                <Input
                  type="email"
                  id="confirmEmail"
                  name="confirmEmail"
                  value={formData.confirmEmail}
                  onChange={(e) => handleInputChange("confirmEmail", e.target.value)}
                  placeholder="Confirm email"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              className="min-w-[120px] bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="min-w-[120px] bg-blue-500 hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withAuth(AddNewAgentPage);
