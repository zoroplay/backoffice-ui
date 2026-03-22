import { newApiClient, unwrapData } from "../client";
import { apiEnv } from "../env";

const clientId = Number(apiEnv.clientId);

export interface CmsPageRecord {
  id: number | string;
  clientId: number;
  title: string;
  url: string | null;
  target: string;
  content: string;
  createdBy: string;
  createdAt: unknown;
  updatedAt: unknown;
  slug: string;
}

export interface CreateCmsPagePayload {
  title: string;
  slug: string;
  content: string;
  target: string;
  clientId?: number;
  createdBy: string;
}

export interface UpdateCmsPagePayload {
  id: number | string;
  clientId?: number;
  title: string;
  url: string | null;
  target: string;
  content: string;
  createdBy: string;
  createdAt: unknown;
  updatedAt: unknown;
  slug: string;
}

export const cmsApi = {
  // Pages
  getPages(inputClientId: number = clientId) {
    return unwrapData(
      newApiClient.get(
        `/admin/content-management/pages?clientId=${encodeURIComponent(inputClientId)}`
      )
    );
  },

  getPageById(id: string | number, inputClientId: number = clientId) {
    return unwrapData(
      newApiClient.get(
        `/admin/content-management/page/${id}?clientId=${encodeURIComponent(inputClientId)}`
      )
    );
  },

  createPage(payload: CreateCmsPagePayload) {
    return unwrapData(
      newApiClient.post(`/admin/content-management/create-page`, {
        ...payload,
        clientId: payload.clientId ?? clientId,
      })
    );
  },

  updatePage(payload: UpdateCmsPagePayload) {
    return unwrapData(
      newApiClient.put(`/admin/content-management/page`, {
        ...payload,
        clientId: payload.clientId ?? clientId,
      })
    );
  },

  deletePage(id: string | number, inputClientId: number = clientId) {
    return unwrapData(
      newApiClient.delete(
        `/admin/content-management/page/${id}?clientId=${encodeURIComponent(inputClientId)}`
      )
    );
  },

  // SMS Settings
  saveSmsSettings(payload: unknown) {
    return unwrapData(
      newApiClient.post(`/admin/sms/settings`, payload)
    );
  },

  fetchSmsSettings() {
    return unwrapData(
      newApiClient.get(`/admin/sms/settings`)
    );
  },

  // Messaging
  saveMessage(payload: unknown) {
    return unwrapData(
      newApiClient.post(`/admin/create-message`, payload)
    );
  },

  fetchMessages() {
    return unwrapData(
      newApiClient.get(`/admin/messages`)
    );
  },

  fetchMessageById(id: string | number) {
    return unwrapData(
      newApiClient.get(`/admin/message/${id}`)
    );
  },

  deleteMessage(id: string | number) {
    return unwrapData(
      newApiClient.delete(`/admin/message/${id}`)
    );
  },

  updateMessage(payload: unknown) {
    return unwrapData(
      newApiClient.put(`/admin/message`, payload)
    );
  },
};
