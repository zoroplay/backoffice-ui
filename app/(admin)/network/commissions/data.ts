import { Commission } from "./columns";

const today = new Date();

const createDate = (offsetDays: number) => {
  const date = new Date(today);
  date.setDate(today.getDate() - offsetDays);
  return date.toISOString().split("T")[0];
};

export const weeklyCommissions: Commission[] = [
  {
    id: "1",
    agent: "Agent Smith",
    sport: "sport",
    reportDate: createDate(2),
    commissionProfile: "Standard",
    noOfTickets: 150,
    amountPlayed: 500_000,
    totalWon: 450_000,
    net: 50_000,
    commissions: 5_000,
    profit: 45_000,
  },
  {
    id: "2",
    agent: "Agent Johnson",
    sport: "casino",
    reportDate: createDate(5),
    commissionProfile: "Premium",
    noOfTickets: 200,
    amountPlayed: 750_000,
    totalWon: 600_000,
    net: 150_000,
    commissions: 15_000,
    profit: 135_000,
  },
  {
    id: "3",
    agent: "Agent Williams",
    sport: "virtual",
    reportDate: createDate(7),
    commissionProfile: "Standard",
    noOfTickets: 120,
    amountPlayed: 400_000,
    totalWon: 350_000,
    net: 50_000,
    commissions: 5_000,
    profit: 45_000,
  },
  {
    id: "4",
    agent: "Agent Brown",
    sport: "poker",
    reportDate: createDate(9),
    commissionProfile: "VIP",
    noOfTickets: 300,
    amountPlayed: 1_000_000,
    totalWon: 800_000,
    net: 200_000,
    commissions: 20_000,
    profit: 180_000,
  },
  {
    id: "5",
    agent: "Agent Davis",
    sport: "casino-live",
    reportDate: createDate(11),
    commissionProfile: "Standard",
    noOfTickets: 180,
    amountPlayed: 600_000,
    totalWon: 520_000,
    net: 80_000,
    commissions: 8_000,
    profit: 72_000,
  },
];

export const paidCommissions: Commission[] = [
  {
    id: "6",
    agent: "Agent Martinez",
    sport: "sport",
    reportDate: createDate(14),
    commissionProfile: "Premium",
    noOfTickets: 250,
    amountPlayed: 850_000,
    totalWon: 700_000,
    net: 150_000,
    commissions: 15_000,
    profit: 135_000,
  },
  {
    id: "7",
    agent: "Agent Garcia",
    sport: "casino",
    reportDate: createDate(17),
    commissionProfile: "VIP",
    noOfTickets: 320,
    amountPlayed: 1_100_000,
    totalWon: 900_000,
    net: 200_000,
    commissions: 20_000,
    profit: 180_000,
  },
];

export const bonusCommissions: Commission[] = [
  {
    id: "8",
    agent: "Agent Rodriguez",
    sport: "virtual",
    reportDate: createDate(20),
    commissionProfile: "Bonus",
    noOfTickets: 100,
    amountPlayed: 300_000,
    totalWon: 250_000,
    net: 50_000,
    commissions: 7_500,
    profit: 42_500,
  },
  {
    id: "9",
    agent: "Agent Wilson",
    sport: "poker",
    reportDate: createDate(23),
    commissionProfile: "Bonus",
    noOfTickets: 150,
    amountPlayed: 450_000,
    totalWon: 380_000,
    net: 70_000,
    commissions: 10_500,
    profit: 59_500,
  },
];

export const sportOptions = [
  { value: "sport", label: "Sport" },
  { value: "casino", label: "Casino" },
  { value: "poker", label: "Poker" },
  { value: "virtual", label: "Virtual" },
  { value: "casino-live", label: "Casino live" },
];

