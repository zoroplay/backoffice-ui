import marketsJson from "./markets.json";
import sportsJson from "./sport.json";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

export type MarketGroup = {
  id: string;
  sport: string;
  name: string;
  description: string;
  marketCount: number;
  lastUpdated: string;
};

export type MarketDefinition = {
  id: string;
  sport: string;
  marketType: string;
  groupId: string;
  name: string;
  shortName: string;
  description: string;
  specifier: string;
  status: "Enabled" | "Disabled";
  cashout: "Enabled" | "Disabled";
  priority: number;
  isPopular: boolean;
  lastUpdated: string;
};

export type TournamentMarket = {
  id: string;
  sport: string;
  category: string;
  tournament: string;
  name: string;
  status: "Active" | "Inactive";
  action?: string;
};

export type SportHierarchy = {
  sport: SelectOption;
  categories: Array<{
    category: SelectOption;
    tournaments: Array<{
      tournament: SelectOption;
      marketIds: string[];
    }>;
  }>;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const dedupeOptions = (options: SelectOption[]): SelectOption[] => {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
};

const rawSportsOptions: SelectOption[] = dedupeOptions(
  (sportsJson.sports ?? []).map((sport) => ({
    value: slugify(sport.sportName),
    label: sport.sportName,
  }))
);

const preferredSlugOrder = ["soccer", "basketball", "tennis", "american-football", "baseball"];

const preferredOptions = preferredSlugOrder
  .map((slug) => rawSportsOptions.find((option) => option.value === slug))
  .filter((option): option is SelectOption => Boolean(option));

const fallbackOptions = rawSportsOptions.filter(
  (option) => !preferredSlugOrder.includes(option.value)
);

export const sportsOptions: SelectOption[] = [...preferredOptions, ...fallbackOptions.slice(0, 40)];

export const sportHierarchy: SportHierarchy[] = [
  {
    sport: sportsOptions.find((option) => option.value === "soccer") ?? {
      value: "soccer",
      label: "Soccer",
    },
    categories: [
      {
        category: { value: "premier-league", label: "Premier League" },
        tournaments: [
          {
            tournament: { value: "pl-2024", label: "2024 Season" },
            marketIds: ["mkt-1", "mkt-2", "mkt-3"],
          },
          {
            tournament: { value: "pl-2023", label: "2023 Season" },
            marketIds: ["mkt-1", "mkt-4"],
          },
        ],
      },
      {
        category: { value: "champions-league", label: "UEFA Champions League" },
        tournaments: [
          {
            tournament: { value: "ucl-knockout", label: "Knockout Phase" },
            marketIds: ["mkt-2", "mkt-5"],
          },
          {
            tournament: { value: "ucl-group", label: "Group Stage" },
            marketIds: ["mkt-1", "mkt-3"],
          },
        ],
      },
      {
        category: { value: "la-liga", label: "La Liga" },
        tournaments: [
          {
            tournament: { value: "laliga-2024", label: "2024/25 Season" },
            marketIds: ["mkt-1", "mkt-2", "mkt-5"],
          },
          {
            tournament: { value: "laliga-derby", label: "Madrid Derby Specials" },
            marketIds: ["mkt-3", "mkt-4"],
          },
        ],
      },
      {
        category: { value: "serie-a", label: "Serie A" },
        tournaments: [
          {
            tournament: { value: "seriea-2024", label: "2024/25 Season" },
            marketIds: ["mkt-1", "mkt-2", "mkt-3"],
          },
          {
            tournament: { value: "seriea-cup", label: "Coppa Italia" },
            marketIds: ["mkt-2", "mkt-5"],
          },
        ],
      },
    ],
  },
  {
    sport: sportsOptions.find((option) => option.value === "basketball") ?? {
      value: "basketball",
      label: "Basketball",
    },
    categories: [
      {
        category: { value: "nba", label: "NBA" },
        tournaments: [
          {
            tournament: { value: "nba-regular", label: "Regular Season" },
            marketIds: ["mkt-6", "mkt-7"],
          },
          {
            tournament: { value: "nba-playoffs", label: "Playoffs" },
            marketIds: ["mkt-7"],
          },
        ],
      },
      {
        category: { value: "euroleague", label: "EuroLeague" },
        tournaments: [
          {
            tournament: { value: "euro-main", label: "Main Season" },
            marketIds: ["mkt-6"],
          },
        ],
      },
      {
        category: { value: "ncaa", label: "NCAA" },
        tournaments: [
          {
            tournament: { value: "ncaa-madness", label: "March Madness" },
            marketIds: ["mkt-6", "mkt-7"],
          },
          {
            tournament: { value: "ncaa-regular", label: "Regular Season" },
            marketIds: ["mkt-7"],
          },
        ],
      },
      {
        category: { value: "wnba", label: "WNBA" },
        tournaments: [
          {
            tournament: { value: "wnba-regular", label: "WNBA Regular Season" },
            marketIds: ["mkt-6"],
          },
          {
            tournament: { value: "wnba-playoffs", label: "WNBA Playoffs" },
            marketIds: ["mkt-6", "mkt-7"],
          },
        ],
      },
    ],
  },
  {
    sport: sportsOptions.find((option) => option.value === "tennis") ?? {
      value: "tennis",
      label: "Tennis",
    },
    categories: [
      {
        category: { value: "atp", label: "ATP Tour" },
        tournaments: [
          {
            tournament: { value: "wimbledon", label: "Wimbledon" },
            marketIds: ["mkt-8", "mkt-9"],
          },
        ],
      },
      {
        category: { value: "wta", label: "WTA Tour" },
        tournaments: [
          {
            tournament: { value: "us-open", label: "US Open" },
            marketIds: ["mkt-8"],
          },
        ],
      },
      {
        category: { value: "grand-slam", label: "Grand Slams" },
        tournaments: [
          {
            tournament: { value: "australian-open", label: "Australian Open" },
            marketIds: ["mkt-8", "mkt-9"],
          },
          {
            tournament: { value: "roland-garros", label: "Roland Garros" },
            marketIds: ["mkt-8"],
          },
          {
            tournament: { value: "us-open-series", label: "US Open Series" },
            marketIds: ["mkt-9"],
          },
        ],
      },
    ],
  },
];

export const marketGroups: MarketGroup[] = [
  {
    id: "grp-1",
    sport: "soccer",
    name: "Full Time Result",
    description: "Win-draw-win outcomes for standard matches.",
    marketCount: 6,
    lastUpdated: "2024-04-18T10:24:00Z",
  },
  {
    id: "grp-2",
    sport: "soccer",
    name: "Goals & Totals",
    description: "Over/under and goal bands for popular fixtures.",
    marketCount: 8,
    lastUpdated: "2024-04-21T09:40:00Z",
  },
  {
    id: "grp-3",
    sport: "basketball",
    name: "Game Lines",
    description: "Spread, moneyline, and total points markets.",
    marketCount: 5,
    lastUpdated: "2024-04-16T12:05:00Z",
  },
  {
    id: "grp-4",
    sport: "basketball",
    name: "Player Specials",
    description: "Points, rebounds, and assist props per player.",
    marketCount: 7,
    lastUpdated: "2024-04-14T16:12:00Z",
  },
  {
    id: "grp-5",
    sport: "tennis",
    name: "Match Result",
    description: "Match winner and correct set score combos.",
    marketCount: 4,
    lastUpdated: "2024-04-19T08:45:00Z",
  },
];

const baseMarketDefinitions: MarketDefinition[] = [
  {
    id: "mkt-1",
    sport: "soccer",
    marketType: "BetRadar",
    groupId: "grp-1",
    name: "Full Time Result",
    shortName: "1X2",
    description: "Predict match outcome at 90 minutes.",
    specifier: "Match",
    status: "Enabled",
    cashout: "Enabled",
    priority: 1,
    isPopular: true,
    lastUpdated: "2024-04-18T14:10:00Z",
  },
  {
    id: "mkt-2",
    sport: "soccer",
    marketType: "BetRadar",
    groupId: "grp-2",
    name: "Total Goals Over/Under 2.5",
    shortName: "O/U 2.5",
    description: "Predict if total goals will be over or under 2.5.",
    specifier: "Goals",
    status: "Enabled",
    cashout: "Enabled",
    priority: 2,
    isPopular: true,
    lastUpdated: "2024-04-20T08:50:00Z",
  },
  {
    id: "mkt-3",
    sport: "soccer",
    marketType: "Custom",
    groupId: "grp-2",
    name: "Both Teams To Score",
    shortName: "BTTS",
    description: "Both teams to score at least one goal.",
    specifier: "Match",
    status: "Enabled",
    cashout: "Disabled",
    priority: 3,
    isPopular: false,
    lastUpdated: "2024-04-15T11:32:00Z",
  },
  {
    id: "mkt-4",
    sport: "soccer",
    marketType: "Custom",
    groupId: "grp-1",
    name: "Double Chance",
    shortName: "DC",
    description: "Cover two possible match outcomes.",
    specifier: "Match",
    status: "Disabled",
    cashout: "Disabled",
    priority: 4,
    isPopular: false,
    lastUpdated: "2024-04-10T09:20:00Z",
  },
  {
    id: "mkt-5",
    sport: "soccer",
    marketType: "BetRadar",
    groupId: "grp-2",
    name: "Correct Score",
    shortName: "CS",
    description: "Predict the exact final score.",
    specifier: "Score",
    status: "Disabled",
    cashout: "Disabled",
    priority: 6,
    isPopular: false,
    lastUpdated: "2024-04-12T15:05:00Z",
  },
  {
    id: "mkt-6",
    sport: "basketball",
    marketType: "BetRadar",
    groupId: "grp-3",
    name: "Point Spread",
    shortName: "Spread",
    description: "Handicap spread lines for basketball games.",
    specifier: "Line",
    status: "Enabled",
    cashout: "Enabled",
    priority: 1,
    isPopular: true,
    lastUpdated: "2024-04-17T17:45:00Z",
  },
  {
    id: "mkt-7",
    sport: "basketball",
    marketType: "Custom",
    groupId: "grp-4",
    name: "Player Points Over/Under",
    shortName: "Player Pts",
    description: "Total points scored by a specific player.",
    specifier: "Player",
    status: "Enabled",
    cashout: "Disabled",
    priority: 5,
    isPopular: false,
    lastUpdated: "2024-04-13T12:22:00Z",
  },
  {
    id: "mkt-8",
    sport: "tennis",
    marketType: "BetRadar",
    groupId: "grp-5",
    name: "Match Winner",
    shortName: "MW",
    description: "Predict the winner of the tennis match.",
    specifier: "Match",
    status: "Enabled",
    cashout: "Enabled",
    priority: 1,
    isPopular: true,
    lastUpdated: "2024-04-14T10:18:00Z",
  },
  {
    id: "mkt-9",
    sport: "tennis",
    marketType: "Custom",
    groupId: "grp-5",
    name: "Total Sets",
    shortName: "Sets",
    description: "Predict the total number of sets played.",
    specifier: "Sets",
    status: "Enabled",
    cashout: "Disabled",
    priority: 2,
    isPopular: false,
    lastUpdated: "2024-04-11T07:59:00Z",
  },
];

const groupLookup: Record<string, string> = marketGroups.reduce((acc, group) => {
  if (!acc[group.sport]) {
    acc[group.sport] = group.id;
  }
  return acc;
}, {} as Record<string, string>);

const marketTypeCycle: MarketDefinition["marketType"][] = ["BetRadar", "Custom", "In-House"];
const statusCycle: Array<MarketDefinition["status"]> = ["Enabled", "Disabled"];
const cashoutCycle: Array<MarketDefinition["cashout"]> = ["Enabled", "Disabled"];
const sportCycle = ["soccer", "basketball", "tennis"] as const;

const generatedMarketDefinitions: MarketDefinition[] = (marketsJson.data ?? [])
  .slice(0, 60)
  .map((market, index) => {
    const sport = sportCycle[index % sportCycle.length] ?? "soccer";
    const groupId = groupLookup[sport] ?? marketGroups[0]?.id ?? "grp-1";
    const name = market.marketName;
    return {
      id: `json-${market.marketID}`,
      sport,
      marketType: marketTypeCycle[index % marketTypeCycle.length] ?? "Custom",
      groupId,
      name,
      shortName: name.slice(0, 10),
      description: `Imported market: ${name}`,
      specifier: "Match",
      status: statusCycle[index % statusCycle.length] ?? "Enabled",
      cashout: cashoutCycle[index % cashoutCycle.length] ?? "Disabled",
      priority: 5 + index,
      isPopular: index % 3 === 0,
      lastUpdated: new Date(Date.now() - index * 36_000_00).toISOString(),
    };
  });

export const marketDefinitions: MarketDefinition[] = [
  ...baseMarketDefinitions,
  ...generatedMarketDefinitions,
];

