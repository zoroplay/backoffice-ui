export type CasinoGameStatus = "active" | "inactive" | "preview";

export type CasinoGameVolatility = "Low" | "Medium" | "High" | "Extreme";

export type CasinoGame = {
  id: string;
  name: string;
  slug: string;
  providerId: string;
  categories: string[];
  tags: string[];
  status: CasinoGameStatus;
  isFeatured: boolean;
  hasBonusBuy: boolean;
  rtp: number;
  volatility: CasinoGameVolatility;
  priority: number;
  thumbnail: string;
  updatedAt: string;
};

export type GameCategory = {
  id: string;
  name: string;
  priority: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
};

export type GameProvider = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  totalGames: number;
  website?: string;
  headquarters?: string;
  foundedYear?: number;
};

export type BannerTarget = "web" | "mobile" | "both";

export type BannerPosition = "hero" | "slider" | "sidebar" | "spotlight";

export type CasinoBanner = {
  id: string;
  title: string;
  target: BannerTarget;
  position: BannerPosition;
  link: string;
  isActive: boolean;
  lastUpdated: string;
  image: string;
  content?: string;
  audience?: string;
};

export type CasinoFilterGroup =
  | "category"
  | "provider"
  | "status"
  | "feature";

export type CasinoFilterOption = {
  label: string;
  value: string;
  group: CasinoFilterGroup;
};

export type CasinoGroupedFilterOption = {
  label: string;
  options: CasinoFilterOption[];
};

export type GameFormValues = {
  name: string;
  slug: string;
  providerId: string;
  categories: string[];
  tags: string[];
  status: CasinoGameStatus;
  isFeatured: boolean;
  hasBonusBuy: boolean;
  rtp: number;
  volatility: CasinoGameVolatility;
  priority: number;
  thumbnail: string;
};

export type CategoryFormValues = {
  name: string;
  priority: number;
  isActive: boolean;
  description?: string;
};

export type ProviderFormValues = {
  name: string;
  slug: string;
  website?: string;
  headquarters?: string;
  foundedYear?: number;
  isActive: boolean;
};

export type BannerFormValues = {
  title: string;
  target: BannerTarget;
  position: BannerPosition;
  link: string;
  isActive: boolean;
  image: string;
  content?: string;
  audience?: string;
};

