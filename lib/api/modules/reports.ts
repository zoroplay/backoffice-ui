import { get } from "http";
import { newApiClient, unwrapData } from "../client";
import { apiEnv } from "../env";

const clientId = apiEnv.clientId;

export const reportsApi = {
  getGamingActivity(payload: unknown, page = 1) {
    return unwrapData(
      newApiClient.post(`/bets/reporting/gaming-activity?page=${page}`, payload)
    );
  },
  getNetworkSales(payload: unknown, page = 1) {
    return unwrapData(
      newApiClient.post(`/admin/retail/${clientId}/get-network-sales?page=${page}`, payload)
    );
  },
  getOnlineSales(payload: unknown) {
    return unwrapData(
      newApiClient.post(`/admin/players/online-sales-report`, payload)
    );
  },
  getRetailCashReport() {
    return unwrapData(
      newApiClient.get(`/admin/retail/net-cash/${clientId}`)
    );
  },
  getMoneyTransactions(payload: unknown, page = 1) {
    return unwrapData(
      newApiClient.post(`/admin/wallet/${clientId}/get-money-transactions?page=${page}`, payload)
    );
  },
  getNetCashReport(payload: unknown, page = 1) {
    return unwrapData(
      newApiClient.post(`/admin/reporting/get-net-cash-report?page=${page}`, payload)
    );
}
};
