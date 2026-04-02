import { apiEnv } from "../env";
import { newApiClient, unwrapData } from "../client";

const clientId = apiEnv.clientId;

type PlayerSearchPayload = {
  searchKey: string;
  clientId?: number;
  page?: number;
  limit?: number;
};

type ChangePasswordPayload = {
  password: string;
  conf_password: string;
  username: string;
  userId: number;
  clientId?: number;
};

type WalletAdjustmentPayload = {
  amount: string;
  description: string;
  action: "deposit" | "withdraw";
  userId: number;
  clientId?: number;
  username: string;
  source: "admin";
  wallet: "main";
  subject: "Wallet Adjustment";
  channel: "admin";
};

type PlayerRegistrationReportPayload = {
  from: string;
  to: string;
  source: string;
  period: "date_range" | "today" | "yesterday" | "this_week" | "this_month";
  status: "all" | "active" | "inactive";
  clientId?: number;
};

type PlayerListReportPayload = {
  country: string;
  state: string;
  username: string;
  source: string;
  type?: "frozen" | "inactive";
  clientId?: number;
};

type GetPlayerTransactionsParams = {
  playerId: number | string;
  page?: number;
  startDate: string;
  endDate: string;
  clientId?: number;
};

export const playerApi = {
  searchPlayers(payload: PlayerSearchPayload) {
    return unwrapData(
      newApiClient.post(`/admin/players/search`, {
        clientId,
        ...payload,
      })
    );
  },
  changePassword(payload: ChangePasswordPayload) {
    return unwrapData(
      newApiClient.put(`/admin/users/change-password`, {
        clientId,
        ...payload,
      })
    );
  },
  transferFunds(payload: WalletAdjustmentPayload) {
    return unwrapData(
      newApiClient.post(`/admin/wallet/funds-transfer`, {
        clientId,
        ...payload,
      })
    ); 
  },
  verifyAccount(id: number) {
    return unwrapData(newApiClient.put(`/admin/player-management/verify-account/${id}`));
  },
  updateStatus(id: number, status: 1 | 2 | 3) {
    return unwrapData(
      newApiClient.get(`/admin/players/update-status/${id}?status=${status}`)
    );
  },  
  getPlayerSegments(){
   return unwrapData(
     newApiClient.get(`/admin/player-management/segments?clientId=${clientId}`)
   );
  },
  getRegistrationReport(page: number, payload: PlayerRegistrationReportPayload) {
    return unwrapData(
      newApiClient.post(`/admin/players/registration?page=${page}`, {
        clientId,
        ...payload,
      })
    );
  },
  getFrozenAccountsReport(page: number, payload: Omit<PlayerListReportPayload, "type">) {
    return unwrapData(
      newApiClient.post(`/admin/players/list?page=${page}`, {
        type: "frozen",
        clientId,
        ...payload,
      })
    );
  },
  getInactivePlayersReport(page: number, payload: Omit<PlayerListReportPayload, "type">) {
    return unwrapData(
      newApiClient.post(`/admin/players/list?page=${page}`, {
        type: "inactive",
        clientId,
        ...payload,
      })
    );
  },
  getOnlinePlayersReport(page: number, payload: Omit<PlayerListReportPayload, "type">) {
    return unwrapData(
      newApiClient.post(`/admin/players/list?page=${page}`, {
        clientId,
        ...payload,
      })
    );
  },
  getPlayerTransactions(params: GetPlayerTransactionsParams) {
    const query = new URLSearchParams({
      clientId: String(params.clientId ?? clientId),
      page: String(params.page ?? 1),
      startDate: params.startDate,
      endDate: params.endDate,
    });
    return unwrapData(
      newApiClient.get(`/admin/players/${params.playerId}/transactions?${query.toString()}`)
    );
  }
};
