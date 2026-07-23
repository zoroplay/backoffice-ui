import { DELETEREQUEST, GETREQUEST, POSTREQUEST, PUTREQUEST } from "@/utils/base_request";

export type BannerType = "sport" | "registration";
export type BannerTarget = "web" | "mobile";
export type BannerPosition = "popup" | "slider";

export type BannerRecord = {
  id?: string | number;
  title?: string;
  bannerType?: BannerType | string;
  target?: BannerTarget | string;
  position?: BannerPosition | string;
  link?: string;
  content?: string;
  text?: string;
  image?: string;
  sport?: string;
  category?: string;
  tournament?: string;
  event?: string;
  clientId?: string;
  [key: string]: unknown;
};

export type BannerFormValue = {
  id?: string;
  title: string;
  bannerType: BannerType;
  target: BannerTarget;
  position: BannerPosition;
  link: string;
  content: string;
  image: string;
  sport: string;
  category: string;
  tournament: string;
  event: string;
  clientId: string;
};

type AnyRecord = Record<string, any>;

export const defaultBannerForm: BannerFormValue = {
  title: "",
  bannerType: "sport",
  target: "web",
  position: "slider",
  link: "",
  content: "",
  image: "",
  sport: "",
  category: "",
  tournament: "",
  event: "",
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
};

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? (value as AnyRecord) : {};
}

function endpointClientId() {
  return encodeURIComponent(process.env.NEXT_PUBLIC_CLIENT_ID ?? "");
}

function requestSucceeded(value: unknown) {
  const record = asRecord(value);
  return record.success === true || record.status === true || record.status_code === 200 || record.status_code === 201;
}

export function bannerListFrom(value: unknown): BannerRecord[] {
  if (Array.isArray(value)) return value as BannerRecord[];

  const record = asRecord(value);
  if (Array.isArray(record.data)) return record.data as BannerRecord[];
  if (record.data && typeof record.data === "object") return Object.values(record.data) as BannerRecord[];
  if (Array.isArray(record.banners)) return record.banners as BannerRecord[];

  return [];
}

export function bannerRecordFrom(value: unknown): BannerRecord | null {
  const record = asRecord(value);
  const data = record.data;

  if (data && !Array.isArray(data) && typeof data === "object") return data as BannerRecord;
  if (record.id || record.title) return record as BannerRecord;

  return null;
}

export function bannerId(banner: BannerRecord) {
  return String(banner.id ?? "");
}

export function bannerTitle(banner: BannerRecord) {
  return String(banner.title ?? "Untitled banner");
}

export function bannerType(banner: BannerRecord): BannerType {
  return String(banner.bannerType ?? "sport").toLowerCase() === "registration" ? "registration" : "sport";
}

export function bannerTarget(banner: BannerRecord): BannerTarget {
  return String(banner.target ?? "web").toLowerCase() === "mobile" ? "mobile" : "web";
}

export function bannerPosition(banner: BannerRecord): BannerPosition {
  return String(banner.position ?? "slider").toLowerCase() === "popup" ? "popup" : "slider";
}

export function normalizeBannerForm(banner?: Partial<BannerRecord> | null): BannerFormValue {
  return {
    id: banner?.id === undefined || banner?.id === null ? undefined : String(banner.id),
    title: String(banner?.title ?? ""),
    bannerType: bannerType(banner ?? {}),
    target: bannerTarget(banner ?? {}),
    position: bannerPosition(banner ?? {}),
    link: String(banner?.link ?? ""),
    content: String(banner?.content ?? banner?.text ?? ""),
    image: String(banner?.image ?? ""),
    sport: String(banner?.sport ?? ""),
    category: String(banner?.category ?? ""),
    tournament: String(banner?.tournament ?? ""),
    event: String(banner?.event ?? ""),
    clientId: String(banner?.clientId || process.env.NEXT_PUBLIC_CLIENT_ID || ""),
  };
}

export async function fetchBanners() {
  const response = await GETREQUEST<unknown>(`/admin/content-management/banners?clientId=${endpointClientId()}`);

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load banners");
  }

  return bannerListFrom(response.data);
}

export async function fetchBanner(id: string) {
  const response = await GETREQUEST<unknown>(`/admin/content-management/banner/${encodeURIComponent(id)}?clientId=${endpointClientId()}`);

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load banner");
  }

  return bannerRecordFrom(response.data);
}

export async function createBanner(value: BannerFormValue) {
  const response = await POSTREQUEST<unknown>("/admin/content-management/create-banner", {
    ...value,
    clientId: value.clientId || process.env.NEXT_PUBLIC_CLIENT_ID || "",
  });

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to create banner");
  }

  return response.data;
}

export async function updateBanner(value: BannerFormValue) {
  const response = await PUTREQUEST<unknown>("/admin/content-management/banner", {
    ...value,
    clientId: value.clientId || process.env.NEXT_PUBLIC_CLIENT_ID || "",
  });

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to update banner");
  }

  return response.data;
}

export async function deleteBanner(id: string) {
  const response = await DELETEREQUEST<unknown>(`/admin/content-management/banner/${encodeURIComponent(id)}?clientId=${endpointClientId()}`);

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to delete banner");
  }

  return response.data;
}
