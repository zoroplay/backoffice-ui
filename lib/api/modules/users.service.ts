import { apiEnv } from "../env";
import { newApiClient, unwrapData } from "../client";

const clientId = Number(apiEnv.clientId);

export type UserListItem = {
  id: number;
  username: string;
  roleId?: number | null;
  lastLogin?: string | null;
  status?: number | null;
  verified?: number | null;
  clientId?: number | null;
  userDetails?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    city?: string | null;
    country?: string | null;
    state?: string | null;
    address?: string | null;
    gender?: string | null;
    currency?: string | null;
    phone?: string | null;
    date_of_birth?: string | null;
    language?: string | null;
  } | null;
  role?: {
    id?: number;
    name?: string;
    description?: string;
    type?: string;
  } | null;
};

export type RoleRecord = {
  id: number;
  name: string;
  type: string;
  description?: string;
};

export type PermissionRecord = {
  id: number;
  name: string;
};

export type CreateUserPayload = {
  country?: string;
  state?: string;
  language?: string;
  currency?: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  phoneNumber?: string;
  username: string;
  password: string;
  email: string;
  balance?: string;
  roleId: number;
  parentId?: string;
  clientId?: number;
  date_of_birth?: string;
  parent_agent?: number | string;
};

export type UpdateUserPayload = {
  country?: string;
  state?: string;
  language?: string;
  currency?: string | null;
  firstName?: string;
  lastName?: string;
  gender?: string;
  address?: string;
  username: string;
  password?: string;
  email?: string;
  balance?: string;
  roleId?: number;
  parentId?: string;
  clientId?: number;
  userId: string | number;
};

export type UpsertRolePayload = {
  name: string;
  type: "admin" | "agency" | "player";
  description?: string;
  roleID?: number | string;
};

export type UpsertPermissionPayload = {
  name: string;
  id?: number | string;
};

export type ChangeUserPasswordPayload = {
  password: string;
  conf_password: string;
  username: string;
  userId: number;
  clientId?: number;
};

export type GetAllLogsParams = {
  page?: number;
  period?: string;
  from?: string;
  to?: string;
  clientId?: number;
};

export const usersApi = {
  getUsers(inputClientId: number = clientId) {
    return unwrapData(
      newApiClient.get(`/admin/users?clientId=${encodeURIComponent(inputClientId)}`)
    );
  },
  getSingleUser(userId: number | string) {
    return unwrapData(newApiClient.get(`/admin/users/${userId}/single`));
  },
  addUser(payload: CreateUserPayload) {
    return unwrapData(
      newApiClient.post(`/admin/users`, {
        clientId,
        ...payload,
      })
    );
  },
  updateUser(payload: UpdateUserPayload) {
    return unwrapData(
      newApiClient.put(`/admin/users/update`, {
        clientId,
        ...payload,
      })
    );
  },
  changePassword(payload: ChangeUserPasswordPayload) {
    return unwrapData(
      newApiClient.put(`/admin/users/change-password`, {
        clientId,
        ...payload,
      })
    );
  },
  getRoles() {
    return unwrapData(newApiClient.get(`/admin/roles`));
  },
  getAgencyRoles() {
    return unwrapData(newApiClient.get(`/admin/roles/agency`));
  },
  upsertRole(payload: UpsertRolePayload) {
    return unwrapData(newApiClient.post(`/admin/roles`, payload));
  },
  getPermissions() {
    return unwrapData(newApiClient.get(`/admin/permissions`));
  },
  upsertPermission(payload: UpsertPermissionPayload) {
    return unwrapData(newApiClient.post(`/admin/permissions`, payload));
  },
  getActivityLogs(userId: number | string) {
    return unwrapData(newApiClient.get(`/admin/users/${userId}/activity-logs`));
  },
  getAllLogs(params: GetAllLogsParams = {}) {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      period: params.period ?? "today",
      from: params.from ?? "",
      to: params.to ?? "",
      clientId: String(params.clientId ?? clientId),
    });

    return unwrapData(newApiClient.get(`/admin/get_all_logs?${query.toString()}`));
  }
};
