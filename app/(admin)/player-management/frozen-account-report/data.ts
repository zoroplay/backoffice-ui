export type FreezeType = "Manual" | "Automatic" | "Compliance";
export type PlayerStatus = "Frozen" | "Partially Frozen" | "Released";
export type ProcessStatus = "Pending" | "In Progress" | "Completed";

export interface FrozenAccount {
  username: string;
  fullName: string;
  balance: number;
  playerStatus: PlayerStatus;
  freezeDate: string;
  freezeType: FreezeType;
  reason: string;
  processStatus: ProcessStatus;
}

export const frozenAccounts: FrozenAccount[] = [
  {
    username: "ade_benson",
    fullName: "Ade Benson",
    balance: 32500,
    playerStatus: "Frozen",
    freezeDate: "2025-02-12",
    freezeType: "Manual",
    reason: "Suspected multiple accounts",
    processStatus: "Pending",
  },
  {
    username: "olivia_musa",
    fullName: "Olivia Musa",
    balance: 108000,
    playerStatus: "Partially Frozen",
    freezeDate: "2025-01-28",
    freezeType: "Compliance",
    reason: "KYC verification required",
    processStatus: "In Progress",
  },
  {
    username: "marco_santos",
    fullName: "Marco Santos",
    balance: 4520,
    playerStatus: "Frozen",
    freezeDate: "2024-12-19",
    freezeType: "Automatic",
    reason: "Chargeback dispute",
    processStatus: "Completed",
  },
  {
    username: "zainab_ali",
    fullName: "Zainab Ali",
    balance: 78000,
    playerStatus: "Released",
    freezeDate: "2024-11-05",
    freezeType: "Manual",
    reason: "Investigation closed",
    processStatus: "Completed",
  },
];

