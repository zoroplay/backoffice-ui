"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ActionMeta, GroupBase, MultiValue } from "react-select";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  Plus,
  User,
} from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { TableFilterToolbar } from "@/components/common/TableFilterToolbar";
import { DataTable } from "@/components/tables/DataTable";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAuth } from "@/utils/withAuth";

import ChangePasswordModal from "./components/ChangePasswordModal";
import AddUserModal, {
  type AddUserFormValues,
} from "./components/AddUserModal";
import UserDetailsModal from "./components/UserDetailsModal";
import UserPermissionsModal from "./components/UserPermissionsModal";
import {
  userFilterGroups,
  userRoles,
  userStatuses,
  usersSeed,
} from "./data";
import type {
  ChangePasswordPayload,
  EditableUser,
  UserDetail,
  UserFilterOption,
  UserRecord,
} from "./types";

type FilterGroupKey = UserFilterOption["group"];

type FilterGroup = {
  label: string;
  options: UserFilterOption[];
};

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

const USERS_STORAGE_KEY = "backoffice-users";

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

function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UserRecord[]>(usersSeed);
  const [isUsersHydrated, setIsUsersHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UserRecord[];
        setUsers(parsed);
        setIsUsersHydrated(true);
        return;
      } catch (error) {
        console.warn("Failed to parse stored users; falling back to seed data.", error);
      }
    } else {
      window.localStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(usersSeed)
      );
    }

    setIsUsersHydrated(true);
  }, []);

  useEffect(() => {
    if (!isUsersHydrated || typeof window === "undefined") return;
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [isUsersHydrated, users]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === USERS_STORAGE_KEY && event.newValue) {
        try {
          setUsers(JSON.parse(event.newValue) as UserRecord[]);
        } catch (error) {
          console.warn("Failed to sync users from storage event.", error);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const [selectedFilters, setSelectedFilters] = useState<UserFilterOption[]>(
    []
  );
  const [appliedFilters, setAppliedFilters] = useState<UserFilterOption[]>([]);
  const [activeTab, setActiveTab] = useState<UserRecord["status"] | "all">(
    "all"
  );

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

const filterGroups = useMemo<FilterGroup[]>(() => {
    return [
      {
        label: "Roles",
        options: userFilterGroups.filter((option) => option.group === "role"),
      },
    ];
  }, []);

  const handleFilterChange = (
    options: MultiValue<UserFilterOption>,
    _meta: ActionMeta<UserFilterOption>
  ) => {
    const deduped = enforceSingleSelections(options);
    setSelectedFilters(deduped);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(selectedFilters);
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
    setAppliedFilters([]);
  };

  const handleOpenDetails = (user: UserRecord) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleOpenPermissions = (user: UserRecord) => {
    setSelectedUser(user);
    setIsPermissionsModalOpen(true);
  };

  const handleOpenPasswordModal = (user: UserRecord) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const closeAllModals = () => {
    setIsDetailsModalOpen(false);
    setIsPermissionsModalOpen(false);
    setIsPasswordModalOpen(false);
    setSelectedUser(null);
  };

  const handleManageAccess = () => {
    const userId = selectedUser?.id;
    const targetPath = userId
      ? `/user-management/roles-permissions?userId=${encodeURIComponent(userId)}`
      : "/user-management/roles-permissions";

    router.push(targetPath);
    closeAllModals();
  };

  const handleChangePassword = (
    password: ChangePasswordPayload["password"],
    confirmPassword: ChangePasswordPayload["confirmPassword"]
  ) => {
    // In production we'd dispatch a request; for now we just close the modal
    console.info("Password reset:", {
      userId: selectedUser?.id,
      password,
      confirmPassword,
    });
    closeAllModals();
  };

  const handleSaveUser = (updatedUser: UserDetail & EditableUser) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === updatedUser.id
          ? { ...user, ...updatedUser }
          : user
      )
    );
    closeAllModals();
  };

  const handleDeleteUser = (userId: string) => {
    const confirmed = window.confirm("Delete this user? This action cannot be undone.");
    if (!confirmed) return;
    setUsers((prev) => prev.filter((user) => user.id !== userId));
    closeAllModals();
  };

  const handleAddUser = (values: AddUserFormValues) => {
    const newUser: UserRecord = {
      id: `USR-${Date.now()}`,
      name: `${values.name} ${values.surname}`.trim() || values.username,
      email: values.email,
      role:
        (values.userLevel as UserRecord["role"]) ??
        "Customer Support",
      status: "invited",
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      avatar: `/images/user/user-${(Math.floor(Math.random() * 37) + 1).toString()}.jpg`,
      phone: values.phoneNumber || "+234 801 234 5678",
      location: `${values.state || "Lagos"}, ${values.country || "Nigeria"}`,
      permissions: ["View Reports"],
      teams: [],
    };
    setUsers((prev) => [newUser, ...prev]);
    setIsAddUserModalOpen(false);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesTab = activeTab === "all" ? true : user.status === activeTab;
      const matchesFilters = appliedFilters.every((filter) => {
        if (filter.group === "status") {
          return user.status === filter.value;
        }
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

  const columns = useMemo<ColumnDef<UserRecord>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "User",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <div className="flex items-center gap-3 text-left">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gray-200 shadow-sm dark:border-gray-700">
              <Image
                src={row.original.avatar}
                alt={row.original.name}
                fill
                sizes="48px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {row.original.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {row.original.email}
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
            string,
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
          const config = statusConfig[status] ?? statusConfig.active;
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
              {new Date(row.original.lastActive).toLocaleString()}
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
                    handleOpenDetails(row.original);
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
            <button
              type="button"
              title="Delete User"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-red-200 hover:bg-red-500/10 hover:text-red-600 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-red-500/40 dark:hover:text-red-300"
              onClick={() => handleDeleteUser(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ];
  }, []);

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
          onValueChange={(value) =>
            setActiveTab(value as UserRecord["status"] | "all")
          }
          className="mt-6"
        >
          <TabsList className="flex w-full flex-wrap items-center gap-2 rounded-full border border-gray-100 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            {[
              { value: "all", label: "All" },
              ...userStatuses.map((status) => ({
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

              <DataTable columns={columns} data={filteredUsers} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        user={
          selectedUser
            ? ({
                ...selectedUser,
              } as UserDetail & EditableUser)
            : null
        }
        onSave={handleSaveUser}
        onDelete={handleDeleteUser}
        onClose={closeAllModals}
      />

      <UserPermissionsModal
        isOpen={isPermissionsModalOpen}
        userName={selectedUser?.name ?? null}
        grantedPermissions={selectedUser?.permissions ?? []}
        availablePermissions={[
          "Export Reports",
          "Configure Payment Methods",
          "Manage Bonus Campaigns",
          "View VIP Accounts",
        ]}
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
        onClose={() => setIsAddUserModalOpen(false)}
        onSubmit={handleAddUser}
      />
    </div>
  );
}

export default withAuth(UsersPage);

