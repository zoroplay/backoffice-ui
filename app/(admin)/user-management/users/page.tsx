"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GroupBase, MultiValue } from "react-select";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Shield,
  ShieldAlert,
  Sparkles,
  Plus,
  User,
} from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { DataTable } from "@/components/tables/DataTable";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiEnv, normalizeApiError, usersApi, agentsApi } from "@/lib/api";
import { withAuth } from "@/utils/withAuth";

import ChangePasswordModal from "./components/ChangePasswordModal";
import AddUserModal, {
  type AddUserFormValues,
} from "./components/AddUserModal";
import UserDetailsModal from "./components/UserDetailsModal";
import UserPermissionsModal from "./components/UserPermissionsModal";
import type {
  ChangePasswordPayload,
  EditableUser,
  UserDetail,
  UserFilterOption,
  UserRecord,
  UserStatus,
} from "./types";

type FilterGroup = {
  label: string;
  options: UserFilterOption[];
};

type RoleOption = {
  id: number;
  name: string;
  type: string;
  description?: string;
};

type PermissionOption = {
  id: number;
  name: string;
};

const statusTabs: Array<{ value: UserStatus; label: string }> = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "invited", label: "Invited" },
];

const actionItems = [
  {
    key: "details",
    icon: <User className="h-4 w-4" />,
    label: "View Details",
  },
  {
    key: "permissions",
    icon: <Shield className="h-4 w-4" />,
    label: "Permissions",
  },
  {
    key: "password",
    icon: <LockKeyhole className="h-4 w-4" />,
    label: "Reset Password",
  },
] as const;

function enforceSingleSelections(
  options: MultiValue<UserFilterOption>
): UserFilterOption[] {
  const deduped: UserFilterOption[] = [];
  for (const option of options) {
    const existingIndex = deduped.findIndex(
      (item) => item.group === option.group
    );
    if (existingIndex >= 0) {
      deduped[existingIndex] = option;
    } else {
      deduped.push(option);
    }
  }
  return deduped;
}

const mapStatus = (status: unknown): UserStatus => {
  const value = Number(status ?? 0);
  if (value === 1) return "active";
  if (value === 2) return "suspended";
  return "invited";
};

const parseList = <T,>(input: unknown, key: string): T[] => {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === "object") {
    const record = input as Record<string, unknown>;
    if (Array.isArray(record[key])) {
      return record[key] as T[];
    }
    if (record.data && typeof record.data === "object") {
      const nested = record.data as Record<string, unknown>;
      if (Array.isArray(nested[key])) {
        return nested[key] as T[];
      }
    }
  }
  return [];
};

const mapUserRecord = (row: Record<string, unknown>): UserRecord => {
  const details = (row.userDetails as Record<string, unknown> | undefined) ?? {};
  const role = (row.role as Record<string, unknown> | undefined) ?? {};
  const firstName = String(details.firstName ?? "").trim();
  const lastName = String(details.lastName ?? "").trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const id = Number(row.id ?? 0);
  const email = String(details.email ?? "");
  const country = String(details.country ?? "");
  const state = String(details.state ?? "");
  const location = [state, country].filter(Boolean).join(", ");

  return {
    id: String(id),
    numericId: id,
    username: String(row.username ?? ""),
    name: fullName || String(row.username ?? `User ${id}`),
    email,
    role: String(role.name ?? "Unassigned"),
    roleId: Number(role.id ?? row.roleId ?? 0) || null,
    status: mapStatus(row.status),
    lastActive: String(row.lastLogin ?? ""),
    joinedAt: String(row.createdAt ?? row.lastLogin ?? ""),
    phone: String(details.phone ?? ""),
    location,
    permissions: [],
    teams: [],
    country,
    state,
    language: String(details.language ?? ""),
    currency: String(details.currency ?? ""),
    gender: String(details.gender ?? ""),
    address: String(details.address ?? ""),
  };
};

function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionsList, setPermissionsList] = useState<PermissionOption[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);

  const [selectedFilters, setSelectedFilters] = useState<UserFilterOption[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<UserFilterOption[]>([]);
  const [activeTab, setActiveTab] = useState<UserStatus | "all">("all");

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const roleNameToId = useMemo(() => {
    const map = new Map<string, number>();
    roles.forEach((role) => map.set(role.name, role.id));
    return map;
  }, [roles]);

  const userLevelOptions = useMemo(
    () => roles.map((role) => role.name).filter(Boolean),
    [roles]
  );

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const response = await usersApi.getUsers(Number(apiEnv.clientId));
      const raw = parseList<Record<string, unknown>>(response, "data");
      const mapped = raw.map((item) => mapUserRecord(item));
      setUsers(mapped);
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to fetch users");
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const fetchRolesAndPermissions = useCallback(async () => {
    try {
      const [rolesResponse, agencyRolesResponse, permissionsResponse] =
        await Promise.all([
          usersApi.getRoles(),
          agentsApi.getAgencyRoles().catch(() => null),
          usersApi.getPermissions(),
        ]);

      const allRoles = [
        ...parseList<Record<string, unknown>>(rolesResponse, "data"),
        ...parseList<Record<string, unknown>>(agencyRolesResponse, "data"),
      ];

      const dedupedRoles = Array.from(
        new Map(
          allRoles.map((role) => [
            Number(role.id ?? 0),
            {
              id: Number(role.id ?? 0),
              name: String(role.name ?? ""),
              type: String(role.type ?? "admin"),
              description: String(role.description ?? ""),
            },
          ])
        ).values()
      ).filter((role) => role.id > 0 && role.name);

      const parsedPermissions = parseList<Record<string, unknown>>(
        permissionsResponse,
        "data"
      )
        .map((item) => ({
          id: Number(item.id ?? 0),
          name: String(item.name ?? ""),
        }))
        .filter((item) => item.id > 0 && item.name);

      setRoles(dedupedRoles);
      setPermissionsList(parsedPermissions);
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to fetch roles and permissions");
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
    void fetchRolesAndPermissions();
  }, [fetchRolesAndPermissions, fetchUsers]);

  const filterGroups = useMemo<FilterGroup[]>(
    () => [
      {
        label: "Roles",
        options: roles.map((role) => ({
          label: role.name,
          value: role.name,
          group: "role" as const,
        })),
      },
    ],
    [roles]
  );

  const handleFilterChange = (options: MultiValue<UserFilterOption>) => {
    setSelectedFilters(enforceSingleSelections(options));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(selectedFilters);
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
    setAppliedFilters([]);
  };

  const closeAllModals = () => {
    setIsDetailsModalOpen(false);
    setIsPermissionsModalOpen(false);
    setIsPasswordModalOpen(false);
    setSelectedUser(null);
  };

  const openDetailsModal = async (user: UserRecord) => {
    try {
      const response = await usersApi.getSingleUser(user.numericId);
      const singlePayload = parseList<Record<string, unknown>>(response, "data")[0];
      if (singlePayload) {
        setSelectedUser(mapUserRecord(singlePayload));
      } else {
        setSelectedUser(user);
      }
    } catch {
      setSelectedUser(user);
    } finally {
      setIsDetailsModalOpen(true);
    }
  };

  const handleOpenPermissions = (user: UserRecord) => {
    setSelectedUser(user);
    setIsPermissionsModalOpen(true);
  };

  const handleOpenPasswordModal = (user: UserRecord) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleManageAccess = () => {
    const userId = selectedUser?.id;
    const targetPath = userId
      ? `/user-management/roles-permissions?userId=${encodeURIComponent(userId)}`
      : "/user-management/roles-permissions";
    router.push(targetPath);
    closeAllModals();
  };

  const handleChangePassword = async (
    password: ChangePasswordPayload["password"],
    confirmPassword: ChangePasswordPayload["confirmPassword"]
  ) => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await usersApi.changePassword({
        password,
        conf_password: confirmPassword,
        username: selectedUser.username,
        userId: selectedUser.numericId,
        clientId: Number(apiEnv.clientId),
      });
      toast.success("Password updated successfully");
      closeAllModals();
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveUser = async (updatedUser: UserDetail & EditableUser) => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const [firstName, ...lastNameParts] = (updatedUser.name || "").split(" ");
      await usersApi.updateUser({
        country: updatedUser.country ?? "",
        state: updatedUser.state ?? "",
        language: updatedUser.language ?? "EN",
        currency: updatedUser.currency || null,
        firstName: firstName || selectedUser.name,
        lastName: lastNameParts.join(" "),
        gender: updatedUser.gender ?? "",
        address: updatedUser.address ?? "",
        username: selectedUser.username,
        password: "",
        email: updatedUser.email ?? "",
        balance: "",
        roleId:
          roleNameToId.get(updatedUser.role) ??
          selectedUser.roleId ??
          roleNameToId.get(selectedUser.role),
        parentId: "",
        clientId: Number(apiEnv.clientId),
        userId: selectedUser.numericId,
      });
      toast.success("User updated successfully");
      closeAllModals();
      await fetchUsers();
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = () => {
    toast.error("Delete user endpoint is not available.");
  };

  const handleAddUser = async (values: AddUserFormValues) => {
    setIsSubmitting(true);
    try {
      const firstName = values.name.trim();
      const lastName = values.surname.trim();
      const roleId = roleNameToId.get(values.userLevel) ?? 0;
      if (!roleId) {
        toast.error("Select a valid user level.");
        return;
      }

      await usersApi.addUser({
        country: values.country,
        state: values.state,
        language: values.language === "English" ? "EN" : values.language,
        currency: values.currency,
        firstName,
        lastName,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        address: values.address,
        phoneNumber: values.phoneNumber,
        username: values.username,
        password: values.password,
        email: values.email,
        balance: values.openingBalance,
        roleId,
        parentId: values.parentUser,
        clientId: Number(apiEnv.clientId),
        date_of_birth: values.dateOfBirth,
        parent_agent: values.parentUser,
      });

      toast.success("User created successfully");
      setIsAddUserModalOpen(false);
      await fetchUsers();
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesTab = activeTab === "all" ? true : user.status === activeTab;
      const matchesFilters = appliedFilters.every((filter) => {
        if (filter.group === "role") {
          return user.role === filter.value;
        }
        return true;
      });

      return matchesTab && matchesFilters;
    });
  }, [activeTab, appliedFilters, users]);

  const summary = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => user.status === "active").length;
    const suspended = users.filter((user) => user.status === "suspended").length;
    const invited = users.filter((user) => user.status === "invited").length;
    return { total, active, suspended, invited };
  }, [users]);

  const columns = useMemo<ColumnDef<UserRecord>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <div className="flex items-center gap-3 text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-brand-500/10 text-sm font-semibold text-brand-700 shadow-sm dark:border-gray-700 dark:bg-brand-500/20 dark:text-brand-200">
              {(row.original.name || row.original.username || "U")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("") || "U"}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {row.original.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {row.original.email || row.original.username}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge
            color="primary"
            variant="light"
            size="sm"
            startIcon={<Shield size={14} />}
            className="text-xs font-semibold uppercase tracking-wide"
          >
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const statusConfig: Record<
            UserStatus,
            { color: "success" | "error" | "primary"; icon: React.ReactNode }
          > = {
            active: {
              color: "success",
              icon: <CheckCircle2 size={14} />,
            },
            suspended: {
              color: "error",
              icon: <ShieldAlert size={14} />,
            },
            invited: {
              color: "primary",
              icon: <Sparkles size={14} />,
            },
          };
          const config = statusConfig[status];
          return (
            <Badge
              color={config.color}
              variant="light"
              size="sm"
              startIcon={config.icon}
              className="text-xs font-semibold uppercase"
            >
              {status.toUpperCase()}
            </Badge>
          );
        },
      },
      {
        accessorKey: "lastActive",
        header: "Last Active",
        cell: ({ row }) => (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-200">
              <Clock3 className="h-3.5 w-3.5 text-brand-500" />
              {row.original.lastActive
                ? new Date(row.original.lastActive).toLocaleString()
                : "N/A"}
            </p>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            {actionItems.map((action) => (
              <button
                key={action.key}
                type="button"
                title={action.label}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-brand-200 hover:bg-brand-500/10 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-500/40 dark:hover:text-brand-300"
                onClick={() => {
                  if (action.key === "details") {
                    void openDetailsModal(row.original);
                  } else if (action.key === "permissions") {
                    handleOpenPermissions(row.original);
                  } else if (action.key === "password") {
                    handleOpenPasswordModal(row.original);
                  }
                }}
              >
                {action.icon}
              </button>
            ))}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="User Management · Users" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Platform Users
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review roles, trace activity, and manage secure access across the back office.
            </p>
          </div>
          <Button
            startIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsAddUserModalOpen(true)}
          >
            Add User
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Team
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {summary.total}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Across all departments</p>
          </div>
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-500/5 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-200">
              Active
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-200">
              {summary.active}
            </p>
            <p className="text-xs text-emerald-500/80 dark:text-emerald-200/70">
              Logged within last 7 days
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-500/5 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-200">
              Suspended
            </p>
            <p className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-200">
              {summary.suspended}
            </p>
            <p className="text-xs text-rose-500/80 dark:text-rose-200/80">
              Awaiting compliance review
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-500/5 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-200">
              Invitations
            </p>
            <p className="mt-2 text-2xl font-semibold text-indigo-600 dark:text-indigo-200">
              {summary.invited}
            </p>
            <p className="text-xs text-indigo-500/80 dark:text-indigo-200/70">
              Pending onboarding actions
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as UserStatus | "all")}
          className="mt-6"
        >
          <TabsList className="flex w-full flex-wrap items-center gap-2 rounded-full border border-gray-100 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            {[
              { value: "all", label: "All" },
              ...statusTabs.map((status) => ({
                value: status.value,
                label: status.label,
              })),
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 transition data-[state=active]:bg-brand-500 data-[state=active]:text-white dark:text-gray-400 dark:data-[state=active]:bg-brand-400 dark:data-[state=active]:text-gray-950"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-6">
            <TableFilterToolbar<UserFilterOption, true, GroupBase<UserFilterOption>>
              selectProps={{
                options: filterGroups,
                value: selectedFilters,
                onChange: handleFilterChange,
                isMulti: true,
                closeMenuOnSelect: false,
                hideSelectedOptions: false,
                placeholder: "Filter by Role",
                containerClassName: "max-w-[18rem]",
              }}
              actions={{
                onSearch: handleApplyFilters,
                onClear: handleClearFilters,
              }}
            />

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Users ({filteredUsers.length})
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select an icon to view profile, adjust permissions, or reset password.
                  </p>
                </div>
                <Badge variant="light" color="info" size="sm">
                  {users.length} total records
                </Badge>
              </div>

              <DataTable
                columns={columns}
                data={filteredUsers}
                loading={isLoadingUsers}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        user={selectedUser ? ({ ...selectedUser } as UserDetail & EditableUser) : null}
        onSave={handleSaveUser}
        onDelete={handleDeleteUser}
        onClose={closeAllModals}
      />

      <UserPermissionsModal
        isOpen={isPermissionsModalOpen}
        userName={selectedUser?.name ?? null}
        grantedPermissions={selectedUser?.permissions ?? []}
        availablePermissions={permissionsList.map((permission) => permission.name)}
        onManageAccess={handleManageAccess}
        onClose={closeAllModals}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        userName={selectedUser?.name ?? null}
        onClose={closeAllModals}
        onSubmit={handleChangePassword}
      />

      <AddUserModal
        isOpen={isAddUserModalOpen}
        userLevelOptions={userLevelOptions}
        onClose={() => setIsAddUserModalOpen(false)}
        onSubmit={handleAddUser}
      />

      {isSubmitting ? <div className="sr-only">Submitting...</div> : null}
    </div>
  );
}

export default withAuth(UsersPage);
