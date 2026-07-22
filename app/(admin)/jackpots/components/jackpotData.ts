export type JackpotFixture = {
  providerId: string;
  eventName: string;
  schedule: string;
};

export type JackpotBonus = {
  lostGames: number;
  amount: number;
};

export type JackpotCampaign = {
  id: string;
  title: string;
  amount: number;
  stake: number;
  agentCommission: number;
  terms: string;
  fixtures: JackpotFixture[];
  bonuses: JackpotBonus[];
  totalBets: number;
  ggr: number;
};

export type JackpotManagementFixture = {
  eventId: string;
  team1: string;
  team2: string;
  eventName: string;
};

export type JackpotManagementDetails = {
  title: string;
  description: string;
  stake: string;
  endDate: string;
  status: "1" | "0";
};

export const campaignFixtureLookup: JackpotFixture[] = [
  { providerId: "1001", eventName: "Arsenal - Chelsea", schedule: "2026-07-25 16:00" },
  { providerId: "1002", eventName: "Manchester City - Liverpool", schedule: "2026-07-26 18:30" },
  { providerId: "2001", eventName: "Real Madrid - Barcelona", schedule: "2026-07-27 20:00" },
  { providerId: "3001", eventName: "Inter - Juventus", schedule: "2026-07-28 19:45" },
  { providerId: "4001", eventName: "Rangers - Enyimba", schedule: "2026-07-29 17:00" },
];

export const jackpotCampaigns: JackpotCampaign[] = [
  {
    id: "1",
    title: "Super Weekend Jackpot",
    amount: 10000000,
    stake: 100,
    agentCommission: 5,
    terms: "Predict all selected fixtures correctly to win the jackpot. Minimum stake applies to every ticket.",
    fixtures: [campaignFixtureLookup[0], campaignFixtureLookup[1], campaignFixtureLookup[2]],
    bonuses: [
      { lostGames: 1, amount: 50000 },
      { lostGames: 2, amount: 25000 },
    ],
    totalBets: 245,
    ggr: 1500000,
  },
  {
    id: "2",
    title: "Midweek Mega Jackpot",
    amount: 5000000,
    stake: 50,
    agentCommission: 4,
    terms: "Midweek jackpot with selected continental fixtures. Multiple entries are allowed.",
    fixtures: [campaignFixtureLookup[2], campaignFixtureLookup[3]],
    bonuses: [{ lostGames: 1, amount: 25000 }],
    totalBets: 432,
    ggr: 850000,
  },
  {
    id: "3",
    title: "Friday Night Jackpot",
    amount: 15000000,
    stake: 200,
    agentCommission: 6,
    terms: "Premium jackpot for Friday fixtures. Entries close when the first selected fixture starts.",
    fixtures: [campaignFixtureLookup[0], campaignFixtureLookup[3], campaignFixtureLookup[4]],
    bonuses: [
      { lostGames: 1, amount: 100000 },
      { lostGames: 2, amount: 50000 },
      { lostGames: 3, amount: 25000 },
    ],
    totalBets: 178,
    ggr: 2100000,
  },
];

export const defaultJackpotManagementDetails: JackpotManagementDetails = {
  title: "Weekly Jackpot",
  description: "Predict selected fixtures to qualify for jackpot rewards.",
  stake: "100",
  endDate: "2026-07-31 23:59",
  status: "1",
};

export const jackpotManagementFixtures: JackpotManagementFixture[] = [
  { eventId: "EPL1001", team1: "Arsenal", team2: "Chelsea", eventName: "Arsenal - Chelsea" },
  { eventId: "EPL1002", team1: "Manchester City", team2: "Liverpool", eventName: "Manchester City - Liverpool" },
  { eventId: "LAL2001", team1: "Real Madrid", team2: "Barcelona", eventName: "Real Madrid - Barcelona" },
];

export const jackpotManagementSearchFixtures: JackpotManagementFixture[] = [
  ...jackpotManagementFixtures,
  { eventId: "SER3001", team1: "Inter", team2: "Juventus", eventName: "Inter - Juventus" },
  { eventId: "NPFL4001", team1: "Rangers", team2: "Enyimba", eventName: "Rangers - Enyimba" },
  { eventId: "UCL5001", team1: "PSG", team2: "Bayern Munich", eventName: "PSG - Bayern Munich" },
];

export function money(value: number) {
  return `NGN ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
