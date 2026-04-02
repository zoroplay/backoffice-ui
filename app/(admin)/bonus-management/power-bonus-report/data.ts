export interface BonusTier {
  id: string;
  minSelections: number;
  maxSelections: number;
  rateLowMargin: number;
  rateHighMargin: number;
}

export interface PowerBonusConfig {
  id: string;
  provider: string;
  targetStake: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  tiers: BonusTier[];
  createdAt: string;
}

export interface AgentAssignment {
  id: string;
  powerBonusId: string;
  agentId: string;
  provider: string;
  createdAt: string;
}

export interface DashboardRow {
  agent: string;
  totalTickets: number;
  totalStake: number;
  weightedStake: number;
  avgSelections: number;
  totalWinnings: number;
  ggr: number;
  margin: number;
  rate: number;
  grossBonus: number;
  commissionDeducted: number;
  netBonus: number;
  eligible: boolean;
}

export const providers = ["sports", "virtuals"]


