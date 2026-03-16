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

export const providers = ["BTI", "Draft", "Sportradar", "Betgenius"];

export const mockConfigs: PowerBonusConfig[] = [
  {
    id: "PB-001",
    provider: "BTI",
    targetStake: 50000,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    isActive: true,
    tiers: [
      { id: "1", minSelections: 3, maxSelections: 5, rateLowMargin: 2.5, rateHighMargin: 5.0 }
    ],
    createdAt: "2023-12-15T10:00:00Z"
  }
];

export const mockAssignments: AgentAssignment[] = [
  {
    id: "AS-001",
    powerBonusId: "PB-001",
    agentId: "AGENT-X",
    provider: "BTI",
    createdAt: "2024-01-05T14:30:00Z"
  }
];

export const mockDashboard: DashboardRow[] = [
  {
    agent: "AGENT-X",
    totalTickets: 150,
    totalStake: 25000,
    weightedStake: 24500,
    avgSelections: 4.2,
    totalWinnings: 18000,
    ggr: 7000,
    margin: 28.0,
    rate: 3.5,
    grossBonus: 875,
    commissionDeducted: 75,
    netBonus: 800,
    eligible: true
  }
];
