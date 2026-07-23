import { DELETEREQUEST, GETREQUEST, POSTREQUEST, PUTREQUEST } from "@/utils/base_request";
import { clientId } from "@/app/(admin)/tickets/components/ticketApiHelpers";

type AnyRecord = Record<string, any>;

export type AdminPermission = {
  id: string;
  name: string;
  raw: AnyRecord;
};

export type AdminRole = {
  id: string;
  name: string;
  type: string;
  raw: AnyRecord;
};

export type AdminUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  roleId: string;
  roleName: string;
  permissions: AdminPermission[];
  country: string;
  state: string;
  language: string;
  currency: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phoneNumber: string;
  raw: AnyRecord;
};

export type CountryOption = {
  id: string;
  name: string;
  currencyCode: string;
};

export type StateOption = {
  id: string;
  name: string;
};

export type ParentUserOption = {
  id: string;
  username: string;
};

export type AdminUserFormValue = {
  country: string;
  state: string;
  language: string;
  currency: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phoneNumber: string;
  username: string;
  password: string;
  email: string;
  balance: string;
  roleId: string;
  parent_agent: string;
  clientId: string;
  userId?: string;
};

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as AnyRecord) : {};
}

function stringValue(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function listFrom(value: unknown): AnyRecord[] {
  if (Array.isArray(value)) return value.map(asRecord);

  const record = asRecord(value);
  if (Array.isArray(record.data)) return record.data.map(asRecord);
  if (Array.isArray(record.data?.data)) return record.data.data.map(asRecord);
  if (Array.isArray(record.countries)) return record.countries.map(asRecord);
  if (Array.isArray(record.states)) return record.states.map(asRecord);

  return [];
}

function requestSucceeded(value: unknown) {
  const record = asRecord(value);
  return (
    record.success === true ||
    record.status === true ||
    record.status === 1 ||
    record.status_code === 200 ||
    record.status_code === 201
  );
}

function permissionFrom(value: unknown): AdminPermission {
  const record = asRecord(value);
  return {
    id: stringValue(record.id ?? record.permissionID),
    name: stringValue(record.name),
    raw: record,
  };
}

function roleFrom(value: unknown): AdminRole {
  const record = asRecord(value);
  return {
    id: stringValue(record.id),
    name: stringValue(record.name),
    type: stringValue(record.type),
    raw: record,
  };
}

function userFrom(value: unknown): AdminUser {
  const record = asRecord(value);
  const details = asRecord(record.userDetails);
  const role = asRecord(record.role);
  const permissions = Array.isArray(record.permissions) ? record.permissions.map(permissionFrom) : [];
  const firstName = stringValue(details.firstName);
  const lastName = stringValue(details.lastName);
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: stringValue(record.id),
    username: stringValue(record.username),
    firstName,
    lastName,
    fullName: fullName || stringValue(record.username),
    email: stringValue(details.email),
    roleId: stringValue(record.roleId ?? role.id),
    roleName: stringValue(role.name),
    permissions,
    country: stringValue(details.country),
    state: stringValue(details.state),
    language: stringValue(details.language, "EN"),
    currency: stringValue(details.currency, "NGN"),
    dateOfBirth: stringValue(details.dateOfBirth),
    gender: stringValue(details.gender, "Male"),
    address: stringValue(details.address),
    phoneNumber: stringValue(details.phoneNumber),
    raw: record,
  };
}

function countryFrom(value: unknown): CountryOption {
  const record = asRecord(value);
  return {
    id: stringValue(record.id),
    name: stringValue(record.name),
    currencyCode: stringValue(record.currency_code ?? record.currencyCode),
  };
}

function stateFrom(value: unknown): StateOption {
  const record = asRecord(value);
  return {
    id: stringValue(record.id),
    name: stringValue(record.name),
  };
}

function parentUserFrom(value: unknown): ParentUserOption {
  const record = asRecord(value);
  return {
    id: stringValue(record.value ?? record.id ?? record.userId),
    username: stringValue(record.username ?? record.label ?? record.name),
  };
}

function userPayload(value: AdminUserFormValue) {
  return {
    country: value.country,
    state: value.state,
    language: value.language,
    currency: value.currency,
    firstName: value.firstName,
    lastName: value.lastName,
    dateOfBirth: value.dateOfBirth,
    gender: value.gender,
    address: value.address,
    phoneNumber: value.phoneNumber,
    username: value.username,
    password: value.password,
    email: value.email,
    balance: value.balance,
    roleId: value.roleId,
    parent_agent: value.parent_agent,
    clientId: value.clientId,
    userId: value.userId,
  };
}

export async function fetchAdminUsers() {
  const response = await GETREQUEST<unknown>(`/admin/users?clientId=${encodeURIComponent(clientId())}`);

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load users");
  }

  return listFrom(response.data).map(userFrom);
}

export async function fetchAdminPermissions() {
  const response = await GETREQUEST<unknown>("/admin/permissions");

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load permissions");
  }

  return listFrom(response.data).map(permissionFrom);
}

export async function deleteAdminUser(userId: string) {
  const response = await DELETEREQUEST<unknown>(`/admin/users/${encodeURIComponent(userId)}/delete`);

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to delete user");
  }

  return response.data;
}

export async function saveAdminUserPermissions(userId: string, permissionIds: string[]) {
  const response = await POSTREQUEST<unknown>("/admin/settings/set-user-permissions", {
    user_id: userId,
    permissions: permissionIds,
  });

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to save permissions");
  }

  return response.data;
}

export async function changeAdminUserPassword(payload: {
  userId: string;
  username: string;
  password: string;
  conf_password: string;
}) {
  const response = await PUTREQUEST<unknown>("/admin/users/change-password", {
    ...payload,
    clientId: clientId(),
  });

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to change password");
  }

  return response.data;
}

export async function fetchAdminRoles() {
  const response = await GETREQUEST<unknown>("/admin/roles");

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load roles");
  }

  return listFrom(response.data).map(roleFrom);
}

export async function fetchCountries() {
  const response = await GETREQUEST<unknown>("/content-management/countries");

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load countries");
  }

  const body = asRecord(response.data);
  const source = Array.isArray(body.countries) ? body.countries : listFrom(response.data);
  return source.map(countryFrom);
}

export async function fetchStates(countryId: string) {
  const response = await GETREQUEST<unknown>(`/content-management/states/${encodeURIComponent(countryId)}`);

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load states");
  }

  const body = asRecord(response.data);
  const source = Array.isArray(body.states) ? body.states : listFrom(response.data);
  return source.map(stateFrom);
}

export async function searchParentUsers(query: string) {
  const response = await GETREQUEST<unknown>(
    `/admin/players/get-select-dropdown?username=${encodeURIComponent(query)}&clientId=${encodeURIComponent(clientId())}`
  );

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to search parent users");
  }

  return listFrom(response.data).map(parentUserFrom);
}

export async function createAdminUser(value: AdminUserFormValue) {
  const response = await POSTREQUEST<unknown>("/admin/users", userPayload(value));

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to create user");
  }

  return response.data;
}

export async function updateAdminUser(value: AdminUserFormValue) {
  const response = await PUTREQUEST<unknown>("/admin/users/update", userPayload(value));

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to update user");
  }

  return response.data;
}

export async function fetchAdminUser(userId: string) {
  const response = await GETREQUEST<unknown>(`/admin/users/${encodeURIComponent(userId)}/single`);

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to fetch user");
  }

  const body = asRecord(response.data);
  const data = asRecord(body.data);
  return userFrom(data);
}
