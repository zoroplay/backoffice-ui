import { apiEnv } from "../env";
import { legacyApiClient, newApiClient, unwrapData } from "../client";

const clientId = Number(apiEnv.clientId);

export type CasinoGamePayload = Record<string, unknown>;
export type CasinoCategoryPayload = Record<string, unknown>;
export type CasinoProviderPayload = Record<string, unknown>;

export const casinoApi = {
  getGames() {
    return unwrapData(newApiClient.get(`/admin/games/get-games`));
  },

  getGamesBySearch(search: string) {
    return unwrapData(
      newApiClient.get(
        `/admin/games/${encodeURIComponent(clientId)}/game-list?gameName=${encodeURIComponent(search)}`
      )
    );
  },

  updateGame(payload: CasinoGamePayload) {
    return unwrapData(newApiClient.put(`/admin/games/update-game`, payload));
  },

  deleteGame(id: number | string) {
    return unwrapData(legacyApiClient.delete(`/api/admin/casino/games/${id}`));
  },

  getCategories() {
    return unwrapData(newApiClient.get(`/admin/games/categories`));
  },

  addCategory(payload: CasinoCategoryPayload) {
    return unwrapData(newApiClient.post(`/admin/games/add-category`, payload));
  },

  updateCategory(payload: CasinoCategoryPayload) {
    return unwrapData(newApiClient.put(`/admin/games/update-category`, payload));
  },

  deleteCategory(id: number | string) {
    return unwrapData(newApiClient.delete(`/admin/games/category?id=${encodeURIComponent(id)}`));
  },

  getProviders() {
    return unwrapData(newApiClient.get(`/admin/games/provider`));
  },

  updateProvider(payload: CasinoProviderPayload) {
    return unwrapData(newApiClient.put(`/admin/games/update-provider`, payload));
  },

  toggleProvider(payload: CasinoProviderPayload) {
    return unwrapData(legacyApiClient.post(`/api/admin/casino/toggle-provider-status`, payload));
  },

  deleteProvider(id: number | string) {
    return unwrapData(legacyApiClient.delete(`/api/admin/casino/providers/${id}`));
  },
};

