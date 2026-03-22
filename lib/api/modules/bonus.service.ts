import { newApiClient, unwrapData } from "../client";
import { apiEnv } from "../env";

const clientId = apiEnv.clientId;

type GiveBonusPayload = {
  bonusType: string;
  amount: string;
  userId: number;
  username: string;
  clientId?: number;
};

export type GrantMassBonusPayload = {
  username: string;
  userId: string | number;
  bonusId: string | number;
  amount: string | number;
};

export type MassBonusPlayerFilterPayload = {
  clientId?: string | number;
  filterType: string | number;
  startDate: string;
  endDate: string;
  minAmount?: string | number;
  maxAmount?: string | number;
  depositCount?: string | number;
  page?: string | number;
};

export type PlayerBonusesReportPayload = {
  clientId?: string | number;
  from: string;
  to: string;
  bonusType?: string;
};

type BonusPrimitive = string | number | null;

export type CreateBonusPayload = {
  clientId?: number | string;
  name: string;
  duration: BonusPrimitive;
  maxAmount: BonusPrimitive;
  minimumOddsPerEvent: BonusPrimitive;
  minimumTotalOdds: BonusPrimitive;
  applicableBetType: string;
  maximumWinning: BonusPrimitive;
  minimumLostGames: BonusPrimitive;
  minimumSelection: BonusPrimitive;
  minimumEntryAmount: BonusPrimitive;
  bonusAmount: BonusPrimitive;
  providerId?: BonusPrimitive;
  provider?: BonusPrimitive;
  rolloverCount: BonusPrimitive;
  product: string;
  bonusType: string;
  creditType: string;
  gameId?: BonusPrimitive;
  id?: BonusPrimitive;
  casinoSpinCount?: BonusPrimitive;
  sportId: BonusPrimitive;
  categoryId: BonusPrimitive;
  tournamentId: BonusPrimitive;
  fixtureId?: BonusPrimitive;
  startDate: BonusPrimitive;
  endDate: BonusPrimitive;
};

export type UpdateBonusPayload = Omit<CreateBonusPayload, "id"> & {
  id: number | string;
  fixture?: BonusPrimitive;
};

export type BonusCampaignPayload = {
  clientId?: number | string;
  name: string;
  bonusCode: string;
  bonusId: number | string;
  startDate: string;
  endDate: string;
  affiliateIds: string;
  trackierCampaignId: string;
};

export type UpdateBonusCampaignPayload = BonusCampaignPayload & {
  id: number | string;
};

export type AccaBonusSection = "onliners" | "shop" | string;

export type AccaBonusItem = {
  id: string | number;
  client_id: string | number;
  section: AccaBonusSection;
  ticket_length: number;
  min_odd: number;
  bonus: string | number;
  created?: Record<string, unknown>;
  updated?: Record<string, unknown>;
  ticketLength?: number;
};

export type SaveAccaBonusPayload = {
  section: AccaBonusSection;
  items: AccaBonusItem[];
};

export const bonusesApi = {
  // Power Bonus Configurations
  getPowerBonusConfigurations() {
    return unwrapData(
      newApiClient.get(`/commission/${clientId}/power-bonus/configurations`)
    );
  },

  createPowerBonusConfiguration(payload: Record<string, unknown>) {
    return unwrapData(
      newApiClient.post(`/commission/${clientId}/power-bonus/create-configuration`, payload)
    );
  },

  updatePowerBonusConfiguration(id: string | number, payload: Record<string, unknown>) {
    return unwrapData(
      newApiClient.patch(`/commission/${clientId}/power-bonus/update-configuration/${id}`, payload)
    );
  },

  // Agent Assignments
  assignAgentToPowerBonus(payload: { agentId: string; powerBonusId: string; provider: string }) {
    return unwrapData(
      newApiClient.post(`/commission/${clientId}/power-bonus/assign-agent`, payload)
    );
  },

  listAgentPowerBonusAssignments(agentId: string) {
    return unwrapData(
      newApiClient.get(`/commission/${clientId}/power-bonus/agent/${agentId}/assignments`)
    );
  },

  getOneAgentPowerBonusAssignment(agentId: string, powerBonusId: string) {
    return unwrapData(
      newApiClient.get(`/commission/${clientId}/power-bonus/agent/${agentId}/assignment/${powerBonusId}`)
    );
  },

  // Calculations & Dashboard
  calculatePowerBonusForAgent(payload: { provider: string; from: string; to: string; agentId?: string }) {
    return unwrapData(
      newApiClient.post(`/commission/${clientId}/power-bonus/calculate-for-agent`, payload)
    );
  },

  getPowerBonusDashboard(payload: { provider: string; from: string; to: string }) {
    return unwrapData(
      newApiClient.post(`/commission/${clientId}/power-bonus/dashboard`, payload)
    );
  },

  // Payout
  payPowerBonusToAgents(payload: { provider: string; from: string; to: string }) {
    return unwrapData(
      newApiClient.post(`/commission/${clientId}/power-bonus/pay`, payload)
    );
  },

  getPlayerBonuses(inputClientId: number | string = clientId) {
    return unwrapData(
      newApiClient.get(`/admin/bonus/list?clientId=${inputClientId}`)
    );
  },

  getPlayerBonusesReport(payload: PlayerBonusesReportPayload) {
    const query = new URLSearchParams({
      clientId: String(payload.clientId ?? clientId),
      from: payload.from,
      to: payload.to,
      bonusType: payload.bonusType ?? "registration",
    });

    return unwrapData(
      newApiClient.get(`/admin/bonus/player-bonus?${query.toString()}`)
    );
  },

  getBonuses() {
    return this.getPlayerBonuses();
  },

  createBonus(payload: CreateBonusPayload) {
    return unwrapData(
      newApiClient.post(`/admin/bonus/create`, {
        clientId,
        ...payload,
      })
    );
  },

  updateBonus(id: number | string, payload: Partial<UpdateBonusPayload>) {
    return unwrapData(
      newApiClient.put(`/admin/bonus/update`, {
        clientId,
        id,
        ...payload,
      })
    );
  },

  updatePlayerBonus(payload: UpdateBonusPayload) {
    return unwrapData(
      newApiClient.put(`/admin/bonus/update`, {
        clientId,
        ...payload,
      })
    );
  },

  deleteBonus(id: number | string, inputClientId: number | string = clientId) {
    return unwrapData(
      newApiClient.delete(
        `/admin/bonus/delete-bonus/${id}?client_id=${encodeURIComponent(String(inputClientId))}`
      )
    );
  },

  getBonusCampaigns(inputClientId: number | string = clientId) {
    return unwrapData(
      newApiClient.get(`/admin/bonus/campaign/${inputClientId}/list`)
    );
  },

  createBonusCampaign(payload: BonusCampaignPayload) {
    return unwrapData(
      newApiClient.post(`/admin/bonus/create-campaign`, {
        clientId,
        ...payload,
      })
    );
  },

  updateBonusCampaign(payload: UpdateBonusCampaignPayload) {
    return unwrapData(
      newApiClient.put(`/admin/bonus/update-campaign`, {
        clientId,
        ...payload,
      })
    );
  },

  deleteBonusCampaign(id: number | string, inputClientId: number | string = clientId) {
    return unwrapData(
      newApiClient.delete(
        `/admin/bonus/delete-campaign/${id}?client_id=${encodeURIComponent(String(inputClientId))}`
      )
    );
  },

  getMultibetBonuses() {
    return unwrapData(
      newApiClient.get(`/admin/bonus/acca-bonus`)
    );
  },

  saveMultibetBonuses(payload: SaveAccaBonusPayload) {
    return unwrapData(
      newApiClient.post(`/admin/bonus/acca-bonus`, payload)
    );
  },

  filterPlayersForMassBonus(payload: MassBonusPlayerFilterPayload) {
    const query = new URLSearchParams({
      clientId: String(payload.clientId ?? clientId),
      filterType: String(payload.filterType),
      startDate: payload.startDate,
      endDate: payload.endDate,
      minAmount: String(payload.minAmount ?? ""),
      maxAmount: String(payload.maxAmount ?? ""),
      depositCount: String(payload.depositCount ?? ""),
      page: String(payload.page ?? 1),
    });

    return unwrapData(
      newApiClient.get(`/admin/players/filter?${query.toString()}`)
    );
  },

  grantMassBonus(payload: GrantMassBonusPayload, inputClientId: number | string = clientId) {
    return unwrapData(
      newApiClient.post(
        `/admin/bonus/award?client_id=${encodeURIComponent(String(inputClientId))}`,
        payload
      )
    );
  },

  giveBonus(payload: GiveBonusPayload) {
    return unwrapData(
      newApiClient.post(`/admin/players/give-bonus`, {
        clientId,
        ...payload,
      })
    );
  },
};
