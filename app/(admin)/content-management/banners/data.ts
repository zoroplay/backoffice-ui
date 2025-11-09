export type BannerTarget = "Web" | "Mobile" | "All";
export type BannerType = "Sports" | "Registration" | "Casino" | "Promotion";
export type BannerPosition = "Slider" | "Popup" | "Hero";

export interface BannerItem {
  id: string;
  title: string;
  type: BannerType;
  target: BannerTarget;
  position: BannerPosition;
  link: string;
  imageUrl: string;
  isActive: boolean;
  lastUpdated: string;
}

export const bannerItems: BannerItem[] = [
  {
    id: "1",
    title: "Welcome Sports Bonus",
    type: "Sports",
    target: "Web",
    position: "Slider",
    link: "https://example.com/promo/welcome-sports",
    imageUrl: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=600&q=80",
    isActive: true,
    lastUpdated: "2025-11-06T08:30:00Z",
  },
  {
    id: "2",
    title: "Casino Night",
    type: "Casino",
    target: "Web",
    position: "Hero",
    link: "https://example.com/promo/casino-night",
    imageUrl: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=600&q=80",
    isActive: true,
    lastUpdated: "2025-11-05T16:12:00Z",
  },
  {
    id: "3",
    title: "Registration Boost",
    type: "Registration",
    target: "Mobile",
    position: "Slider",
    link: "https://example.com/register",
    imageUrl: "https://images.unsplash.com/photo-1545239351-301701012c09?auto=format&fit=crop&w=600&q=80",
    isActive: false,
    lastUpdated: "2025-11-04T12:05:00Z",
  },
  {
    id: "4",
    title: "Weekend Promotion",
    type: "Promotion",
    target: "All",
    position: "Popup",
    link: "https://example.com/promo/weekend",
    imageUrl: "https://images.unsplash.com/photo-1604079628040-94301bb21b31?auto=format&fit=crop&w=600&q=80",
    isActive: true,
    lastUpdated: "2025-11-03T19:50:00Z",
  },
];
