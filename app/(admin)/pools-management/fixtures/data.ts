export interface PoolFixture {
  id: string;
  serial: number;
  division: string;
  eventId: string;
  eventName: string;
  market: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  date: string;
  time: string;
  scores: string;
  result: string;
  status: "Pending" | "Settled" | "Live";
}

export const poolFixtures: PoolFixture[] = [
  {
    id: "1",
    serial: 1,
    division: "Premier League",
    eventId: "EPL-2025-115",
    eventName: "Chelsea vs Arsenal",
    market: "1X2",
    odds: { home: 2.45, draw: 3.3, away: 2.85 },
    date: "2025-11-10",
    time: "18:45",
    scores: "-:-",
    result: "Pending",
    status: "Pending",
  },
  {
    id: "2",
    serial: 2,
    division: "La Liga",
    eventId: "LL-2025-207",
    eventName: "Real Madrid vs Sevilla",
    market: "1X2",
    odds: { home: 1.62, draw: 3.9, away: 5.2 },
    date: "2025-11-11",
    time: "21:00",
    scores: "-:-",
    result: "Pending",
    status: "Pending",
  },
  {
    id: "3",
    serial: 3,
    division: "Serie A",
    eventId: "SA-2025-311",
    eventName: "Juventus vs Napoli",
    market: "1X2",
    odds: { home: 2.15, draw: 3.4, away: 3.25 },
    date: "2025-11-12",
    time: "20:30",
    scores: "-:-",
    result: "Pending",
    status: "Pending",
  },
  {
    id: "4",
    serial: 4,
    division: "Bundesliga",
    eventId: "BL-2025-104",
    eventName: "Bayern Munich vs Dortmund",
    market: "1X2",
    odds: { home: 1.95, draw: 3.6, away: 3.9 },
    date: "2025-11-09",
    time: "18:00",
    scores: "-:-",
    result: "Pending",
    status: "Pending",
  },
  {
    id: "5",
    serial: 5,
    division: "Ligue 1",
    eventId: "L1-2025-407",
    eventName: "PSG vs Lyon",
    market: "1X2",
    odds: { home: 1.48, draw: 4.3, away: 6.1 },
    date: "2025-11-13",
    time: "19:45",
    scores: "-:-",
    result: "Pending",
    status: "Pending",
  },
  {
    id: "6",
    serial: 6,
    division: "Championship",
    eventId: "ENG2-2025-118",
    eventName: "Leeds vs Southampton",
    market: "1X2",
    odds: { home: 2.05, draw: 3.2, away: 3.75 },
    date: "2025-11-10",
    time: "16:00",
    scores: "-:-",
    result: "Pending",
    status: "Pending",
  },
  {
    id: "7",
    serial: 7,
    division: "Eredivisie",
    eventId: "NED-2025-221",
    eventName: "Ajax vs PSV",
    market: "1X2",
    odds: { home: 2.65, draw: 3.4, away: 2.55 },
    date: "2025-11-08",
    time: "17:30",
    scores: "-:-",
    result: "Pending",
    status: "Pending",
  },
  {
    id: "8",
    serial: 8,
    division: "MLS",
    eventId: "MLS-2025-510",
    eventName: "LAFC vs Inter Miami",
    market: "1X2",
    odds: { home: 2.25, draw: 3.5, away: 3.05 },
    date: "2025-11-07",
    time: "22:00",
    scores: "-:-",
    result: "Pending",
    status: "Pending",
  },
  {
    id: "9",
    serial: 9,
    division: "Primeira Liga",
    eventId: "POR-2025-306",
    eventName: "Porto vs Benfica",
    market: "1X2",
    odds: { home: 2.1, draw: 3.3, away: 3.1 },
    date: "2025-11-11",
    time: "20:00",
    scores: "-:-",
    result: "Pending",
    status: "Pending",
  },
  {
    id: "10",
    serial: 10,
    division: "Scottish Premiership",
    eventId: "SCO-2025-117",
    eventName: "Celtic vs Rangers",
    market: "1X2",
    odds: { home: 2.05, draw: 3.4, away: 3.65 },
    date: "2025-11-06",
    time: "13:00",
    scores: "-:-",
    result: "Pending",
    status: "Pending",
  },
];

