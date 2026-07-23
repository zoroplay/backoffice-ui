export type PromotionStatus = "scheduled" | "active" | "expired";

export type PromotionRecord = {
  id?: string | number;
  title?: string;
  content?: string;
  imageUrl?: string;
  file?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  targetUrl?: string;
  clientId?: string;
  [key: string]: unknown;
};

export type PromotionFormValue = {
  id?: string;
  title: string;
  content: string;
  file: string;
  imageUrl: string;
  type: string;
  startDate: string;
  endDate: string;
  targetUrl: string;
  clientId: string;
};
