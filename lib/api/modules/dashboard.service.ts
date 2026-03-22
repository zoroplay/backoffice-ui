import { apiEnv } from "../env";
import { newApiClient, unwrapData } from "../client";

const clientId = apiEnv.clientId;

export type DateRangeParams = {
  from: string;
  to: string;
};

export const dashboardApi = {
  getAuthDetails() {
    return unwrapData(newApiClient.get(`/auth/details/${clientId}`));
  },
  getGlobalVariables() {
    return unwrapData(newApiClient.get(`/auth/globalvariables/${clientId}`));
  },
  getStatistics() {
    return unwrapData(newApiClient.get(`/admin/dashboard/statistics/${clientId}`));
  },
  getRealtimeData() {
    return unwrapData(
      newApiClient.get(`/admin/dashboard/realtime-data?clientId=${clientId}`)
    );
  },
  getPlayerBalance() {
    return unwrapData(
      newApiClient.get(`/admin/dashboard/player-balance/${clientId}`)
    );
  },
  getFinancialPerformance() {
    return unwrapData(
      newApiClient.get(`/admin/dashboard/financial-performance/${clientId}`)
    );
  },
  getSportsData(params: DateRangeParams) {
    return unwrapData(
      newApiClient.get(
        `/admin/dashboard/sports-data/${clientId}?from=${params.from}&to=${params.to}`
      )
    );
  },
  getOverallGaming(params: DateRangeParams) {
    return unwrapData(
      newApiClient.get(
        `/admin/dashboard/overall-gamin/${clientId}?from=${params.from}&to=${params.to}`
      )
    );
  },
  getOnlineData(params: DateRangeParams) {
    return unwrapData(
      newApiClient.get(
        `/admin/dashboard/online-data/${clientId}?from=${params.from}&to=${params.to}`
      )
    );
  },
  getShopData(params: DateRangeParams) {
    return unwrapData(
      newApiClient.get(
        `/admin/dashboard/shop-data/${clientId}?from=${params.from}&to=${params.to}`
      )
    );
  },
};
