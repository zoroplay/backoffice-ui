'use client';

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Select, {
  type GroupBase,
  type SingleValue,
  type StylesConfig,
} from "react-select";
import { CheckCircle2, Search, ShieldCheck, ShieldQuestion } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal/Modal";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { reactSelectStyles } from "@/utils/reactSelectStyles";

import type { PermissionRecord } from "../types";
import type { UserRecord } from "../../users/types";

type AssignPermissionModalProps = {
  isOpen: boolean;
  users: UserRecord[];
  user: UserRecord | null;
  permissions: PermissionRecord[];
  defaultPermission?: string | null;
  onClose: () => void;
  onSubmit: (payload: { userId: string; permissions: string[] }) => void;
};

type UserOption = {
  value: string;
  label: string;
  helper?: string;
};

type PermissionOption = {
  id: string;
  name: string;
  category: string;
  description: string;
  isCore: boolean;
};

const buildUserOption = (user: UserRecord): UserOption => ({
  value: user.id,
  label: user.name,
  helper: `${user.role} • ${user.status}`,
});

export function AssignPermissionModal({
  isOpen,
  users,
  user,
  permissions,
  defaultPermission,
  onClose,
  onSubmit,
}: AssignPermissionModalProps) {
  const { theme } = useTheme();
  const normalizedTheme =
    theme === "light" || theme === "dark" ? theme : undefined;

  const selectStyles = useMemo<
    StylesConfig<UserOption, false, GroupBase<UserOption>>
  >(
    () =>
      reactSelectStyles<UserOption, false, GroupBase<UserOption>>(
        normalizedTheme
      ),
    [normalizedTheme]
  );

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const userOptions = useMemo(
    () => users.map((record) => buildUserOption(record)),
    [users]
  );

  const permissionsOptions = useMemo<PermissionOption[]>(() => {
    const optionsMap = new Map<string, PermissionOption>();

    permissions.forEach((permission) => {
      optionsMap.set(permission.name, {
        id: permission.id,
        name: permission.name,
        category: permission.category,
        description: permission.description,
        isCore: permission.isCore,
      });
    });

    users.forEach((record) => {
      (record.permissions ?? []).forEach((permissionName) => {
        if (!optionsMap.has(permissionName)) {
          optionsMap.set(permissionName, {
            id: `assigned-${permissionName}`,
            name: permissionName,
            category: "Assigned",
            description: "Already granted via user profile.",
            isCore: false,
          });
        }
      });
    });

    return Array.from(optionsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [permissions, users]);

  const selectedUser = useMemo(
    () => users.find((record) => record.id === selectedUserId) ?? null,
    [selectedUserId, users]
  );

  useEffect(() => {
    if (!isOpen) return;

    const fallbackUser = user ?? null;
    const fallbackPermissions = fallbackUser?.permissions ?? [];

    setSelectedUserId(fallbackUser?.id ?? "");

    if (
      fallbackUser &&
      defaultPermission &&
      fallbackPermissions.every((item) => item !== defaultPermission)
    ) {
      setSelectedPermissions([...fallbackPermissions, defaultPermission]);
    } else if (fallbackUser) {
      setSelectedPermissions(fallbackPermissions);
    } else if (defaultPermission) {
      setSelectedPermissions([defaultPermission]);
    } else {
      setSelectedPermissions([]);
    }
    setSearchTerm("");
  }, [defaultPermission, isOpen, user]);

  const handleUserChange = (option: SingleValue<UserOption>) => {
    const nextUserId = option?.value ?? "";
    setSelectedUserId(nextUserId);

    const nextUser = users.find((record) => record.id === nextUserId);
    const basePermissions = nextUser?.permissions ?? [];

    if (
      defaultPermission &&
      basePermissions.every((permission) => permission !== defaultPermission)
    ) {
      setSelectedPermissions([...basePermissions, defaultPermission]);
    } else {
      setSelectedPermissions(basePermissions);
    }
  };

  const filteredPermissions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return permissionsOptions;

    return permissionsOptions.filter((permission) => {
      const haystack = `${permission.name} ${permission.category} ${permission.description}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [permissionsOptions, searchTerm]);

  const togglePermission = (permissionName: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionName)) {
        return prev.filter((name) => name !== permissionName);
      }
      return [...prev, permissionName];
    });
  };

  const handleSubmit = () => {
    if (!selectedUserId) return;
    onSubmit({ userId: selectedUserId, permissions: selectedPermissions });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader>Assign Permissions</ModalHeader>
      <ModalBody className="space-y-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,0.55fr),minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Select User
              </label>
              <Select<UserOption, false>
                options={userOptions}
                value={userOptions.find((option) => option.value === selectedUserId) ?? null}
                onChange={handleUserChange}
                styles={selectStyles}
                placeholder="Choose a user"
                menuPlacement="auto"
              />
            </div>

            {selectedUser ? (
              <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700">
                  <Image
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {selectedUser.name}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {selectedUser.email}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="light" color="primary" size="xs">
                      {selectedUser.role}
                    </Badge>
                    <Badge
                      variant="light"
                      color={
                        selectedUser.status === "active" ? "success" : selectedUser.status === "suspended" ? "error" : "warning"
                      }
                      size="xs"
                    >
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                Select a user to manage their permissions.
              </div>
            )}

            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-3 text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              <p className="font-medium text-gray-700 dark:text-gray-200">
                Current Selection
              </p>
              {selectedPermissions.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPermissions.map((permission) => (
                    <span
                      key={permission}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:bg-brand-500/20 dark:text-brand-200"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {permission}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  No permissions selected yet.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Available Permissions
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Toggle to grant or revoke access for the selected user.
                </p>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="h-9 w-44 rounded-full border border-gray-200 bg-white pl-9 pr-3 text-xs text-gray-600 outline-none transition focus:border-brand-300 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  placeholder="Search permissions"
                />
              </div>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {filteredPermissions.map((permission) => {
                const isSelected = selectedPermissions.includes(permission.name);
                return (
                  <label
                    key={permission.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition",
                      isSelected
                        ? "border-brand-300 bg-brand-50/60 text-brand-700 shadow-sm dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-200"
                        : "border-gray-200 text-gray-600 hover:border-brand-200 hover:bg-brand-50/40 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/5"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => togglePermission(permission.name)}
                      className="mt-1 h-4 w-4 accent-brand-500"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {permission.name}
                        </span>
                        {permission.isCore ? (
                          <Badge variant="light" color="error" size="xs">
                            <ShieldCheck className="mr-1 h-3 w-3" /> Core
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        {permission.category}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {permission.description}
                      </p>
                    </div>
                  </label>
                );
              })}

              {filteredPermissions.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <ShieldQuestion className="mx-auto mb-2 h-5 w-5 text-gray-400" />
                  No permissions match this search.
                </div>
              )}
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!selectedUserId}>
          Save Changes
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default AssignPermissionModal;
