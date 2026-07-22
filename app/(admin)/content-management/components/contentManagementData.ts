export type CouponEvent = {
  id: string;
  tournamentId: string;
  eventId: string;
  name: string;
  odds: {
    home: string;
    draw: string;
    away: string;
  };
  date: string;
  time: string;
};

export type Tournament = {
  id: string;
  name: string;
};

export type SureOdd = {
  id: string;
  title: string;
  amount: number;
  description: string;
  imagePath: string;
};

export type SureOddPayment = {
  id: string;
  paidBy: string;
  phoneNumber: string;
  sureOddTitle: string;
  status: 0 | 1;
};

export const tournaments: Tournament[] = [
  { id: "premier-league", name: "Premier League" },
  { id: "la-liga", name: "La Liga" },
  { id: "serie-a", name: "Serie A" },
  { id: "ucl", name: "Champions League" },
];

export const couponEvents: CouponEvent[] = [
  {
    id: "event-1001",
    tournamentId: "premier-league",
    eventId: "1001",
    name: "Arsenal vs Chelsea",
    odds: { home: "2.10", draw: "3.40", away: "3.20" },
    date: "2026-07-25",
    time: "16:00",
  },
  {
    id: "event-1002",
    tournamentId: "premier-league",
    eventId: "1002",
    name: "Manchester City vs Liverpool",
    odds: { home: "1.95", draw: "3.60", away: "3.80" },
    date: "2026-07-26",
    time: "18:30",
  },
  {
    id: "event-2001",
    tournamentId: "la-liga",
    eventId: "2001",
    name: "Real Madrid vs Barcelona",
    odds: { home: "2.20", draw: "3.30", away: "3.05" },
    date: "2026-07-27",
    time: "20:00",
  },
  {
    id: "event-3001",
    tournamentId: "serie-a",
    eventId: "3001",
    name: "Inter vs Juventus",
    odds: { home: "2.35", draw: "3.10", away: "2.90" },
    date: "2026-07-28",
    time: "19:45",
  },
];

export const sureOdds: SureOdd[] = [
  {
    id: "SO-1024",
    title: "Weekend accumulator",
    amount: 1000,
    description: "Eight curated weekend selections with conservative match odds.",
    imagePath: "/images/sportbook.png",
  },
  {
    id: "SO-1025",
    title: "Champions league banker",
    amount: 500,
    description: "Midweek banker picks for Champions League matchday markets.",
    imagePath: "/casino/sugar-rush-1000.png",
  },
];

export const sureOddPayments: SureOddPayment[] = [
  {
    id: "PAY-7001",
    paidBy: "adaora",
    phoneNumber: "+2348010001001",
    sureOddTitle: "Weekend accumulator",
    status: 1,
  },
  {
    id: "PAY-7002",
    paidBy: "retail.shop.12",
    phoneNumber: "+2348010001002",
    sureOddTitle: "Champions league banker",
    status: 0,
  },
  {
    id: "PAY-7003",
    paidBy: "musa88",
    phoneNumber: "+2348010001003",
    sureOddTitle: "Weekend accumulator",
    status: 1,
  },
];

export function money(value: number) {
  return `NGN ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
