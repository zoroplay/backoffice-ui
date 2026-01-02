"use client";

import sportsSource from "./sports.json";
import categoriesSource from "./categories.json";

export type Sport = {
  id: number;
  name: string;
};

export type Category = {
  id: number;
  sportId: number;
  name: string;
};

export type Tournament = {
  id: string;
  sportId: number;
  categoryId: number;
  name: string;
};

export type MarketSelection = {
  key: "home" | "draw" | "away";
  label: string;
  odds: number;
};

export type MarketDefinition = {
  id: string;
  name: string;
  selections: MarketSelection[];
};

export type UpcomingEvent = {
  id: string;
  sportId: number;
  categoryId: number;
  tournamentId: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  markets: MarketDefinition[];
};

export type CustomOddsOverride = {
  id: string;
  matchId: string;
  eventName: string;
  sport: string;
  tournament: string;
  market: string;
  outcome: string;
  customOdds: number;
  specifier: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
};

const featuredSportIds = [1, 2, 3, 4, 5, 10, 11, 12];

export const sports: Sport[] = sportsSource.sports
  .filter((sport) => featuredSportIds.includes(sport.sportID))
  .map((sport) => ({
    id: sport.sportID,
    name: sport.sportName,
  }));

const highlightedSoccerCategoryIds = [4, 393, 1, 32, 31, 30, 7];

const soccerCategories: Category[] = categoriesSource.categories
  .filter(
    (category) =>
      category.sportID === 1 && highlightedSoccerCategoryIds.includes(category.categoryID)
  )
  .map((category) => ({
    id: category.categoryID,
    sportId: category.sportID,
    name: category.categoryName,
  }));

const basketballCategories: Category[] = [
  { id: 2001, sportId: 2, name: "NBA" },
  { id: 2002, sportId: 2, name: "EuroLeague" },
  { id: 2003, sportId: 2, name: "FIBA World Cup" },
];

const baseballCategories: Category[] = [
  { id: 3001, sportId: 3, name: "MLB" },
  { id: 3002, sportId: 3, name: "NPB" },
];

const hockeyCategories: Category[] = [
  { id: 4001, sportId: 4, name: "NHL" },
  { id: 4002, sportId: 4, name: "KHL" },
];

const tennisCategories: Category[] = [
  { id: 5001, sportId: 5, name: "ATP Tour" },
  { id: 5002, sportId: 5, name: "WTA Tour" },
];

const combatCategories: Category[] = [
  { id: 10001, sportId: 10, name: "World Boxing" },
  { id: 11001, sportId: 11, name: "MotoGP Series" },
  { id: 12001, sportId: 12, name: "Rugby Union" },
];

export const categories: Category[] = [
  ...soccerCategories,
  ...basketballCategories,
  ...baseballCategories,
  ...hockeyCategories,
  ...tennisCategories,
  ...combatCategories,
];

export const tournaments: Tournament[] = [
  { id: "wcq-uefa", sportId: 1, categoryId: 4, name: "World Cup Qualification UEFA" },
  { id: "afc-asian-cup", sportId: 1, categoryId: 4, name: "AFC Asian Cup" },
  { id: "euros-qualifiers", sportId: 1, categoryId: 4, name: "Euro Qualification" },
  { id: "premier-league", sportId: 1, categoryId: 1, name: "Premier League" },
  { id: "la-liga", sportId: 1, categoryId: 32, name: "La Liga" },
  { id: "serie-a", sportId: 1, categoryId: 31, name: "Serie A" },
  { id: "bundesliga", sportId: 1, categoryId: 30, name: "Bundesliga" },
  { id: "ligue-1", sportId: 1, categoryId: 7, name: "Ligue 1" },
  { id: "nba-regular", sportId: 2, categoryId: 2001, name: "NBA Regular Season" },
  { id: "euroleague", sportId: 2, categoryId: 2002, name: "EuroLeague Group Stage" },
  { id: "mlb-regular", sportId: 3, categoryId: 3001, name: "MLB Regular Season" },
  { id: "nhl-regular", sportId: 4, categoryId: 4001, name: "NHL Regular Season" },
  { id: "atp-finals", sportId: 5, categoryId: 5001, name: "ATP Finals" },
  { id: "wta-finals", sportId: 5, categoryId: 5002, name: "WTA Finals" },
  { id: "heavyweight-title", sportId: 10, categoryId: 10001, name: "World Heavyweight Championship" },
  { id: "motogp-qat", sportId: 11, categoryId: 11001, name: "MotoGP Qatar Grand Prix" },
  { id: "rugby-six-nations", sportId: 12, categoryId: 12001, name: "Six Nations" },
];

const makeMarket = (
  id: string,
  name: string,
  home: number,
  draw: number,
  away: number,
  labels?: [string, string, string]
): MarketDefinition => ({
  id,
  name,
  selections: [
    { key: "home", label: labels?.[0] ?? "1", odds: home },
    { key: "draw", label: labels?.[1] ?? "X", odds: draw },
    { key: "away", label: labels?.[2] ?? "2", odds: away },
  ],
});

export const upcomingEvents: UpcomingEvent[] = [
  {
    id: "EVT-2025-001",
    sportId: 1,
    categoryId: 4,
    tournamentId: "wcq-uefa",
    kickoff: "2025-11-13T17:00:00Z",
    homeTeam: "Azerbaijan",
    awayTeam: "Iceland",
    markets: [
      makeMarket("1x2", "1X2", 6, 4.3, 1.52),
      makeMarket("double", "Double Chance", 1.25, 1.53, 1.16, ["1X", "12", "X2"]),
    ],
  },
  {
    id: "EVT-2025-002",
    sportId: 1,
    categoryId: 4,
    tournamentId: "afc-asian-cup",
    kickoff: "2025-11-13T17:00:00Z",
    homeTeam: "Armenia",
    awayTeam: "Hungary",
    markets: [
      makeMarket("1x2", "1X2", 5.4, 4.09, 1.58),
      makeMarket("double", "Double Chance", 1.34, 1.52, 1.2, ["1X", "12", "X2"]),
    ],
  },
  {
    id: "EVT-2025-003",
    sportId: 1,
    categoryId: 4,
    tournamentId: "euros-qualifiers",
    kickoff: "2025-11-13T19:00:00Z",
    homeTeam: "Norway",
    awayTeam: "Estonia",
    markets: [
      makeMarket("1x2", "1X2", 1.02, 17, 60),
      makeMarket("double", "Double Chance", 1.01, 1.02, 1.24, ["1X", "12", "X2"]),
    ],
  },
  {
    id: "EVT-2025-004",
    sportId: 1,
    categoryId: 4,
    tournamentId: "wcq-uefa",
    kickoff: "2025-11-13T19:45:00Z",
    homeTeam: "France",
    awayTeam: "Ukraine",
    markets: [
      makeMarket("1x2", "1X2", 1.19, 6.6, 14),
      makeMarket("double", "Double Chance", 1.05, 1.47, 1.35, ["1X", "12", "X2"]),
    ],
  },
  {
    id: "EVT-2025-005",
    sportId: 1,
    categoryId: 4,
    tournamentId: "wcq-uefa",
    kickoff: "2025-11-13T19:45:00Z",
    homeTeam: "Ireland",
    awayTeam: "Portugal",
    markets: [
      makeMarket("1x2", "1X2", 8.4, 5, 1.34),
      makeMarket("double", "Double Chance", 1.39, 1.62, 1.18, ["1X", "12", "X2"]),
    ],
  },
  {
    id: "EVT-2025-006",
    sportId: 1,
    categoryId: 4,
    tournamentId: "wcq-uefa",
    kickoff: "2025-11-13T19:45:00Z",
    homeTeam: "Moldova",
    awayTeam: "Italy",
    markets: [
      makeMarket("1x2", "1X2", 50, 13, 1.04),
      makeMarket("double", "Double Chance", 3.8, 1.55, 1.03, ["1X", "12", "X2"]),
    ],
  },
  {
    id: "EVT-2025-007",
    sportId: 1,
    categoryId: 4,
    tournamentId: "wcq-uefa",
    kickoff: "2025-11-13T19:45:00Z",
    homeTeam: "Andorra",
    awayTeam: "Albania",
    markets: [
      makeMarket("1x2", "1X2", 13, 5, 1.28),
      makeMarket("double", "Double Chance", 1.52, 1.32, 1.18, ["1X", "12", "X2"]),
    ],
  },
  {
    id: "EVT-2025-008",
    sportId: 1,
    categoryId: 4,
    tournamentId: "wcq-uefa",
    kickoff: "2025-11-13T19:45:00Z",
    homeTeam: "England",
    awayTeam: "Serbia",
    markets: [
      makeMarket("1x2", "1X2", 1.31, 5.2, 9.6),
      makeMarket("double", "Double Chance", 1.04, 1.36, 1.4, ["1X", "12", "X2"]),
    ],
  },
  {
    id: "EVT-2025-009",
    sportId: 1,
    categoryId: 4,
    tournamentId: "wcq-uefa",
    kickoff: "2025-11-14T17:00:00Z",
    homeTeam: "Finland",
    awayTeam: "Malta",
    markets: [
      makeMarket("1x2", "1X2", 1.22, 6.2, 13),
      makeMarket("double", "Double Chance", 1.08, 1.5, 1.3, ["1X", "12", "X2"]),
    ],
  },
];

export const customOddsOverrides: CustomOddsOverride[] = [
  {
    id: "CO-0001",
    matchId: "M-872331",
    eventName: "Azerbaijan vs. Iceland",
    sport: "Soccer",
    tournament: "World Cup Qualification UEFA",
    market: "1X2",
    outcome: "Home Win",
    customOdds: 6.3,
    specifier: "FT",
    status: "Pending",
    createdAt: "2025-11-10T09:15:00Z",
  },
  {
    id: "CO-0002",
    matchId: "M-872332",
    eventName: "France vs. Ukraine",
    sport: "Soccer",
    tournament: "World Cup Qualification UEFA",
    market: "Over/Under 2.5",
    outcome: "Over 2.5",
    customOdds: 1.88,
    specifier: "FT",
    status: "Approved",
    createdAt: "2025-11-10T08:30:00Z",
  },
  {
    id: "CO-0003",
    matchId: "M-872420",
    eventName: "England vs. Serbia",
    sport: "Soccer",
    tournament: "World Cup Qualification UEFA",
    market: "Both Teams To Score",
    outcome: "Yes",
    customOdds: 1.95,
    specifier: "FT",
    status: "Rejected",
    createdAt: "2025-11-09T17:42:00Z",
  },
  {
    id: "CO-0004",
    matchId: "BKB-10221",
    eventName: "Lakers vs. Warriors",
    sport: "Basketball",
    tournament: "NBA Regular Season",
    market: "Spread",
    outcome: "Lakers -4.5",
    customOdds: 1.91,
    specifier: "OT Included",
    status: "Pending",
    createdAt: "2025-11-11T12:05:00Z",
  },
];

export const statusFilterOptions = [
  { value: "all", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
] as const;

export const sportFilterOptions = sports.map((sport) => ({
  value: sport.name,
  label: sport.name,
}));

export const marketFilterOptions = [
  { value: "all", label: "All Markets" },
  { value: "1X2", label: "1X2" },
  { value: "Double Chance", label: "Double Chance" },
  { value: "Both Teams To Score", label: "Both Teams To Score" },
  { value: "Spread", label: "Spread" },
];

