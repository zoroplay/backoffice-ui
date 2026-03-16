import { newApiClient, unwrapData } from "../client";
import { apiEnv } from "../env";

const clientId = apiEnv.clientId;

export const bonusesApi = {
  // Power Bonus Configurations
  getPowerBonusConfigurations() {
    return unwrapData(
      newApiClient.get(`/commission/${clientId}/power-bonus/configurations`)
    );
  },

  createPowerBonusConfiguration(payload: any) {
    return unwrapData(
      newApiClient.post(`/commission/${clientId}/power-bonus/create-configuration`, payload)
    );
  },

  updatePowerBonusConfiguration(id: string | number, payload: any) {
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
};
