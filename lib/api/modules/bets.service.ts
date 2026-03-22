import { apiEnv } from "../env";
import { legacyApiClient, newApiClient, unwrapData } from "../client";

const clientId = apiEnv.clientId;

export const betsApi = {
  getBetHistory(payload: unknown, page = 1) {
    return unwrapData(
      newApiClient.post(`/admin/bets/${clientId}/tickets?page=${page}`, payload)
    );
  },
  getOpenBets(payload: unknown, page = 1) {
    return unwrapData(
      newApiClient.post(`/admin/bets/${clientId}/tickets?page=${page}`, payload)
    );
  },
  getPendingCashout(page = 1) {
    return unwrapData(
      legacyApiClient.get(`/admin/sport/pending-cashout?page=${page}`)
    );
  },
  getWinningsOnHold(page = 1) {
    return unwrapData(legacyApiClient.get(`/api/admin/sport/winnings-on-hold?page=${page}`));
  },
  getTicketsOnHold(payload: unknown, page = 1) {
    return unwrapData(
      legacyApiClient.post(`/admin/sport/bets-monitor?page=${page}`, payload)
    );
  },
  getTaxReport(payload: unknown, page = 1) {
    return unwrapData(
      newApiClient.post(`/bets/${clientId}/tax-report?page=${page}`, payload)
    ); 
  },
  getCouponDetails(couponId: string) {
    return unwrapData(
      newApiClient.post(`/bets/find-coupon`,  { couponId })
    );
  }, 
};
