export type MenuPlacement = "Web" | "Mobile" | "Hybrid";

export interface SiteMenuItem {
  id: string;
  title: string;
  placement: MenuPlacement;
  parent?: string;
  url: string;
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
  lastUpdated: string;
}

export const siteMenuItems: SiteMenuItem[] = [
  {
    id: "1",
    title: "Sportsbook",
    placement: "Web",
    parent: "Main Navigation",
    url: "/sports",
    order: 1,
    isActive: true,
    openInNewTab: false,
    lastUpdated: "2025-11-05T09:32:00Z",
  },
  {
    id: "2",
    title: "Live Betting",
    placement: "Web",
    parent: "Sportsbook",
    url: "/sports/live",
    order: 2,
    isActive: true,
    openInNewTab: false,
    lastUpdated: "2025-11-06T12:10:00Z",
  },
  {
    id: "3",
    title: "Virtual Games",
    placement: "Hybrid",
    parent: "Main Navigation",
    url: "/virtuals",
    order: 3,
    isActive: true,
    openInNewTab: false,
    lastUpdated: "2025-11-04T17:55:00Z",
  },
  {
    id: "4",
    title: "Promotions",
    placement: "Web",
    parent: "Main Navigation",
    url: "/promotions",
    order: 4,
    isActive: true,
    openInNewTab: false,
    lastUpdated: "2025-11-07T08:05:00Z",
  },
  {
    id: "5",
    title: "Blog",
    placement: "Web",
    parent: "Footer Links",
    url: "/blog",
    order: 1,
    isActive: false,
    openInNewTab: true,
    lastUpdated: "2025-11-03T14:20:00Z",
  },
  {
    id: "6",
    title: "Results",
    placement: "Mobile",
    parent: "Quick Links",
    url: "/results",
    order: 2,
    isActive: true,
    openInNewTab: false,
    lastUpdated: "2025-11-02T19:45:00Z",
  },
];

