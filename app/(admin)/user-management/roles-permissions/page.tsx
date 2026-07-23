"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withAuth } from "@/utils/withAuth";

import {
  assignRolePermissions,
  deletePermission,
  deleteRole,
  fetchPermissions,
  fetchRoles,
  savePermission,
  saveRole,
  type PermissionFormValue,
  type PermissionRecord,
  type RoleFormValue,
  type RoleRecord,
  type RoleType,
} from "./api";

type ActiveTab = "roles" | "permissions";

const roleTypeOptions: Array<{ value: RoleType; label: string }> = [
  { value: "admin", label: "Admin" },
  { value: "agency", label: "Agency" },
  { value: "player", label: "Player" },
];

const blankRoleForm: RoleFormValue = {
  name: "",
  description: "",
  type: "",
};

const blankPermissionForm: PermissionFormValue = {
  name: "",
};

function cardClassName() {
  return "rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900";
}

function selectClassName() {
  return "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800";
}

function tableHeadClassName() {
  return "border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400";
}

function tableCellClassName() {
  return "border-b border-gray-200 px-4 py-3 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-200";
}

function RolesPermissionsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("roles");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);

  const [roleForm, setRoleForm] = useState<RoleFormValue>(blankRoleForm);
  const [permissionForm, setPermissionForm] = useState<PermissionFormValue>(blankPermissionForm);
  const [savingRole, setSavingRole] = useState(false);
  const [savingPermission, setSavingPermission] = useState(false);

  const [selectedRole, setSelectedRole] = useState<RoleRecord | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [savingAssignments, setSavingAssignments] = useState(false);

  const allPermissionSelected = useMemo(
    () => permissions.length > 0 && selectedPermissionIds.length === permissions.length,
    [permissions.length, selectedPermissionIds.length]
  );

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [nextRoles, nextPermissions] = await Promise.all([fetchRoles(), fetchPermissions()]);
      setRoles(nextRoles);
      setPermissions(nextPermissions);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load roles and permissions");
    } finally {
      setLoading(false);
    }
  }

  async function refreshData() {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }

  function resetRoleForm() {
    setRoleForm(blankRoleForm);
  }

  function resetPermissionForm() {
    setPermissionForm(blankPermissionForm);
  }

  function editRole(role: RoleRecord) {
    setRoleForm({
      roleID: role.id,
      name: role.name,
      description: role.description,
      type: (role.type as RoleType) || "",
    });
    setActiveTab("roles");
  }

  function editPermission(permission: PermissionRecord) {
    setPermissionForm({
      id: permission.id,
      name: permission.name,
    });
    setActiveTab("permissions");
  }

  function openPermissions(role: RoleRecord) {
    setSelectedRole(role);
    setSelectedPermissionIds(role.rolePermissions);
  }

  function closePermissionsModal() {
    setSelectedRole(null);
    setSelectedPermissionIds([]);
  }

  function togglePermission(permissionId: string) {
    setSelectedPermissionIds((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId]
    );
  }

  function toggleSelectAll(checked: boolean) {
    setSelectedPermissionIds(checked ? permissions.map((permission) => permission.id) : []);
  }

  async function submitRole(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!roleForm.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    if (!roleForm.type) {
      toast.error("Role type is required");
      return;
    }

    setSavingRole(true);
    try {
      await saveRole({
        roleID: roleForm.roleID,
        name: roleForm.name.trim(),
        description: roleForm.description.trim(),
        type: roleForm.type,
      });
      toast.success(roleForm.roleID ? "Role has been updated." : "New role has been added successfully.");
      resetRoleForm();
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save role");
    } finally {
      setSavingRole(false);
    }
  }

  async function submitPermission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!permissionForm.name.trim()) {
      toast.error("Permission name is required");
      return;
    }

    setSavingPermission(true);
    try {
      await savePermission({
        id: permissionForm.id,
        name: permissionForm.name.trim(),
      });
      toast.success(permissionForm.id ? "Permission has been updated." : "New permission has been added successfully.");
      resetPermissionForm();
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save permission");
    } finally {
      setSavingPermission(false);
    }
  }

  async function removeRole(roleId: string) {
    if (!window.confirm("You will not be able to recover this item")) return;

    try {
      await deleteRole(roleId);
      toast.success("Role has been removed");
      if (roleForm.roleID === roleId) {
        resetRoleForm();
      }
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete role");
    }
  }

  async function removePermission(permissionId: string) {
    if (!window.confirm("You will not be able to recover this item")) return;

    try {
      await deletePermission(permissionId);
      toast.success("Permission has been removed");
      if (permissionForm.id === permissionId) {
        resetPermissionForm();
      }
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete permission");
    }
  }

  async function submitRolePermissions() {
    if (!selectedRole) return;

    setSavingAssignments(true);
    try {
      await assignRolePermissions(selectedRole.id, selectedPermissionIds);
      toast.success("Permissions have been saved");
      closePermissionsModal();
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save permissions");
    } finally {
      setSavingAssignments(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageBreadcrumb pageTitle="Roles & Permissions Management" />
        <Button
          size="sm"
          variant="outline"
          onClick={() => void refreshData()}
          startIcon={<RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTab)}>
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <section className={cardClassName()}>
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">User Roles</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <thead className={tableHeadClassName()}>
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Role Type</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td className={tableCellClassName()} colSpan={3}>
                          Loading Please wait...
                        </td>
                      </tr>
                    ) : roles.length === 0 ? (
                      <tr>
                        <td className={tableCellClassName()} colSpan={3}>
                          No record found
                        </td>
                      </tr>
                    ) : (
                      roles.map((role) => (
                        <tr key={role.id}>
                          <td className={tableCellClassName()}>{role.name}</td>
                          <td className={tableCellClassName()}>{role.type || "N/A"}</td>
                          <td className={tableCellClassName()}>
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                                onClick={() => editRole(role)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                                onClick={() => openPermissions(role)}
                              >
                                Permissions
                              </button>
                              <button
                                type="button"
                                className="text-error-600 hover:text-error-700"
                                onClick={() => void removeRole(role.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={cardClassName()}>
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">Add/Edit Role</h3>
              </div>

              <form className="space-y-4 p-6" onSubmit={(event) => void submitRole(event)}>
                <div>
                  <Label htmlFor="role-name">Name</Label>
                  <Input
                    id="role-name"
                    value={roleForm.name}
                    onChange={(event) =>
                      setRoleForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Name"
                  />
                </div>

                <div>
                  <Label htmlFor="role-description">Description</Label>
                  <TextArea
                    value={roleForm.description}
                    onChange={(value) =>
                      setRoleForm((current) => ({ ...current, description: value }))
                    }
                    className="text-gray-800 dark:text-white/90"
                    placeholder="Brief description about role"
                  />
                </div>

                <div>
                  <Label htmlFor="role-type">Role Type</Label>
                  <select
                    id="role-type"
                    className={selectClassName()}
                    value={roleForm.type}
                    onChange={(event) =>
                      setRoleForm((current) => ({
                        ...current,
                        type: event.target.value as RoleType | "",
                      }))
                    }
                  >
                    <option value="">Role Type</option>
                    {roleTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetRoleForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingRole}>
                    {savingRole ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <section className={cardClassName()}>
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">Permissions</h3>
              </div>

              <div className="p-6">
                {loading ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading Please wait...</p>
                ) : permissions.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No data found</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {permission.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                              onClick={() => editPermission(permission)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="text-error-600 hover:text-error-700"
                              onClick={() => void removePermission(permission.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className={cardClassName()}>
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">Add/Edit Permission</h3>
              </div>

              <form className="space-y-4 p-6" onSubmit={(event) => void submitPermission(event)}>
                <div>
                  <Label htmlFor="permission-name">Name</Label>
                  <Input
                    id="permission-name"
                    value={permissionForm.name}
                    onChange={(event) =>
                      setPermissionForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Name"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetPermissionForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingPermission}>
                    {savingPermission ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </section>
          </div>
        </TabsContent>
      </Tabs>

      <Modal isOpen={Boolean(selectedRole)} onClose={closePermissionsModal} size="3xl">
        <ModalHeader>Manage Permissions for {selectedRole?.name || ""}</ModalHeader>

        <ModalBody className="space-y-4">
          <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={allPermissionSelected}
              onChange={(event) => toggleSelectAll(event.target.checked)}
            />
            Select All
          </label>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {permissions.map((permission) => (
              <label
                key={permission.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  value={permission.id}
                  checked={selectedPermissionIds.includes(permission.id)}
                  onChange={() => togglePermission(permission.id)}
                />
                <span>{permission.name}</span>
              </label>
            ))}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={closePermissionsModal}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void submitRolePermissions()} disabled={savingAssignments}>
            {savingAssignments ? "Please wait..." : "Save"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default withAuth(RolesPermissionsPage);
