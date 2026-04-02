import { apiEnv } from "../env";
import { legacyApiClient, newApiClient, unwrapData } from "../client";

const clientId = apiEnv.clientId;

export type AgentBetListPayload = {
  period?: string;
  username?: string;
  from?: string;
  to?: string;
  bet_type?: string;
  event_type?: string;
  sport?: string;
  league?: string;
  market?: string;
  group_type?: string;
  amount_range?: string;
  betslipId?: string;
  state?: string;
  status?: number | string;
};

export type AgentVirtualBetsPayload = {
  period?: string;
  username?: string;
  from?: string;
  to?: string;
  bet_type?: string;
  event_type?: string;
  sport?: string;
  league?: string;
  market?: string;
  state?: string;
  group_type?: string;
  amount_range?: string;
  status?: string;
};

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
  getAgentBetList(
    agentId: string | number,
    payload: AgentBetListPayload,
    page = 1,
    limit = 100
  ) {
    return unwrapData(
      newApiClient.post(
        `/admin/retail/${clientId}/agent/${agentId}/bet-list?page=${page}&limit=${limit}`,
        payload
      )
    );
  },
  getAgentVirtualBets(
    agentId: string | number,
    payload: AgentVirtualBetsPayload,
    page = 1,
    limit = 100
  ) {
    return unwrapData(
      newApiClient.post(
        `/admin/retail/${clientId}/agent/${agentId}/virtual-bets?page=${page}&limit=${limit}`,
        payload
      )
    );
  },
};
