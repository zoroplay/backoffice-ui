import { apiEnv } from "../env";
import { newApiClient, unwrapData } from "../client";

const clientId = Number(apiEnv.clientId);

export type RiskManagementCategory = "online" | "retail";
export type RiskManagementPeriod = "day" | "week" | "month";
export type RiskManagementValue = string | number | "";

export type SaveRiskManagementPayload = {
  period: RiskManagementPeriod | string;
  category: RiskManagementCategory;
  [key: string]: RiskManagementValue | RiskManagementCategory;
};

export type SettingsOptionRecord = {
  id: number;
  option: string;
  value: string;
  category: string;
  createdAt: unknown;
  updatedAt: unknown;
  clientId: number;
};

export type CountryRecord = {
  id?: number | string;
  name?: string;
  country?: string;
  label?: string;
  value?: string;
  code?: string;
  dialCode?: string;
  currencyCode?: string;
  currencySymbol?: string;
  [key: string]: unknown;
};

export type SaveGeneralSettingsPayload = Record<string, string | number | null | undefined>;
export type PaymentMethodRecord = {
  id: number;
  title: string;
  provider: string;
  secretKey: string;
  publicKey: string;
  merchantId?: string;
  baseUrl: string;
  status: number;
  forDisbursement: number;
};

export type CreatePaymentMethodPayload = {
  title: string;
  provider: string;
  publicKey: string;
  secretKey: string;
  merchantId?: string;
  baseUrl: string;
  forDisbursement: number;
  clientId?: number;
};

export type UpdatePaymentMethodPayload = {
  id: number;
  clientId?: number;
  status: number;
  provider: string;
  secretKey: string;
  publicKey: string;
  merchantId?: string;
  baseUrl: string;
  forDisbursement: number;
  title?: string;
};

export type GameProviderRecord = {
  id: number;
  slug: string;
  name: string;
  description?: string;
  status?: number;
  imagePath?: string;
  parentProvider?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type GameKeyRecord = {
  id?: number;
  client_id?: number;
  provider: string;
  option: string;
  value: string;
  created_at?: unknown;
  updated_at?: unknown;
};

export type SaveGameKeysPayload = {
  clientId?: number;
  keys: Array<{
    id?: number;
    provider: string;
    option: string;
    value: string;
  }>;
};

export const settingsApi = {
  getRiskManagementBettingParameters(
    category: RiskManagementCategory,
    inputClientId: number = clientId
  ) {
    return unwrapData(
      newApiClient.get(
        `/admin/settings/${inputClientId}/risk-management?category=${encodeURIComponent(
          category
        )}`
      )
    );
  },

  getOnlineRiskManagementBettingParameters(inputClientId: number = clientId) {
    return this.getRiskManagementBettingParameters("online", inputClientId);
  },

  getRetailRiskManagementBettingParameters(inputClientId: number = clientId) {
    return this.getRiskManagementBettingParameters("retail", inputClientId);
  },

  saveRiskManagementBettingParameters(
    payload: SaveRiskManagementPayload,
    inputClientId: number = clientId
  ) {
    return unwrapData(
      newApiClient.post(`/admin/settings/${inputClientId}/risk-management/save`, payload)
    );
  },

  getGeneralSettings(inputClientId: number = clientId) {
    return unwrapData(
      newApiClient.get(
        `/admin/settings/${inputClientId}/risk-management?category=${encodeURIComponent("general")}`
      )
    );
  },

  getCountries() {
    return unwrapData(newApiClient.get(`/content-management/countries`));
  },

  saveGeneralSettings(
    payload: SaveGeneralSettingsPayload,
    inputClientId: number = clientId
  ) {
    return unwrapData(newApiClient.post(`/admin/settings/${inputClientId}/save`, payload));
  },

  getPaymentMethods(inputClientId: number = clientId) {
    return unwrapData(newApiClient.get(`/admin/wallet/payment-methods/${inputClientId}`));
  },

  createPaymentMethod(
    payload: CreatePaymentMethodPayload,
    inputClientId: number = clientId
  ) {
    return unwrapData(
      newApiClient.post(`/admin/wallet/payment-methods`, {
        ...payload,
        clientId: payload.clientId ?? inputClientId,
      })
    );
  },

  updatePaymentMethod(
    payload: UpdatePaymentMethodPayload,
    inputClientId: number = clientId
  ) {
    return unwrapData(
      newApiClient.patch(`/admin/wallet/update/payment-method`, {
        ...payload,
        clientId: payload.clientId ?? inputClientId,
      })
    );
  },

  deletePaymentMethod(id: number | string, inputClientId: number = clientId) {
    return unwrapData(
      newApiClient.delete(`/admin/wallet/payment-method/${inputClientId}?id=${encodeURIComponent(id)}`)
    );
  },

  getGameProviders() {
    return unwrapData(newApiClient.get(`/admin/games/provider`));
  },

  getGameKeys(inputClientId: number = clientId) {
    return unwrapData(
      newApiClient.get(`/admin/games/game-keys?clientId=${encodeURIComponent(inputClientId)}`)
    );
  },

  saveGameKeys(payload: SaveGameKeysPayload, inputClientId: number = clientId) {
    return unwrapData(
      newApiClient.post(`/admin/games/add-game-key`, {
        clientId: payload.clientId ?? inputClientId,
        keys: payload.keys,
      })
    );
  },
};
