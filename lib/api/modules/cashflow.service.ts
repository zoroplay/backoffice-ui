import { apiEnv } from "../env";
import { newApiClient, unwrapData } from "../client";

const clientId = Number(apiEnv.clientId);

export type CashflowSearchPayload = {
  period: string;
  from: string;
  to: string;
  status: string;
  paymentMethod: string;
  type: "Withdrawal" | "Deposit";
  username: string;
  transactionId: string;
  keyword: string;
  clientId?: number;
  startDate?: string;
  endDate?: string;
};

export const cashflowApi = {
  searchWithdrawals(payload: CashflowSearchPayload, page = 1) {
    return unwrapData(
      newApiClient.post(`/admin/wallet/withdrawals?page=${page}`, {
        ...payload,
        clientId: payload.clientId ?? clientId,
      })
    );
  },
  searchDeposits(payload: CashflowSearchPayload, page = 1) {
    return unwrapData(
      newApiClient.post(`/admin/wallet/deposits?page=${page}`, {
        ...payload,
        clientId: payload.clientId ?? clientId,
      })
    );
  },
  getRetailCashSales(params: { from: string; to: string }) {
    return unwrapData(
      newApiClient.get(
        `/hop/cashbook/report?from=${encodeURIComponent(
          params.from
        )}&to=${encodeURIComponent(params.to)}`
      )
    );
  },
};
