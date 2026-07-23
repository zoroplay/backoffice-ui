"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { withAuth } from "@/utils/withAuth";

import {
  changeAdminUserPassword,
  deleteAdminUser,
  fetchAdminPermissions,
  fetchAdminUsers,
  saveAdminUserPermissions,
  type AdminPermission,
  type AdminUser,
} from "../api";

type PasswordForm = {
  password: string;
  conf_password: string;
};

const emptyPasswordForm: PasswordForm = {
  password: "",
  conf_password: "",
};

function cardClassName() {
  return "rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900";
}

function tableHeadClassName() {
  return "border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400";
}

function tableCellClassName() {
  return "border-b border-gray-200 px-4 py-3 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-200";
}

function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [permissionUser, setPermissionUser] = useState<AdminUser | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(emptyPasswordForm);
  const [changingPassword, setChangingPassword] = useState(false);

  const allPermissionSelected =
    permissions.length > 0 && selectedPermissionIds.length === permissions.length;

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [nextUsers, nextPermissions] = await Promise.all([fetchAdminUsers(), fetchAdminPermissions()]);
      setUsers(nextUsers);
      setPermissions(nextPermissions);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occured");
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

  function openPermission(user: AdminUser) {
    setPermissionUser(user);
    setSelectedPermissionIds(user.permissions.map((permission) => permission.id));
  }

  function closePermissionModal() {
    setPermissionUser(null);
    setSelectedPermissionIds([]);
  }

  function showPasswordModal(user: AdminUser) {
    setPasswordUser(user);
    setPasswordForm(emptyPasswordForm);
  }

  function closePasswordModal() {
    setPasswordUser(null);
    setPasswordForm(emptyPasswordForm);
  }

  function togglePermission(permissionId: string) {
    setSelectedPermissionIds((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId]
    );
  }

  async function handleDeleteUser(userId: string) {
    if (!window.confirm("You will not be able to recover this user")) return;

    try {
      await deleteAdminUser(userId);
      toast.success("User has been removed");
      setUsers((current) => current.filter((user) => user.id !== userId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occured");
    }
  }

  async function handleSavePermission() {
    if (!permissionUser || selectedPermissionIds.length === 0) return;

    setSavingPermissions(true);
    try {
      await saveAdminUserPermissions(permissionUser.id, selectedPermissionIds);
      toast.success("Permissions have been saved");
      closePermissionModal();
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occured");
    } finally {
      setSavingPermissions(false);
    }
  }

  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordUser) return;
    if (passwordForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (passwordForm.password !== passwordForm.conf_password) {
      toast.error("Passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await changeAdminUserPassword({
        userId: passwordUser.id,
        username: passwordUser.username,
        password: passwordForm.password,
        conf_password: passwordForm.conf_password,
      });
      toast.success("Password has been changed");
      closePasswordModal();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Unable to change password");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageBreadcrumb pageTitle="User Management" />
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => void refreshData()}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Link
            href="/user-management/add-user"
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            New User
          </Link>
        </div>
      </div>

      <section className={cardClassName()}>
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">Results</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead className={tableHeadClassName()}>
              <tr>
                <th className="px-4 py-3">username</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Edit</th>
                <th className="px-4 py-3 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className={tableCellClassName()} colSpan={6}>
                    Loading Please wait...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className={tableCellClassName()} colSpan={6}>
                    No record found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className={tableCellClassName()}>{user.username}</td>
                    <td className={tableCellClassName()}>{user.fullName || " - "}</td>
                    <td className={tableCellClassName()}>{user.email || "-"}</td>
                    <td className={tableCellClassName()}>{user.roleName || "-"}</td>
                    <td className={tableCellClassName()}>
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/user-management/edit-user/${encodeURIComponent(user.id)}`}
                          className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                          onClick={() => openPermission(user)}
                        >
                          Permissions
                        </button>
                        <button
                          type="button"
                          className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                          onClick={() => showPasswordModal(user)}
                        >
                          Change Password
                        </button>
                      </div>
                    </td>
                    <td className={`${tableCellClassName()} text-center`}>
                      <button
                        type="button"
                        className="text-error-600 hover:text-error-700"
                        onClick={() => void handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={Boolean(permissionUser)} onClose={closePermissionModal} size="3xl">
        <ModalHeader>Manage Permissions</ModalHeader>
        <ModalBody className="space-y-4">
          <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={allPermissionSelected}
              onChange={(event) =>
                setSelectedPermissionIds(event.target.checked ? permissions.map((permission) => permission.id) : [])
              }
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
          <Button type="button" variant="outline" onClick={closePermissionModal}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSavePermission()} disabled={savingPermissions}>
            {savingPermissions ? "Please wait..." : "Save"}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={Boolean(passwordUser)} onClose={closePasswordModal} size="md">
        <form onSubmit={(event) => void handleChangePassword(event)}>
          <ModalHeader>Change Password</ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.password}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, password: event.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.conf_password}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, conf_password: event.target.value }))
                }
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={closePasswordModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? "Please wait..." : "Change Password"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}

export default withAuth(UsersPage);
