export type Tournament = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  tournaments: Tournament[];
};

export type Sport = {
  id: string;
  name: string;
  categories: Category[];
};

export const sportsData: Sport[] = [
  {
    id: "sport-soccer",
    name: "Soccer",
    categories: [
      {
        id: "category-international",
        name: "International",
        tournaments: [
          { id: "tournament-uefa-champions", name: "UEFA Champions League" },
          { id: "tournament-world-cup", name: "FIFA World Cup" },
          { id: "tournament-euro-qualifiers", name: "World Cup Qualification UEFA" },
        ],
      },
      {
        id: "category-england",
        name: "England",
        tournaments: [
          { id: "tournament-premier-league", name: "Premier League" },
          { id: "tournament-fa-cup", name: "FA Cup" },
          { id: "tournament-championship", name: "EFL Championship" },
        ],
      },
    ],
  },
  {
    id: "sport-basketball",
    name: "Basketball",
    categories: [
      {
        id: "category-us",
        name: "North America",
        tournaments: [
          { id: "tournament-nba", name: "NBA" },
          { id: "tournament-wnba", name: "WNBA" },
        ],
      },
      {
        id: "category-europe",
        name: "Europe",
        tournaments: [
          { id: "tournament-euroleague", name: "EuroLeague" },
          { id: "tournament-acb", name: "Liga ACB" },
        ],
      },
    ],
  },
  {
    id: "sport-tennis",
    name: "Tennis",
    categories: [
      {
        id: "category-grand-slams",
        name: "Grand Slams",
        tournaments: [
          { id: "tournament-wimbledon", name: "Wimbledon" },
          { id: "tournament-us-open", name: "US Open" },
          { id: "tournament-roland-garros", name: "Roland Garros" },
        ],
      },
      {
        id: "category-atp",
        name: "ATP Tour",
        tournaments: [
          { id: "tournament-atp-finals", name: "ATP Finals" },
          { id: "tournament-atp-1000", name: "ATP Masters 1000" },
        ],
      },
    ],
  },
];
