"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  CheckSquare,
  Key,
  Lock,
  PenSquare,
  Plus,
  Shield,
  ShieldPlus,
  Trash2,
  Users,
} from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { withAuth } from "@/utils/withAuth";

import PermissionFormModal from "./components/PermissionFormModal";
import RoleFormModal from "./components/RoleFormModal";
import AssignPermissionModal from "./components/AssignPermissionModal";
import { permissionsSeed, rolesSeed } from "./data";
import type {
  PermissionFormValues,
  PermissionRecord,
  RoleFormValues,
  RoleRecord,
} from "./types";
import { usersSeed } from "../users/data";
import type { UserRecord } from "../users/types";

const USERS_STORAGE_KEY = "backoffice-users";

function RolesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [roles, setRoles] = useState<RoleRecord[]>(rolesSeed);
  const [permissions, setPermissions] =
    useState<PermissionRecord[]>(permissionsSeed);
  const [userRecords, setUserRecords] = useState<UserRecord[]>(usersSeed);

  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleRecord | null>(null);
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionRecord | null>(null);
  const [isUsersHydrated, setIsUsersHydrated] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignUser, setAssignUser] = useState<UserRecord | null>(null);
  const [preselectPermission, setPreselectPermission] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers) as UserRecord[];
        setUserRecords(parsed);
        setIsUsersHydrated(true);
        return;
      } catch (error) {
        console.warn("Failed to parse stored users; using seed data.", error);
      }
    } else {
      window.localStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(usersSeed)
      );
    }

    setUserRecords(usersSeed);
    setIsUsersHydrated(true);
  }, []);

  useEffect(() => {
    if (!isUsersHydrated || typeof window === "undefined") return;
    window.localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(userRecords)
    );
  }, [isUsersHydrated, userRecords]);

  useEffect(() => {
    if (!isUsersHydrated) return;
    setRoles((prev) =>
      prev.map((role) => ({
        ...role,
        members: userRecords.filter((user) => user.role === role.name).length,
      }))
    );
  }, [isUsersHydrated, userRecords]);

  const clearManageAccessQuery = useCallback(() => {
    if (typeof window === "undefined") return;
    const currentParams = new URLSearchParams(window.location.search);
    if (!currentParams.has("userId")) return;

    currentParams.delete("userId");
    const queryString = currentParams.toString();
    router.replace(
      `/user-management/roles-permissions${
        queryString ? `?${queryString}` : ""
      }`,
      { scroll: false }
    );
  }, [router]);

  useEffect(() => {
    if (!isUsersHydrated || userRecords.length === 0) return;
    const userId = searchParams.get("userId");
    if (!userId) return;

    const targetUser = userRecords.find((record) => record.id === userId);
    if (!targetUser) return;

    setActiveTab("permissions");
    setAssignUser(targetUser);
    setPreselectPermission(null);
    setIsAssignModalOpen(true);
  }, [isUsersHydrated, searchParams, userRecords]);

  const openAssignModal = useCallback(
    (user: UserRecord | null = null, permissionName: string | null = null) => {
      setAssignUser(user);
      setPreselectPermission(permissionName);
      setIsAssignModalOpen(true);
    },
    []
  );

  const handleCloseAssignModal = useCallback(() => {
    setIsAssignModalOpen(false);
    setAssignUser(null);
    setPreselectPermission(null);
    clearManageAccessQuery();
  }, [clearManageAccessQuery]);

  const handleAssignPermissions = useCallback(
    ({ userId, permissions: updatedPermissions }: {
      userId: string;
      permissions: string[];
    }) => {
      const uniquePermissions = Array.from(new Set(updatedPermissions));

      setUserRecords((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                permissions: uniquePermissions,
              }
            : user
        )
      );

      setAssignUser((prev) =>
        prev && prev.id === userId
          ? {
              ...prev,
              permissions: uniquePermissions,
            }
          : prev
      );

      setIsAssignModalOpen(false);
      setPreselectPermission(null);
      clearManageAccessQuery();
      if (typeof window !== "undefined") {
        window.alert("Permissions updated for the selected user.");
      }
    },
    [clearManageAccessQuery]
  );

  const closeModals = () => {
    setIsRoleModalOpen(false);
    setIsPermissionModalOpen(false);
    setSelectedRole(null);
    setSelectedPermission(null);
  };

  const handleSaveRole = (values: RoleFormValues) => {
    if (selectedRole) {
      setRoles((prev) =>
        prev.map((role) =>
          role.id === selectedRole.id ? { ...role, ...values } : role
        )
      );
    } else {
      const newRole: RoleRecord = {
        id: `role-${Date.now()}`,
        name: values.name,
        type: values.type,
        description: values.description,
        permissions: [],
        members: 0,
      };
      setRoles((prev) => [newRole, ...prev]);
    }
    closeModals();
  };

  const handleDeleteRole = (roleId: string) => {
    const confirmed = window.confirm(
      "Delete this role? Users assigned to it will lose access until reassigned."
    );
    if (!confirmed) return;
    setRoles((prev) => prev.filter((role) => role.id !== roleId));
  };

  const handleSavePermission = (values: PermissionFormValues) => {
    if (selectedPermission) {
      setPermissions((prev) =>
        prev.map((permission) =>
          permission.id === selectedPermission.id
            ? { ...permission, ...values }
            : permission
        )
      );
    } else {
      const newPermission: PermissionRecord = {
        id: `perm-${Date.now()}`,
        ...values,
      };
      setPermissions((prev) => [newPermission, ...prev]);
    }
    closeModals();
  };

  const handleDeletePermission = (permissionId: string) => {
    const confirmed = window.confirm(
      "Delete this permission? It will be removed from all roles."
    );
    if (!confirmed) return;
    setPermissions((prev) =>
      prev.filter((permission) => permission.id !== permissionId)
    );
    setRoles((prev) =>
      prev.map((role) => ({
        ...role,
        permissions: role.permissions.filter(
          (permission) => permission !== permissionId
        ),
      }))
    );
  };

  const roleColumns = useMemo<ColumnDef<RoleRecord>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "Role",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <div className="flex items-center gap-3 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-200">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {row.original.name}
              </p>
              <p className="text-xs capitalize text-gray-500 dark:text-gray-400">
                {row.original.type} role
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "members",
        header: "Members",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {row.original.members}
          </span>
        ),
      },
      {
        accessorKey: "permissions",
        header: "Permissions",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5">
            {row.original.permissions.length > 0 ? (
              row.original.permissions.slice(0, 4).map((permission) => (
                <Badge
                  key={`${row.original.id}-${permission}`}
                  variant="light"
                  color="primary"
                  size="sm"
                >
                  {permission}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                No permissions assigned
              </span>
            )}
            {row.original.permissions.length > 4 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                +{row.original.permissions.length - 4} more
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {row.original.description}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <button
              type="button"
              title="Edit Role"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-brand-200 hover:bg-brand-500/10 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-500/40 dark:hover:text-brand-300"
              onClick={() => {
                setSelectedRole(row.original);
                setIsRoleModalOpen(true);
              }}
            >
              <PenSquare className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Permissions"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-indigo-200 hover:bg-indigo-500/10 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-500/40 dark:hover:text-indigo-300"
              onClick={() => setActiveTab("permissions")}
            >
              <Key className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Delete Role"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-red-200 hover:bg-red-500/10 hover:text-red-600 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-red-500/40 dark:hover:text-red-300"
              onClick={() => handleDeleteRole(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ];
  }, []);

  const permissionColumns = useMemo<ColumnDef<PermissionRecord>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "Permission",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <div className="flex items-center gap-3 text-left">
            <CheckSquare className="h-4 w-4 text-brand-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {row.original.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {row.original.category}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {row.original.description}
          </span>
        ),
      },
      {
        accessorKey: "isCore",
        header: "Core",
        cell: ({ row }) =>
          row.original.isCore ? (
            <Badge variant="light" color="error" size="sm">
              <Lock className="mr-1 h-3 w-3" />
              Required
            </Badge>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Optional
            </span>
          ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <button
              type="button"
              title="Assign to User"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-emerald-200 hover:bg-emerald-500/10 hover:text-emerald-600 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-emerald-500/40 dark:hover:text-emerald-300"
              onClick={() => openAssignModal(null, row.original.name)}
            >
              <ShieldPlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Edit Permission"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-brand-200 hover:bg-brand-500/10 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-500/40 dark:hover:text-brand-300"
              onClick={() => {
                setSelectedPermission(row.original);
                setIsPermissionModalOpen(true);
              }}
            >
              <PenSquare className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Delete Permission"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-red-200 hover:bg-red-500/10 hover:text-red-600 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-red-500/40 dark:hover:text-red-300"
              onClick={() => handleDeletePermission(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ];
  }, [openAssignModal]);

  const totalRoles = roles.length;
  const totalPermissions = permissions.length;
  const adminRoles = roles.filter((role) => role.type === "admin").length;
  const agencyRoles = roles.filter((role) => role.type === "agency").length;

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="User Management · Roles & Permissions" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Access Control
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Model duties around job functions and grant only the access each role needs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeTab === "roles" && (
              <Button
                startIcon={<Users className="h-4 w-4" />}
                onClick={() => {
                  setSelectedRole(null);
                  setIsRoleModalOpen(true);
                }}
              >
                New Role
              </Button>
            )}
            {activeTab === "permissions" && (
              <Button
                startIcon={<Plus className="h-4 w-4" />}
                onClick={() => {
                  setSelectedPermission(null);
                  setIsPermissionModalOpen(true);
                }}
              >
                New Permission
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Roles
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {totalRoles}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {adminRoles} admin · {agencyRoles} agency
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-500/5 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-200">
              Permissions
            </p>
            <p className="mt-2 text-2xl font-semibold text-brand-600 dark:text-brand-200">
              {totalPermissions}
            </p>
            <p className="text-xs text-brand-500/80 dark:text-brand-200/70">
              {permissions.filter((item) => item.isCore).length} core, cannot be removed
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-500/5 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-200">
              Avg Permissions / Role
            </p>
            <p className="mt-2 text-2xl font-semibold text-indigo-600 dark:text-indigo-200">
              {Math.round(
                roles.reduce((total, role) => total + role.permissions.length, 0) /
                  Math.max(totalRoles, 1)
              )}
            </p>
            <p className="text-xs text-indigo-500/80 dark:text-indigo-200/70">
              Keep roles lean and task-oriented
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-500/5 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-200">
              Pending Reviews
            </p>
            <p className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-200">
              {permissions.filter((permission) => !permission.isCore).length}
            </p>
            <p className="text-xs text-rose-500/80 dark:text-rose-200/70">
              Optional perms to review regularly
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "roles" | "permissions")
          }
          className="mt-6"
        >
          <TabsList className="flex w-full flex-wrap items-center gap-2 rounded-full border border-gray-100 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <TabsTrigger
              value="roles"
              className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 transition data-[state=active]:bg-brand-500 data-[state=active]:text-white dark:text-gray-400 dark:data-[state=active]:bg-brand-400 dark:data-[state=active]:text-gray-950"
            >
              Roles
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 transition data-[state=active]:bg-brand-500 data-[state=active]:text-white dark:text-gray-400 dark:data-[state=active]:bg-brand-400 dark:data-[state=active]:text-gray-950"
            >
              Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="mt-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Roles ({roles.length})
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Keep responsibilities aligned with least-privilege access.
                  </p>
                </div>
                <Badge variant="light" color="info" size="sm">
                  {roles.length} total records
                </Badge>
              </div>
              <DataTable columns={roleColumns} data={roles} />
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Permissions ({permissions.length})
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Track all actions available in the platform and who owns them.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="light" color="info" size="sm">
                    {permissions.filter((permission) => permission.isCore).length} core ·{" "}
                    {permissions.length} total
                  </Badge>
                  <Button
                    variant="outline"
                    startIcon={<ShieldPlus className="h-4 w-4" />}
                    onClick={() => openAssignModal()}
                  >
                    Assign Permissions
                  </Button>
                </div>
              </div>
              <DataTable columns={permissionColumns} data={permissions} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AssignPermissionModal
        isOpen={isAssignModalOpen}
        users={userRecords}
        user={assignUser}
        permissions={permissions}
        defaultPermission={preselectPermission ?? undefined}
        onSubmit={handleAssignPermissions}
        onClose={handleCloseAssignModal}
      />

      <RoleFormModal
        isOpen={isRoleModalOpen}
        role={selectedRole}
        onSubmit={handleSaveRole}
        onClose={closeModals}
      />

      <PermissionFormModal
        isOpen={isPermissionModalOpen}
        permission={selectedPermission}
        onSubmit={handleSavePermission}
        onClose={closeModals}
      />
    </div>
  );
}

export default withAuth(RolesPage);

