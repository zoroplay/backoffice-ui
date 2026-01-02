export interface PoolsTicket {
  id: string;
  ticketRef: string;
  player: string;
  channel: "Online" | "Retail";
  division: string;
  stake: number;
  potentialWinning: number;
  datePlaced: string;
  status: "Won" | "Lost" | "Pending";
  selections: number;
  agent?: string;
}

export const poolsTicketsData: PoolsTicket[] = [
  {
    id: "1",
    ticketRef: "POOL-20251107-0012",
    player: "Ola Adekunle",
    channel: "Online",
    division: "Premier League",
    stake: 1500,
    potentialWinning: 45000,
    datePlaced: "2025-11-07T10:35:00Z",
    status: "Pending",
    selections: 8,
    agent: "Self",
  },
  {
    id: "2",
    ticketRef: "POOL-20251107-0058",
    player: "Ngozi Okafor",
    channel: "Retail",
    division: "Serie A",
    stake: 2000,
    potentialWinning: 62000,
    datePlaced: "2025-11-06T16:20:00Z",
    status: "Won",
    selections: 10,
    agent: "Agent - Lagos Mainland",
  },
  {
    id: "3",
    ticketRef: "POOL-20251106-0099",
    player: "Samuel Johnson",
    channel: "Retail",
    division: "La Liga",
    stake: 1000,
    potentialWinning: 28000,
    datePlaced: "2025-11-06T12:12:00Z",
    status: "Lost",
    selections: 9,
    agent: "Agent - Abuja Central",
  },
  {
    id: "4",
    ticketRef: "POOL-20251105-0074",
    player: "Amina Yusuf",
    channel: "Online",
    division: "Bundesliga",
    stake: 750,
    potentialWinning: 17500,
    datePlaced: "2025-11-05T18:45:00Z",
    status: "Pending",
    selections: 6,
    agent: "Self",
  },
  {
    id: "5",
    ticketRef: "POOL-20251105-0193",
    player: "Emeka Chukwu",
    channel: "Retail",
    division: "Ligue 1",
    stake: 3000,
    potentialWinning: 90000,
    datePlaced: "2025-11-05T13:05:00Z",
    status: "Won",
    selections: 12,
    agent: "Agent - Port Harcourt",
  },
  {
    id: "6",
    ticketRef: "POOL-20251104-0110",
    player: "Halima Musa",
    channel: "Online",
    division: "Championship",
    stake: 500,
    potentialWinning: 12000,
    datePlaced: "2025-11-04T15:10:00Z",
    status: "Lost",
    selections: 7,
    agent: "Self",
  },
];

