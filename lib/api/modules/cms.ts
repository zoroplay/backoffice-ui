import { newApiClient, unwrapData } from "../client";

export const cmsApi = {
  // SMS Settings
  saveSmsSettings(payload: any) {
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
  saveMessage(payload: any) {
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

  updateMessage(payload: any) {
    return unwrapData(
      newApiClient.put(`/admin/message`, payload)
    );
  },
};
