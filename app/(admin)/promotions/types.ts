export type PromotionStatus = "draft" | "scheduled" | "active" | "expired";

export type PromotionPlatform = "web" | "mobile" | "all";

export type Promotion = {
  id: string;
  title: string;
  type: string;
  platform: PromotionPlatform;
  targetUrl: string;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  image: string;
  description: string;
};

export type PromotionFormValues = {
  title: string;
  type: string;
  platform: PromotionPlatform;
  targetUrl: string;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  image: string;
  description: string;
};

