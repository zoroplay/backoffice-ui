"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { SingleValue } from "react-select";
import Select from "react-select";
import { KeyRound, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";
import {
  AddUserModal,
  type AddUserFormValues,
} from "@/app/(admin)/user-management/users/components/AddUserModal";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { normalizeApiError, usersApi } from "@/lib/api";

type FilterOption = { value: string; label: string };
type RoleOption = { value: string; label: string };

const filterOptions: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
];

const defaultClientId = Number(process.env.NEXT_PUBLIC_CLIENT_ID ?? 4);

export type AgentUser = {
  clientId: number;
  id: number;
  username: string;
  code: string;
  role_id: number;
  firstName: string;
  lastName: string;
  phone_number: string;
  email: string;
  rolename: string;
  balance: number;
  country?: string;
  state?: string;
  language?: string;
  currency?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
};

type ChangePasswordState = {
  userId: number;
  username: string;
  password: string;
  confirmPassword: string;
};

type DeleteState = {
  userId: number;
  username: string;
};

interface UsersTabProps {
  agentId: string;
  agent: Agency;
}

function UsersTab({ agentId, agent }: UsersTabProps) {
  const effectiveAgentId = agentId || agent.id || agent.username;
  const { theme } = useTheme();

  const [filter, setFilter] = useState<FilterOption>(filterOptions[0]);
  const [users, setUsers] = useState<AgentUser[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AgentUser | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [passwordState, setPasswordState] = useState<ChangePasswordState | null>(
    null
  );
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const fieldClassName =
    "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500";
  const labelClassName = "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

  const toNumber = (value: unknown) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) ? num : 0;
  };

  const parseList = (input: unknown): Record<string, unknown>[] => {
    if (Array.isArray(input)) return input as Record<string, unknown>[];
    if (input && typeof input === "object") {
      const record = input as Record<string, unknown>;
      if (Array.isArray(record.data)) return record.data as Record<string, unknown>[];
      if (record.data && typeof record.data === "object") {
        const nested = record.data as Record<string, unknown>;
        if (Array.isArray(nested.data)) return nested.data as Record<string, unknown>[];
      }
    }
    return [];
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.getAgentUsers({
        agentId: effectiveAgentId,
        page: 1,
        user_type: "",
      });

      const mapped = parseList(response).map((row) => ({
        clientId: toNumber(row.clientId) || defaultClientId,
        id: toNumber(row.id),
        username: String(row.username ?? ""),
        code: String(row.code ?? ""),
        role_id: toNumber(row.role_id),
        firstName: String(row.firstName ?? ""),
        lastName: String(row.lastName ?? ""),
        phone_number: String(row.phone_number ?? ""),
        email: String(row.email ?? ""),
        rolename: String(row.rolename ?? ""),
        balance: toNumber(row.balance),
        country: String(row.country ?? ""),
        state: String(row.state ?? ""),
        language: String(row.language ?? ""),
        currency: String(row.currency ?? ""),
        date_of_birth: String(row.date_of_birth ?? ""),
        gender: String(row.gender ?? ""),
        address: String(row.address ?? ""),
      })) satisfies AgentUser[];

      setUsers(mapped);
    } catch (err) {
      const apiError = normalizeApiError(err);
      setError(apiError.message ?? "Failed to fetch agent users");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveAgentId]);

  const fetchAgencyRoles = useCallback(async () => {
    try {
      const response = await usersApi.getAgencyRoles();
      const options = parseList(response)
        .map((row) => {
          const id = String(row.id ?? "");
          const name = String(row.name ?? "");
          if (!id || !name) return null;
          return { value: id, label: name } satisfies RoleOption;
        })
        .filter((item): item is RoleOption => Boolean(item));

      setRoleOptions(options);
    } catch {
      setRoleOptions([]);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
    void fetchAgencyRoles();
  }, [fetchAgencyRoles, fetchUsers]);

  const filteredData = useMemo(() => {
    const mapped = users.map((user) => ({
      ...user,
      availability: user.balance > 0 ? "Available" : "Unavailable",
    }));
    if (filter.value === "all") return mapped;
    return mapped.filter(
      (user) => user.availability.toLowerCase() === filter.value.toLowerCase()
    );
  }, [users, filter]);

  const tableColumns = useMemo<ColumnDef<(AgentUser & { availability: string })>[]>(
    () => [
      { accessorKey: "username", header: "Username" },
      {
        id: "name",
        header: "Name",
        cell: ({ row }) =>
          `${row.original.firstName ?? ""} ${row.original.lastName ?? ""}`.trim(),
      },
      { accessorKey: "rolename", header: "Role" },
      {
        accessorKey: "availability",
        header: "Availability",
        cell: ({ row }) => {
          const availability = row.getValue<string>("availability");
          return (
            <Badge
              variant="light"
              color={availability === "Available" ? "success" : "error"}
            >
              {availability}
            </Badge>
          );
        },
      },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone_number", header: "Phone Number" },
      { accessorKey: "address", header: "Address" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-sky-500 text-white transition hover:bg-sky-600"
                title="Edit user"
                aria-label="Edit user"
                onClick={() => setEditingUser(user)}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-amber-500 text-white transition hover:bg-amber-600"
                title="Change password"
                aria-label="Change password"
                onClick={() =>
                  setPasswordState({
                    userId: user.id,
                    username: user.username,
                    password: "",
                    confirmPassword: "",
                  })
                }
              >
                <KeyRound className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-500 text-white transition hover:bg-red-600"
                title="Delete user"
                aria-label="Delete user"
                onClick={() => {
                  setDeleteState({
                    userId: user.id,
                    username: user.username,
                  });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  const handleFilterChange = (option: SingleValue<FilterOption>) => {
    if (option) setFilter(option);
  };

  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleCloseAddUserModal = () => {
    setIsAddUserModalOpen(false);
  };

  const handleSubmitUser = (formValues: AddUserFormValues) => {
    const newUser: AgentUser = {
      clientId: defaultClientId,
      id: Date.now(),
      username: formValues.username,
      code: "",
      role_id: 0,
      firstName: formValues.name,
      lastName: formValues.surname,
      phone_number: formValues.phoneNumber,
      email: formValues.email,
      rolename: formValues.userLevel || "Agent",
      balance: 0,
      address: formValues.address,
      country: "",
      state: "",
      language: "",
      currency: "",
      date_of_birth: "",
      gender: "",
    };
    setUsers((prevUsers) => [...prevUsers, newUser]);
    setIsAddUserModalOpen(false);
  };

  const submitEdit = async () => {
    if (!editingUser) return;
    setIsSavingEdit(true);
    try {
      await usersApi.updateAgentUser(String(effectiveAgentId), {
        clientId: editingUser.clientId || defaultClientId,
        id: editingUser.id,
        username: editingUser.username,
        code: editingUser.code,
        role_id: editingUser.role_id,
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        phone_number: editingUser.phone_number,
        email: editingUser.email,
        rolename: editingUser.rolename,
        balance: editingUser.balance,
      });
      toast.success("User updated successfully");
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast.error(apiError.message ?? "Failed to update user");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const submitPasswordChange = async () => {
    if (!passwordState) return;
    if (!passwordState.password || passwordState.password !== passwordState.confirmPassword) {
      toast.error("Passwords must match");
      return;
    }
    setIsSavingPassword(true);
    try {
      await usersApi.changePassword({
        password: passwordState.password,
        conf_password: passwordState.confirmPassword,
        username: passwordState.username,
        userId: passwordState.userId,
        clientId: defaultClientId,
      });
      toast.success("Password changed successfully");
      setPasswordState(null);
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast.error(apiError.message ?? "Failed to change password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const submitDeleteUser = async () => {
    if (!deleteState) return;
    setIsDeletingUser(true);
    try {
      await usersApi.removeAgentUser({
        agentId: String(effectiveAgentId),
        userId: deleteState.userId,
        type: "remove",
      });
      toast.success("User removed successfully");
      setDeleteState(null);
      await fetchUsers();
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast.error(apiError.message ?? "Failed to remove user");
    } finally {
      setIsDeletingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="w-full sm:w-[250px]">
          <Select<FilterOption>
            styles={reactSelectStyles(theme)}
            options={filterOptions}
            placeholder="All"
            value={filter}
            onChange={handleFilterChange}
          />
        </div>
        <Button
          variant="primary"
          size="md"
          className="bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
          onClick={handleAddUser}
        >
          + Add New User
        </Button>
      </div>

      <Modal isOpen={Boolean(editingUser)} onClose={() => setEditingUser(null)} size="4xl">
        <ModalHeader>Edit User</ModalHeader>
        <ModalBody className="space-y-4">
          {editingUser ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>Country</label>
                <input className={fieldClassName} value={editingUser.country ?? ""} onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, country: e.target.value } : prev))} />
              </div>
              <div>
                <label className={labelClassName}>Username</label>
                <input className={fieldClassName} value={editingUser.username} onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, username: e.target.value } : prev))} />
              </div>
              <div>
                <label className={labelClassName}>State</label>
                <input className={fieldClassName} value={editingUser.state ?? ""} onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, state: e.target.value } : prev))} />
              </div>
              <div>
                <label className={labelClassName}>User Type</label>
                <select
                  className={fieldClassName}
                  value={String(editingUser.role_id || "")}
                  onChange={(e) => {
                    const selected = roleOptions.find((role) => role.value === e.target.value);
                    setEditingUser((prev) =>
                      prev
                        ? {
                            ...prev,
                            role_id: Number(e.target.value || 0),
                            rolename: selected?.label ?? prev.rolename,
                          }
                        : prev
                    );
                  }}
                >
                  <option value="">User Type</option>
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClassName}>Language</label>
                <input className={fieldClassName} value={editingUser.language ?? ""} onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, language: e.target.value } : prev))} />
              </div>
              <div>
                <label className={labelClassName}>Email</label>
                <input className={fieldClassName} value={editingUser.email} onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, email: e.target.value } : prev))} />
              </div>
              <div>
                <label className={labelClassName}>Currency</label>
                <input className={fieldClassName} value={editingUser.currency ?? ""} onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, currency: e.target.value } : prev))} />
              </div>
              <div>
                <label className={labelClassName}>Max Payout</label>
                <input className={fieldClassName} value={String(editingUser.balance ?? 0)} onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, balance: Number(e.target.value || 0) } : prev))} />
              </div>
              <div>
                <label className={labelClassName}>Name</label>
                <input className={fieldClassName} value={editingUser.firstName} onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, firstName: e.target.value } : prev))} />
              </div>
              <div>
                <label className={labelClassName}>Surname</label>
                <input className={fieldClassName} value={editingUser.lastName} onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, lastName: e.target.value } : prev))} />
              </div>
              <div>
                <label className={labelClassName}>Date of Birth</label>
                <input className={fieldClassName} value={editingUser.date_of_birth ?? ""} onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, date_of_birth: e.target.value } : prev))} />
              </div>
              <div>
                <label className={labelClassName}>Gender</label>
                <input className={fieldClassName} value={editingUser.gender ?? ""} onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, gender: e.target.value } : prev))} />
              </div>
              <div>
                <label className={labelClassName}>Address</label>
                <input className={fieldClassName} value={editingUser.address ?? ""} onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, address: e.target.value } : prev))} />
              </div>
              <div>
                <label className={labelClassName}>Phone Number</label>
                <input className={fieldClassName} value={editingUser.phone_number} onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, phone_number: e.target.value } : prev))} />
              </div>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setEditingUser(null)}>
            Cancel
          </Button>
          <Button onClick={submitEdit} disabled={isSavingEdit}>
            {isSavingEdit ? "Saving..." : "Submit"}
          </Button>
        </ModalFooter>
      </Modal>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Agent Users List</h3>
        </div>
        <div className="p-6">
          <DataTable columns={tableColumns} data={filteredData} loading={isLoading} />
        </div>
      </div>

      <Modal isOpen={Boolean(passwordState)} onClose={() => setPasswordState(null)} size="sm">
        <ModalHeader>Change Password</ModalHeader>
        <ModalBody className="space-y-4">
          <div>
            <label className={labelClassName}>New Password</label>
            <input
              type="password"
              className={fieldClassName}
              value={passwordState?.password ?? ""}
              onChange={(e) =>
                setPasswordState((prev) =>
                  prev ? { ...prev, password: e.target.value } : prev
                )
              }
            />
          </div>
          <div>
            <label className={labelClassName}>Confirm Password</label>
            <input
              type="password"
              className={fieldClassName}
              value={passwordState?.confirmPassword ?? ""}
              onChange={(e) =>
                setPasswordState((prev) =>
                  prev ? { ...prev, confirmPassword: e.target.value } : prev
                )
              }
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setPasswordState(null)}>
            Cancel
          </Button>
          <Button onClick={submitPasswordChange} disabled={isSavingPassword}>
            {isSavingPassword ? "Changing..." : "Change Password"}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={Boolean(deleteState)} onClose={() => setDeleteState(null)} size="sm">
        <ModalHeader>Remove User</ModalHeader>
        <ModalBody className="space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to remove{" "}
            <span className="font-semibold">{deleteState?.username}</span> from this
            agent?
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteState(null)}>
            Cancel
          </Button>
          <Button variant="error" onClick={submitDeleteUser} disabled={isDeletingUser}>
            {isDeletingUser ? "Removing..." : "Remove"}
          </Button>
        </ModalFooter>
      </Modal>

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseAddUserModal}
        onSubmit={handleSubmitUser}
      />
    </div>
  );
}

export default UsersTab;
