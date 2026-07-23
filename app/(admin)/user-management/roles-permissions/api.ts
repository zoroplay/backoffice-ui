import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";

type AnyRecord = Record<string, any>;

export type RoleType = "admin" | "agency" | "player";

export type RoleRecord = {
  id: string;
  name: string;
  type: RoleType | string;
  description: string;
  rolePermissions: string[];
  raw: AnyRecord;
};

export type PermissionRecord = {
  id: string;
  name: string;
  raw: AnyRecord;
};

export type RoleFormValue = {
  roleID?: string;
  name: string;
  description: string;
  type: RoleType | "";
};

export type PermissionFormValue = {
  id?: string;
  name: string;
};

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? (value as AnyRecord) : {};
}

function stringValue(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function listFrom(value: unknown): AnyRecord[] {
  if (Array.isArray(value)) return value as AnyRecord[];

  const record = asRecord(value);
  if (Array.isArray(record.data)) return record.data as AnyRecord[];
  if (Array.isArray(record.data?.data)) return record.data.data as AnyRecord[];

  return [];
}

function requestSucceeded(value: unknown) {
  const record = asRecord(value);
  return record.success === true || record.status === true || record.status_code === 200 || record.status_code === 201;
}

function permissionIdFrom(value: unknown) {
  const record = asRecord(value);
  return stringValue(
    record.permissionID ?? record.permissionId ?? record.permission_id ?? record.id
  );
}

function roleFrom(value: unknown): RoleRecord {
  const record = asRecord(value);
  const rolePermissions = Array.isArray(record.role_permissions)
    ? record.role_permissions.map(permissionIdFrom).filter(Boolean)
    : [];

  return {
    id: stringValue(record.id ?? record.roleID),
    name: stringValue(record.name),
    type: stringValue(record.type),
    description: stringValue(record.description),
    rolePermissions,
    raw: record,
  };
}

function permissionFrom(value: unknown): PermissionRecord {
  const record = asRecord(value);

  return {
    id: stringValue(record.id ?? record.permissionID),
    name: stringValue(record.name),
    raw: record,
  };
}

export async function fetchRoles() {
  const response = await GETREQUEST<unknown>("/admin/roles");

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load roles");
  }

  return listFrom(response.data).map(roleFrom);
}

export async function fetchPermissions() {
  const response = await GETREQUEST<unknown>("/admin/permissions");

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load permissions");
  }

  return listFrom(response.data).map(permissionFrom);
}

export async function saveRole(value: RoleFormValue) {
  const response = await POSTREQUEST<unknown>("/admin/roles", {
    name: value.name,
    description: value.description,
    type: value.type,
    roleID: value.roleID ?? "",
    id: value.roleID ?? "",
  });

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to save role");
  }

  return response.data;
}

export async function deleteRole(roleId: string) {
  const response = await GETREQUEST<unknown>(`/admin/settings/roles/delete/${encodeURIComponent(roleId)}`);

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to delete role");
  }

  return response.data;
}

export async function savePermission(value: PermissionFormValue) {
  const response = await POSTREQUEST<unknown>("/admin/permissions", {
    name: value.name,
    id: value.id ?? "",
  });

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to save permission");
  }

  return response.data;
}

export async function deletePermission(permissionId: string) {
  const response = await GETREQUEST<unknown>(
    `/admin/settings/permissions/delete/${encodeURIComponent(permissionId)}`
  );

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to delete permission");
  }

  return response.data;
}

export async function assignRolePermissions(roleId: string, permissionIds: string[]) {
  const response = await POSTREQUEST<unknown>("/admin/assign_permission", {
    roleId,
    permissionIds,
  });

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to save permissions");
  }

  return response.data;
}
