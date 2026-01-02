import type { Promotion, PromotionPlatform, PromotionStatus } from "./types";

const now = new Date();
const toISODate = (date: Date) => date.toISOString().split("T")[0];

export const promotionStatuses: ReadonlyArray<{
  label: string;
  value: PromotionStatus;
}> = [
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Active", value: "active" },
  { label: "Expired", value: "expired" },
] as const;

export const promotionPlatforms: ReadonlyArray<{
  label: string;
  value: PromotionPlatform;
}> = [
  { label: "Web", value: "web" },
  { label: "Mobile", value: "mobile" },
  { label: "All Channels", value: "all" },
] as const;

export const promotionTypes = [
  "Casino",
  "Sports",
  "Live Casino",
  "Virtuals",
  "Jackpot",
  "General",
] as const;

export const promotionsSeed: Promotion[] = [
  {
    id: "promo-001",
    title: "Summer Spin Frenzy",
    type: "Casino",
    platform: "all",
    targetUrl: "https://example.com/promotions/summer-spin",
    startDate: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)),
    endDate: toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    status: "active",
    image: "/casino/sugar-rush-1000.png",
    description: "Claim up to 200 free spins every week with our summer festival.",
  },
  {
    id: "promo-002",
    title: "Super Odds Weekend",
    type: "Sports",
    platform: "web",
    targetUrl: "https://example.com/promotions/super-odds",
    startDate: toISODate(new Date(now.getFullYear(), now.getMonth(), 12)),
    endDate: toISODate(new Date(now.getFullYear(), now.getMonth(), 14)),
    status: "scheduled",
    image: "/images/sportbook.png",
    description: "Enhanced odds on the biggest weekend fixtures across Europe.",
  },
  {
    id: "promo-003",
    title: "Midnight Roulette Cashback",
    type: "Live Casino",
    platform: "mobile",
    targetUrl: "https://example.com/promotions/midnight-roulette",
    startDate: toISODate(new Date(now.getFullYear(), now.getMonth() - 1, 10)),
    endDate: toISODate(new Date(now.getFullYear(), now.getMonth() - 1, 20)),
    status: "expired",
    image: "/casino/vegas-nights.png",
    description: "Get 10% cashback on live roulette losses between 10pm and 2am.",
  },
  {
    id: "promo-004",
    title: "Accumulator Insurance",
    type: "Sports",
    platform: "all",
    targetUrl: "https://example.com/promotions/acca-insurance",
    startDate: toISODate(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
    endDate: toISODate(new Date(now.getFullYear(), now.getMonth() + 2, 0)),
    status: "active",
    image: "/casino/galactic-cash-crash.png",
    description: "Money back as a free bet if one leg of your 5+ acca lets you down.",
  },
];

