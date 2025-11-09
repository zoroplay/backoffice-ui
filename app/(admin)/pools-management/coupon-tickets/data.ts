export interface CouponTicket {
  id: string;
  name: string;
  bets: number;
  turnover: number;
  winnings: number;
  ggr: number;
  margin: number;
  ngr: number;
  channel: "Online" | "Retail";
  status: "Settled" | "Pending";
  region: string;
  date: string;
}

export const couponTicketsData: CouponTicket[] = [
  {
    id: "1",
    name: "Premier League Super Pool",
    bets: 245,
    turnover: 860000,
    winnings: 410000,
    ggr: 450000,
    margin: 12.5,
    ngr: 395000,
    channel: "Online",
    status: "Settled",
    region: "Lagos",
    date: "2025-11-07T09:30:00Z",
  },
  {
    id: "2",
    name: "Midweek Coupon",
    bets: 178,
    turnover: 520000,
    winnings: 265000,
    ggr: 255000,
    margin: 9.8,
    ngr: 240000,
    channel: "Retail",
    status: "Pending",
    region: "Abuja",
    date: "2025-11-07T13:10:00Z",
  },
  {
    id: "3",
    name: "Euro Nights Coupon",
    bets: 312,
    turnover: 1045000,
    winnings: 580000,
    ggr: 465000,
    margin: 14.3,
    ngr: 430000,
    channel: "Online",
    status: "Settled",
    region: "Port Harcourt",
    date: "2025-11-06T20:20:00Z",
  },
  {
    id: "4",
    name: "Weekend Mega",
    bets: 198,
    turnover: 690000,
    winnings: 355000,
    ggr: 335000,
    margin: 10.6,
    ngr: 310000,
    channel: "Retail",
    status: "Pending",
    region: "Kano",
    date: "2025-11-06T15:05:00Z",
  },
  {
    id: "5",
    name: "Jackpot Booster",
    bets: 156,
    turnover: 430000,
    winnings: 190000,
    ggr: 240000,
    margin: 11.9,
    ngr: 215000,
    channel: "Online",
    status: "Settled",
    region: "Kaduna",
    date: "2025-11-05T11:40:00Z",
  },
  {
    id: "6",
    name: "Local League Combo",
    bets: 132,
    turnover: 310000,
    winnings: 145000,
    ggr: 165000,
    margin: 8.5,
    ngr: 150000,
    channel: "Retail",
    status: "Settled",
    region: "Benin",
    date: "2025-11-05T16:25:00Z",
  },
];

