export type LuckyBallsShop = {
  id: string;
  agencyName: string;
  address: string;
  city: string;
  code: string;
  agent: string;
  active: boolean;
  minBet: number;
  minCombinationBet: number;
  maxBet: number;
  maxPayout: number;
  workerInOut: string;
  timeZone: string;
  assigned: boolean;
  trackCredit: number;
  currentCredit: number;
  commissionPercent: number;
  softwareCharge: number;
};

export type LuckyBallsShopUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  userLevel: string;
  languageId: string;
  active: boolean;
};

export type LuckyBallsCommissionAgent = {
  userId: string;
  agencyCodeName: string;
  numberOfTickets: number;
  moneyIn: number;
  moneyWon: number;
  net: number;
  commission: number;
};

export const luckyBallsShops: LuckyBallsShop[] = [
  {
    id: "1001",
    agencyName: "Lagos Central",
    address: "12 Allen Avenue",
    city: "Ikeja",
    code: "LBC-1001",
    agent: "Ada Okafor",
    active: true,
    minBet: 100,
    minCombinationBet: 500,
    maxBet: 250000,
    maxPayout: 2000000,
    workerInOut: "Enabled",
    timeZone: "Africa/Lagos",
    assigned: true,
    trackCredit: 1500000,
    currentCredit: 1185000,
    commissionPercent: 3.5,
    softwareCharge: 1.25,
  },
  {
    id: "1002",
    agencyName: "Ibadan Ring Road",
    address: "44 Ring Road",
    city: "Ibadan",
    code: "LBC-1002",
    agent: "Musa Bello",
    active: true,
    minBet: 100,
    minCombinationBet: 500,
    maxBet: 150000,
    maxPayout: 1500000,
    workerInOut: "Enabled",
    timeZone: "Africa/Lagos",
    assigned: true,
    trackCredit: 900000,
    currentCredit: 630000,
    commissionPercent: 3,
    softwareCharge: 1,
  },
  {
    id: "1003",
    agencyName: "Enugu Express",
    address: "7 Ogui Road",
    city: "Enugu",
    code: "LBC-1003",
    agent: "Nkechi Obi",
    active: false,
    minBet: 200,
    minCombinationBet: 1000,
    maxBet: 100000,
    maxPayout: 1000000,
    workerInOut: "Paused",
    timeZone: "Africa/Lagos",
    assigned: false,
    trackCredit: 500000,
    currentCredit: 120000,
    commissionPercent: 2.5,
    softwareCharge: 1,
  },
];

export const luckyBallsShopUsers: LuckyBallsShopUser[] = [
  {
    id: "501",
    username: "lb-cashier-01",
    firstName: "Tola",
    lastName: "Adebayo",
    userLevel: "Cashier",
    languageId: "EN",
    active: true,
  },
  {
    id: "502",
    username: "lb-supervisor",
    firstName: "Grace",
    lastName: "Umeh",
    userLevel: "Supervisor",
    languageId: "EN",
    active: true,
  },
  {
    id: "503",
    username: "lb-kiosk-07",
    firstName: "Samuel",
    lastName: "Eze",
    userLevel: "Terminal",
    languageId: "EN",
    active: false,
  },
];

export const luckyBallsCommissionAgents: LuckyBallsCommissionAgent[] = [
  {
    userId: "1001",
    agencyCodeName: "LBC-1001 Lagos Central",
    numberOfTickets: 1824,
    moneyIn: 4600000,
    moneyWon: 3210000,
    net: 1390000,
    commission: 161000,
  },
  {
    userId: "1002",
    agencyCodeName: "LBC-1002 Ibadan Ring Road",
    numberOfTickets: 943,
    moneyIn: 2100000,
    moneyWon: 1565000,
    net: 535000,
    commission: 63000,
  },
  {
    userId: "1003",
    agencyCodeName: "LBC-1003 Enugu Express",
    numberOfTickets: 417,
    moneyIn: 880000,
    moneyWon: 735000,
    net: 145000,
    commission: 22000,
  },
];

export function formatMoney(value: number) {
  return `NGN ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function formatNumber(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
