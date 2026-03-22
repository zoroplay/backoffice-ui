import { newApiClient, unwrapData } from "../client";
import { apiEnv } from "../env";

const clientId = apiEnv.clientId;

export type GetAgentsPayload = {
  page?: number;
  search?: string;
  agent_type?: number | "";
  state_id?: string;
};

export type GetPendingRequestsPayload = {
  page?: number;
};

export type SearchParentUsersPayload = {
  username: string;
  clientId?: number;
};

export type CreateRetailUserPayload = {
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
  roleId: string | number;
  parentId: string | number | null;
};

export type GetCommissionsPayload = {
  page?: number;
  provider: string;
  from: string;
  to: string;
};

export const agentsApi = {
  getAgencyRoles() {
    return unwrapData(newApiClient.get(`/admin/roles/agency`));
  },
  getAgents(payload: GetAgentsPayload) {
    const page = payload.page ?? 1;
    const search = payload.search ?? "";

    return unwrapData(
      newApiClient.post(
        `/admin/retail/agents?page=${page}&search=${encodeURIComponent(search)}`,
        {
          search,
          agent_type: payload.agent_type ?? "",
          state_id: payload.state_id ?? "",
          clientId: Number(clientId),
        }
      )
    );
  },
  getAgentPendingRequests(payload: GetPendingRequestsPayload = {}) {
    const page = payload.page ?? 1;
    return unwrapData(
      newApiClient.get(`/admin/retail/agents/pending-requests?page=${page}`)
    );
  },
  searchParentUsers(payload: SearchParentUsersPayload) {
    const effectiveClientId = payload.clientId ?? Number(clientId);
    return unwrapData(
      newApiClient.get(
        `/admin/players/get-select-dropdown?username=${encodeURIComponent(
          payload.username
        )}&clientId=${effectiveClientId}`
      )
    );
  },
  createRetailUser(payload: CreateRetailUserPayload) {
    return unwrapData(
      newApiClient.post(`/admin/retail/${clientId}/create-user`, payload)
    );
  },
  getWeeklyCommissions(payload: GetCommissionsPayload) {
    const page = payload.page ?? 1;
    return unwrapData(
      newApiClient.post(`/commission/${clientId}/get-commissions?page=${page}`, {
        provider: payload.provider,
        from: payload.from,
        to: payload.to,
      })
    );
  },
  getPaidCommissions(payload: GetCommissionsPayload) {
    const page = payload.page ?? 1;
    return unwrapData(
      newApiClient.get(
        `/commission/${clientId}/paid?page=${page}&from=${encodeURIComponent(
          payload.from
        )}&to=${encodeURIComponent(payload.to)}&provider=${encodeURIComponent(
          payload.provider
        )}`
      )
    );
  },
  getPowerBonusCommissions(payload: Omit<GetCommissionsPayload, "provider">) {
    const page = payload.page ?? 1;
    return unwrapData(
      newApiClient.get(
        `/admin/power-bonus?page=${page}&from=${encodeURIComponent(
          payload.from
        )}&to=${encodeURIComponent(payload.to)}`
      )
    );
  },
};
  
