import {
  type CasinoBanner,
  type CasinoGame,
  type CasinoGroupedFilterOption,
  type CasinoFilterOption,
  type GameCategory,
  type GameProvider,
} from "./types";

const now = () => new Date().toISOString();

export const gameCategories: GameCategory[] = [
  {
    id: "cat-crash",
    name: "Crash Games",
    priority: 1000,
    isActive: true,
    description: "Instant crash games with multiplier ladders and social leaderboards.",
    createdAt: now(),
  },
  {
    id: "cat-slots",
    name: "Slots",
    priority: 120,
    isActive: true,
    description: "Feature-rich video slots with bonus rounds and branded themes.",
    createdAt: now(),
  },
  {
    id: "cat-table",
    name: "Table Games",
    priority: 80,
    isActive: true,
    description: "Roulette, blackjack, baccarat, and poker tables for every stake.",
    createdAt: now(),
  },
  {
    id: "cat-live",
    name: "Live Casino",
    priority: 60,
    isActive: true,
    description: "Live dealer experiences streamed from premium studios worldwide.",
    createdAt: now(),
  },
  {
    id: "cat-scratch",
    name: "Scratch Card",
    priority: 40,
    isActive: false,
    description: "Instant win cards and quick pick lotteries.",
    createdAt: now(),
  },
];

export const gameProviders: GameProvider[] = [
  {
    id: "prov-pragmatic",
    name: "Pragmatic Play",
    slug: "pragmatic-play",
    isActive: true,
    totalGames: 158,
    website: "https://www.pragmaticplay.com",
    headquarters: "Sliema, Malta",
    foundedYear: 2015,
  },
  {
    id: "prov-evolution",
    name: "Evolution Gaming",
    slug: "evolution-gaming",
    isActive: true,
    totalGames: 63,
    website: "https://www.evolution.com",
    headquarters: "Stockholm, Sweden",
    foundedYear: 2006,
  },
  {
    id: "prov-hacksaw",
    name: "Hacksaw Gaming",
    slug: "hacksaw-gaming",
    isActive: true,
    totalGames: 92,
    website: "https://www.hacksawgaming.com",
    headquarters: "St. Julian's, Malta",
    foundedYear: 2018,
  },
  {
    id: "prov-endorphina",
    name: "Endorphina",
    slug: "endorphina",
    isActive: false,
    totalGames: 74,
    website: "https://endorphina.com",
    headquarters: "Prague, Czech Republic",
    foundedYear: 2012,
  },
  {
    id: "prov-netent",
    name: "NetEnt",
    slug: "netent",
    isActive: true,
    totalGames: 118,
    website: "https://www.netent.com",
    headquarters: "Stockholm, Sweden",
    foundedYear: 1996,
  },
];

export const casinoGames: CasinoGame[] = [
  {
    id: "game-camino-chili",
    name: "Camino De Chili: Bonus Buy",
    slug: "camino-de-chili-bonus-buy",
    providerId: "prov-hacksaw",
    categories: ["cat-slots"],
    tags: ["bonus-buy", "feature-drop", "jackpot"],
    status: "active",
    isFeatured: true,
    hasBonusBuy: true,
    rtp: 96.2,
    volatility: "High",
    priority: 900,
    thumbnail: "/casino/camino-de-chili-bonus-buy.png",
    updatedAt: now(),
  },
  {
    id: "game-sportbook",
    name: "Sportsbook Royale",
    slug: "sportsbook-royale",
    providerId: "prov-pragmatic",
    categories: ["cat-slots", "cat-table"],
    tags: ["featured", "tournament"],
    status: "preview",
    isFeatured: false,
    hasBonusBuy: false,
    rtp: 94.8,
    volatility: "Medium",
    priority: 320,
    thumbnail: "/casino/vegas-nights.png",
    updatedAt: now(),
  },
  {
    id: "game-roulette-live",
    name: "Immersive Roulette Live",
    slug: "immersive-roulette-live",
    providerId: "prov-evolution",
    categories: ["cat-live", "cat-table"],
    tags: ["live", "vip"],
    status: "active",
    isFeatured: true,
    hasBonusBuy: false,
    rtp: 97.1,
    volatility: "Low",
    priority: 640,
    thumbnail: "/casino/journey-to-the-west.png",
    updatedAt: now(),
  },
  {
    id: "game-cash-crash",
    name: "Galactic Cash Crash",
    slug: "galactic-cash-crash",
    providerId: "prov-hacksaw",
    categories: ["cat-crash"],
    tags: ["crash", "fast", "multiplayer"],
    status: "inactive",
    isFeatured: false,
    hasBonusBuy: false,
    rtp: 95.3,
    volatility: "Extreme",
    priority: 280,
    thumbnail: "/casino/gates-of-olympus-1000.png",
    updatedAt: now(),
  },
];

export const casinoBanners: CasinoBanner[] = [
  {
    id: "banner-summer-frenzy",
    title: "Summer Spin Frenzy",
    target: "web",
    position: "hero",
    link: "https://example.com/promotions/summer-frenzy",
    isActive: true,
    lastUpdated: now(),
    image: "/casino/vegas-nights.png",
    content: "Get up to 200 free spins every day during our summer festival.",
    audience: "vip",
  },
  {
    id: "banner-welcome",
    title: "Welcome Pack Reload",
    target: "both",
    position: "slider",
    link: "https://example.com/promotions/welcome-pack",
    isActive: true,
    lastUpdated: now(),
    image: "/casino/sugar-rush-1000.png",
    content: "100% up to $500 + 250 free spins on your first four deposits.",
    audience: "new",
  },
  {
    id: "banner-live-casino",
    title: "Live Casino Cashback",
    target: "mobile",
    position: "spotlight",
    link: "https://example.com/promotions/live-cashback",
    isActive: false,
    lastUpdated: now(),
    image: "/casino/camino-de-chili-bonus-buy.png",
    content: "10% weekly cashback on all live casino losses.",
    audience: "all",
  },
];

export const casinoFilterOptions: CasinoGroupedFilterOption[] = [
  {
    label: "Categories",
    options: gameCategories.map((category) => ({
      label: category.name,
      value: category.id,
      group: "category",
    })),
  },
  {
    label: "Providers",
    options: gameProviders.map((provider) => ({
      label: provider.name,
      value: provider.id,
      group: "provider",
    })),
  },
  {
    label: "Status",
    options: [
      { label: "Active", value: "active", group: "status" },
      { label: "Inactive", value: "inactive", group: "status" },
      { label: "Preview", value: "preview", group: "status" },
    ],
  },
  {
    label: "Features",
    options: [
      { label: "Featured Only", value: "featured", group: "feature" },
      { label: "Bonus Buy", value: "bonus-buy", group: "feature" },
      { label: "Live Dealer", value: "live", group: "feature" },
    ],
  },
];

export const bannerTargets = [
  { label: "Web", value: "web" },
  { label: "Mobile", value: "mobile" },
  { label: "Both", value: "both" },
] as const;

export const bannerPositions = [
  { label: "Hero", value: "hero" },
  { label: "Homepage Slider", value: "slider" },
  { label: "Sidebar", value: "sidebar" },
  { label: "Spotlight", value: "spotlight" },
] as const;

export const casinoStatusOptions: CasinoFilterOption[] = [
  { label: "Active", value: "active", group: "status" },
  { label: "Inactive", value: "inactive", group: "status" },
  { label: "Preview", value: "preview", group: "status" },
];

