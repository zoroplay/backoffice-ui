"use client";

export type Status = "Active" | "Inactive";

export type TournamentNode = {
  id: string;
  name: string;
  order: number;
  status: Status;
  image?: string;
};

export type CategoryNode = {
  id: string;
  name: string;
  order: number;
  status: Status;
  tournaments: TournamentNode[];
};

export type SportNode = {
  id: string;
  name: string;
  order: number;
  status: Status;
  categories: CategoryNode[];
};

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

export const statusOptions: SelectOption<Status>[] = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

export const sportsMenuSeed: SportNode[] = [
  {
    id: "sport-soccer",
    name: "Soccer",
    order: 1,
    status: "Active",
    categories: [
      {
        id: "cat-international",
        name: "International",
        order: 1,
        status: "Active",
        tournaments: [
          {
            id: "tour-world-cup-qual",
            name: "World Cup Qualification UEFA",
            order: 1,
            status: "Active",
          },
          {
            id: "tour-afc-asian-cup",
            name: "AFC Asian Cup",
            order: 2,
            status: "Inactive",
          },
        ],
      },
      {
        id: "cat-domestic",
        name: "Domestic Leagues",
        order: 2,
        status: "Active",
        tournaments: [
          {
            id: "tour-premier-league",
            name: "Premier League",
            order: 1,
            status: "Active",
          },
        ],
      },
    ],
  },
  {
    id: "sport-basketball",
    name: "Basketball",
    order: 2,
    status: "Active",
    categories: [
      {
        id: "cat-basketball-world",
        name: "World",
        order: 1,
        status: "Active",
        tournaments: [
          {
            id: "tour-nba",
            name: "NBA",
            order: 1,
            status: "Active",
          },
          {
            id: "tour-euroleague",
            name: "EuroLeague",
            order: 2,
            status: "Active",
          },
        ],
      },
    ],
  },
];

