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
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { normalizeApiError, usersApi } from "@/lib/api";
import { withAuth } from "@/utils/withAuth";

import PermissionFormModal from "./components/PermissionFormModal";
import RoleFormModal from "./components/RoleFormModal";
import AssignPermissionModal from "./components/AssignPermissionModal";
import type {
  PermissionFormValues,
  PermissionRecord,
  RoleFormValues,
  RoleRecord,
} from "./types";
import type { UserRecord } from "../users/types";

const mapRoleType = (input: unknown): "admin" | "agency" | "player" => {
  const type = String(input ?? "admin").toLowerCase();
  if (type === "agency" || type === "player") return type;
  return "admin";
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
  const country = String(details.country ?? "");
  const state = String(details.state ?? "");
  const location = [state, country].filter(Boolean).join(", ");
  const status = Number(row.status ?? 0);

  return {
    id: String(id),
    numericId: id,
    username: String(row.username ?? ""),
    name: fullName || String(row.username ?? `User ${id}`),
    email: String(details.email ?? ""),
    role: String(role.name ?? "Unassigned"),
    roleId: Number(role.id ?? row.roleId ?? 0) || null,
    status: status === 1 ? "active" : status === 2 ? "suspended" : "invited",
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

function RolesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [userRecords, setUserRecords] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleRecord | null>(null);
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionRecord | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignUser, setAssignUser] = useState<UserRecord | null>(null);
  const [preselectPermission, setPreselectPermission] = useState<string | null>(
    null
  );

  const loadPageData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersResponse, rolesResponse, agencyRolesResponse, permissionsResponse] =
        await Promise.all([
          usersApi.getUsers(),
          usersApi.getRoles(),
          usersApi.getAgencyRoles().catch(() => null),
          usersApi.getPermissions(),
        ]);

      const users = parseList<Record<string, unknown>>(usersResponse, "data").map(
        (item) => mapUserRecord(item)
      );
      setUserRecords(users);

      const allRoleRows = [
        ...parseList<Record<string, unknown>>(rolesResponse, "data"),
        ...parseList<Record<string, unknown>>(agencyRolesResponse, "data"),
      ];

      const memberCountByRoleName = users.reduce<Record<string, number>>(
        (acc, user) => {
          const roleName = user.role || "Unassigned";
          acc[roleName] = (acc[roleName] ?? 0) + 1;
          return acc;
        },
        {}
      );

      const mappedRoles = Array.from(
        new Map(
          allRoleRows.map((role) => {
            const name = String(role.name ?? "");
            const id = Number(role.id ?? 0);
            return [
              id,
              {
                id,
                name,
                type: mapRoleType(role.type),
                description: String(role.description ?? ""),
                permissions: [],
                members: memberCountByRoleName[name] ?? 0,
              } satisfies RoleRecord,
            ];
          })
        ).values()
      ).filter((role) => Number(role.id) > 0 && role.name);

      const mappedPermissions = parseList<Record<string, unknown>>(
        permissionsResponse,
        "data"
      )
        .map((permission) => ({
          id: Number(permission.id ?? 0),
          name: String(permission.name ?? ""),
          category: "General",
          description: "",
          isCore: false,
        }))
        .filter((permission) => Number(permission.id) > 0 && permission.name);

      setRoles(mappedRoles);
      setPermissions(mappedPermissions);
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to load roles and permissions");
      setRoles([]);
      setPermissions([]);
      setUserRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

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
    if (userRecords.length === 0) return;
    const userId = searchParams.get("userId");
    if (!userId) return;

    const targetUser = userRecords.find((record) => record.id === userId);
    if (!targetUser) return;

    setActiveTab("permissions");
    setAssignUser(targetUser);
    setPreselectPermission(null);
    setIsAssignModalOpen(true);
  }, [searchParams, userRecords]);

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

  const handleAssignPermissions = useCallback(() => {
    toast.success("Permission assignment endpoint is not available yet.");
    handleCloseAssignModal();
  }, [handleCloseAssignModal]);

  const closeModals = () => {
    setIsRoleModalOpen(false);
    setIsPermissionModalOpen(false);
    setSelectedRole(null);
    setSelectedPermission(null);
  };

  const handleSaveRole = async (values: RoleFormValues) => {
    setIsSubmitting(true);
    try {
      await usersApi.upsertRole({
        name: values.name,
        type: values.type,
        description: values.description,
        roleID: selectedRole ? selectedRole.id : "",
      });
      toast.success(selectedRole ? "Role updated" : "Role created");
      closeModals();
      await loadPageData();
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to save role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = () => {
    toast.error("Delete role endpoint is not available.");
  };

  const handleSavePermission = async (values: PermissionFormValues) => {
    setIsSubmitting(true);
    try {
      await usersApi.upsertPermission({
        name: values.name,
        id: selectedPermission ? selectedPermission.id : undefined,
      });
      toast.success(selectedPermission ? "Permission updated" : "Permission created");
      closeModals();
      await loadPageData();
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast.error(apiError.message ?? "Failed to save permission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePermission = () => {
    toast.error("Delete permission endpoint is not available.");
  };

  const roleColumns = useMemo<ColumnDef<RoleRecord>[]>(
    () => [
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
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        meta: { cellClassName: "text-left" },
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {row.original.description || "-"}
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
              onClick={handleDeleteRole}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const permissionColumns = useMemo<ColumnDef<PermissionRecord>[]>(
    () => [
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
            {row.original.description || "-"}
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
              onClick={handleDeletePermission}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [openAssignModal]
  );

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
              Managed via API
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
          onValueChange={(value) => setActiveTab(value as "roles" | "permissions")}
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
              <DataTable columns={roleColumns} data={roles} loading={isLoading} />
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
              <DataTable
                columns={permissionColumns}
                data={permissions}
                loading={isLoading}
              />
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

      {isSubmitting ? <div className="sr-only">Submitting...</div> : null}
    </div>
  );
}

export default withAuth(RolesPage);
