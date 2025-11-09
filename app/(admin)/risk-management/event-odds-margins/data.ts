"use client";

import type { Competition, SportsHierarchy } from "./types";

export const combinabilityOptions = [
  { value: "all", label: "All Markets" },
  { value: "singles", label: "Singles Only" },
  { value: "multiples", label: "Multiples Only" },
] as const;

const createCompetition = (
  id: string,
  name: string,
  events: Competition["events"],
  overrides?: Partial<Competition["settings"]>
): Competition => ({
  id,
  name,
  events,
  settings: {
    margin: 2.5,
    combinability: "all",
    status: "enabled",
    cashOut: "enabled",
    ...overrides,
  },
});

export const sportsHierarchy: SportsHierarchy = [
  {
    id: "sport-soccer",
    name: "Soccer",
    regions: [
      {
        id: "region-international",
        name: "International",
        competitions: [
          createCompetition("comp-wcq-europe", "World Cup Qualification UEFA", [
            {
              id: "event-az-iceland",
              eventName: "Azerbaijan vs. Iceland",
              matchId: "61300725",
              startTime: "2025-11-08T17:30:00",
              highlighted: false,
              status: "active",
            },
            {
              id: "event-fr-ukraine",
              eventName: "France vs. Ukraine",
              matchId: "61300731",
              startTime: "2025-11-08T20:00:00",
              highlighted: false,
              status: "active",
            },
          ]),
          createCompetition("comp-euro-qual", "Euro Qualification", [
            {
              id: "event-nor-est",
              eventName: "Norway vs. Estonia",
              matchId: "61300802",
              startTime: "2025-11-09T18:00:00",
              highlighted: true,
              status: "active",
            },
          ]),
        ],
      },
      {
        id: "region-england",
        name: "England",
        competitions: [
          createCompetition("comp-premier-league", "Premier League", [
            {
              id: "event-tot-mnu",
              eventName: "Tottenham Hotspur vs. Manchester United",
              matchId: "61300725",
              startTime: "2025-11-08T12:30:00",
              highlighted: true,
              status: "active",
            },
            {
              id: "event-che-ars",
              eventName: "Chelsea FC vs. Arsenal FC",
              matchId: "61300721",
              startTime: "2025-11-08T17:30:00",
              highlighted: false,
              status: "active",
            },
            {
              id: "event-mci-liv",
              eventName: "Manchester City vs. Liverpool FC",
              matchId: "61300717",
              startTime: "2025-11-09T16:30:00",
              highlighted: false,
              status: "active",
            },
          ]),
          createCompetition("comp-championship", "Championship", [
            {
              id: "event-not-lee",
              eventName: "Nottingham Forest vs. Leeds United",
              matchId: "61300780",
              startTime: "2025-11-08T14:00:00",
              highlighted: false,
              status: "inactive",
            },
          ]),
        ],
      },
    ],
  },
  {
    id: "sport-basketball",
    name: "Basketball",
    regions: [
      {
        id: "region-usa",
        name: "USA",
        competitions: [
          createCompetition("comp-nba", "NBA", [
            {
              id: "event-lal-gsw",
              eventName: "Los Angeles Lakers vs. Golden State Warriors",
              matchId: "71300780",
              startTime: "2025-11-10T02:00:00",
              highlighted: false,
              status: "active",
            },
            {
              id: "event-nyk-bos",
              eventName: "New York Knicks vs. Boston Celtics",
              matchId: "71300782",
              startTime: "2025-11-10T00:30:00",
              highlighted: false,
              status: "active",
            },
          ]),
        ],
      },
      {
        id: "region-europe",
        name: "Europe",
        competitions: [
          createCompetition(
            "comp-euroleague",
            "EuroLeague",
            [
              {
                id: "event-real-barca",
                eventName: "Real Madrid vs. FC Barcelona",
                matchId: "71310821",
                startTime: "2025-11-11T19:45:00",
                highlighted: false,
                status: "active",
              },
            ],
            { margin: 3.2, combinability: "multiples" }
          ),
        ],
      },
    ],
  },
  {
    id: "sport-tennis",
    name: "Tennis",
    regions: [
      {
        id: "region-atp",
        name: "ATP Tour",
        competitions: [
          createCompetition("comp-atp-finals", "ATP Finals", [
            {
              id: "event-djokovic-alcaraz",
              eventName: "Novak Djokovic vs. Carlos Alcaraz",
              matchId: "81301001",
              startTime: "2025-11-12T15:00:00",
              highlighted: true,
              status: "active",
            },
            {
              id: "event-sinner-medvedev",
              eventName: "Jannik Sinner vs. Daniil Medvedev",
              matchId: "81301005",
              startTime: "2025-11-12T19:30:00",
              highlighted: false,
              status: "active",
            },
          ]),
        ],
      },
    ],
  },
];

