export type DashboardTimeframeOption = {
  value: string;
  label: string;
};

export const timeframeOptions: DashboardTimeframeOption[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 Days" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

export type DashboardSummaryMetric = {
  id: string;
  label: string;
  value: string;
  delta?: {
    label: string;
    value: string;
    trend: "up" | "down" | "flat";
  };
};

export const summaryMetrics: DashboardSummaryMetric[] = [
  {
    id: "turnover",
    label: "Total Turnover",
    value: "₦ 132,940,215",
    delta: { label: "vs. last week", value: "+4.3%", trend: "up" },
  },
  {
    id: "gross-gaming",
    label: "Gross Gaming Revenue",
    value: "₦ 9,420,115",
    delta: { label: "vs. last week", value: "-1.2%", trend: "down" },
  },
  {
    id: "bonus-spent",
    label: "Bonus Spent",
    value: "₦ 1,047,230",
    delta: { label: "vs. plan", value: "68%", trend: "flat" },
  },
  {
    id: "net-gaming",
    label: "Net Gaming Revenue",
    value: "₦ 8,372,885",
    delta: { label: "vs. goal", value: "+2.9%", trend: "up" },
  },
];

export type DashboardProductRow = {
  product: string;
  turnover: number;
  margin: number;
  ggr: number;
  bonusGiven: number;
  bonusSpent: number;
  ngr: number;
};

export const productRows: DashboardProductRow[] = [
  {
    product: "Sportsbook",
    turnover: 804235,
    margin: 7.5,
    ggr: 211240,
    bonusGiven: 41234,
    bonusSpent: 38210,
    ngr: 173030,
  },
  {
    product: "Casino",
    turnover: 612480,
    margin: 5.2,
    ggr: 127540,
    bonusGiven: 28560,
    bonusSpent: 21380,
    ngr: 107160,
  },
  {
    product: "Virtuals",
    turnover: 221180,
    margin: 6.9,
    ggr: 48230,
    bonusGiven: 11230,
    bonusSpent: 9020,
    ngr: 39210,
  },
];

export type DashboardProductTabKey = "overall" | "sport" | "agents" | "mobile";

export const productTabs: Array<{
  key: DashboardProductTabKey;
  label: string;
  rows: DashboardProductRow[];
}> = [
  {
    key: "overall",
    label: "Overall Gaming",
    rows: productRows,
  },
  {
    key: "sport",
    label: "Sport",
    rows: [
      {
        product: "Sportsbook",
        turnover: 804235,
        margin: 7.5,
        ggr: 211240,
        bonusGiven: 41234,
        bonusSpent: 38210,
        ngr: 173030,
      },
      {
        product: "In-Play",
        turnover: 482910,
        margin: 6.4,
        ggr: 132640,
        bonusGiven: 24120,
        bonusSpent: 19240,
        ngr: 113520,
      },
      {
        product: "Virtual Sports",
        turnover: 221180,
        margin: 6.9,
        ggr: 48230,
        bonusGiven: 11230,
        bonusSpent: 9020,
        ngr: 39210,
      },
    ],
  },
  {
    key: "agents",
    label: "Agents",
    rows: [
      {
        product: "Retail Hubs",
        turnover: 612480,
        margin: 5.8,
        ggr: 148220,
        bonusGiven: 25670,
        bonusSpent: 20110,
        ngr: 122430,
      },
      {
        product: "Field Agents",
        turnover: 394120,
        margin: 6.1,
        ggr: 99210,
        bonusGiven: 17340,
        bonusSpent: 14050,
        ngr: 85160,
      },
      {
        product: "Super Agents",
        turnover: 279540,
        margin: 5.5,
        ggr: 68640,
        bonusGiven: 15230,
        bonusSpent: 11800,
        ngr: 56840,
      },
    ],
  },
  {
    key: "mobile",
    label: "Mobile",
    rows: [
      {
        product: "iOS",
        turnover: 302440,
        margin: 6.8,
        ggr: 73540,
        bonusGiven: 16110,
        bonusSpent: 13220,
        ngr: 60320,
      },
      {
        product: "Android",
        turnover: 441810,
        margin: 7.1,
        ggr: 109240,
        bonusGiven: 19210,
        bonusSpent: 15880,
        ngr: 94320,
      },
      {
        product: "Mobile Web",
        turnover: 188560,
        margin: 5.9,
        ggr: 42110,
        bonusGiven: 9870,
        bonusSpent: 7640,
        ngr: 34470,
      },
    ],
  },
];

export type DashboardRealtimeMetric = {
  label: string;
  value: string;
};

export const realtimeMetrics: DashboardRealtimeMetric[] = [
  { label: "Online Players", value: "642" },
  { label: "New Players", value: "38" },
  { label: "Total Players", value: "82,413" },
  { label: "Today's Bets", value: "9,204" },
  { label: "Total Bets", value: "1,284,092" },
  { label: "Conversion Rate", value: "3.2%" },
];

export type DashboardTabbedMetric = {
  label: string;
  value: string;
  trend?: string;
};

export const openBets: Record<"single" | "combo", DashboardTabbedMetric[]> = {
  single: [
    { label: "Total Stake", value: "₦ 5,218,400", trend: "+3.8% vs. yesterday" },
    { label: "Avg. Odds", value: "3.12" },
    { label: "Exposure", value: "₦ 18,730,000", trend: "-1.4% vs. plan" },
  ],
  combo: [
    { label: "Total Stake", value: "₦ 9,602,810", trend: "+5.1% vs. yesterday" },
    { label: "Avg. Odds", value: "9.41" },
    { label: "Exposure", value: "₦ 24,790,000", trend: "+2.4% vs. plan" },
  ],
};

export type DashboardFinancialRow = {
  label: string;
  value: string;
  helper?: string;
};

export const financialPerformance: DashboardFinancialRow[] = [
  { label: "Deposits", value: "₦ 18,204,940", helper: "+8.2% vs. last week" },
  { label: "Withdrawals", value: "₦ 7,986,410", helper: "+1.3% vs. last week" },
  { label: "Net Cash", value: "₦ 10,218,530", helper: "56% retention" },
];

export const playerBalances: DashboardFinancialRow[] = [
  { label: "Sports Real Balance", value: "₦ 42,781,210" },
  { label: "Sports Bonus Balance", value: "₦ 6,992,340" },
  { label: "Network Balance", value: "₦ 13,417,000" },
  { label: "Network Trust Balance", value: "₦ 2,904,220" },
];

export type DashboardChartPoint = {
  month: string;
  games: number;
  casino: number;
  sport: number;
  virtual: number;
};

export const turnoverChartData: DashboardChartPoint[] = [
  { month: "Jan", games: 240, casino: 420, sport: 640, virtual: 160 },
  { month: "Feb", games: 260, casino: 450, sport: 720, virtual: 180 },
  { month: "Mar", games: 280, casino: 480, sport: 800, virtual: 190 },
  { month: "Apr", games: 250, casino: 460, sport: 740, virtual: 175 },
  { month: "May", games: 270, casino: 495, sport: 790, virtual: 182 },
  { month: "Jun", games: 290, casino: 520, sport: 830, virtual: 195 },
  { month: "Jul", games: 305, casino: 540, sport: 865, virtual: 205 },
  { month: "Aug", games: 318, casino: 580, sport: 902, virtual: 214 },
  { month: "Sep", games: 326, casino: 600, sport: 918, virtual: 220 },
  { month: "Oct", games: 332, casino: 618, sport: 936, virtual: 228 },
  { month: "Nov", games: 345, casino: 640, sport: 954, virtual: 236 },
  { month: "Dec", games: 360, casino: 664, sport: 972, virtual: 242 },
];

