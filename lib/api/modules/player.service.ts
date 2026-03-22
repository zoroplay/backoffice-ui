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
  }
};

