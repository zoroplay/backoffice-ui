import { DELETEREQUEST, GETREQUEST, POSTREQUEST } from "@/utils/base_request";

import type { PromotionFormValue, PromotionRecord, PromotionStatus } from "./types";

export type { PromotionFormValue, PromotionRecord, PromotionStatus } from "./types";

type AnyRecord = Record<string, any>;

export const defaultPromotionForm: PromotionFormValue = {
  title: "",
  content: "",
  file: "",
  imageUrl: "",
  type: "web",
  startDate: "",
  endDate: "",
  targetUrl: "",
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
};

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? (value as AnyRecord) : {};
}

function endpointClientId() {
  return encodeURIComponent(process.env.NEXT_PUBLIC_CLIENT_ID ?? "");
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function appendField(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) return;
  formData.append(key, String(value));
}

function requestSucceeded(value: unknown) {
  const record = asRecord(value);

  if (record.success === false || record.status === false) return false;
  if (typeof record.status_code === "number") {
    return record.status_code >= 200 && record.status_code < 300;
  }

  return true;
}

function buildPromotionPayload(value: PromotionFormValue, mode: "add" | "edit") {
  const payload = new FormData();

  appendField(payload, "title", value.title);
  appendField(payload, "content", value.content);
  appendField(payload, "type", value.type);
  appendField(payload, "startDate", value.startDate);
  appendField(payload, "endDate", value.endDate);
  appendField(payload, "targetUrl", value.targetUrl);

  if (mode === "add") {
    appendField(payload, "file", value.file || value.imageUrl);
    appendField(payload, "imageUrl", value.imageUrl);
    appendField(payload, "clientId", value.clientId || process.env.NEXT_PUBLIC_CLIENT_ID || "");
  } else {
    appendField(payload, "imageUrl", value.imageUrl || value.file);
    appendField(payload, "id", value.id);
  }

  return payload;
}

export function promotionListFrom(value: unknown): PromotionRecord[] {
  if (Array.isArray(value)) return value as PromotionRecord[];

  const record = asRecord(value);
  if (Array.isArray(record.data)) return record.data as PromotionRecord[];
  if (record.data && typeof record.data === "object") {
    const nested = asRecord(record.data);
    if (Array.isArray(nested.data)) return nested.data as PromotionRecord[];
    return Object.values(record.data) as PromotionRecord[];
  }
  if (Array.isArray(record.promotions)) return record.promotions as PromotionRecord[];

  return [];
}

export function promotionRecordFrom(value: unknown): PromotionRecord | null {
  const record = asRecord(value);
  const data = record.data;

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const nested = asRecord(data);
    if (nested.data && typeof nested.data === "object" && !Array.isArray(nested.data)) {
      return nested.data as PromotionRecord;
    }
    return data as PromotionRecord;
  }

  if (record.id || record.title) return record as PromotionRecord;

  return null;
}

export function normalizePromotionForm(
  promotion?: Partial<PromotionRecord> | null,
  mode: "add" | "edit" = "add"
): PromotionFormValue {
  const imageUrl = String(promotion?.imageUrl ?? promotion?.file ?? "");

  return {
    id:
      promotion?.id === undefined || promotion?.id === null
        ? undefined
        : String(promotion.id),
    title: String(promotion?.title ?? ""),
    content: String(promotion?.content ?? ""),
    file: imageUrl,
    imageUrl,
    type: String(promotion?.type ?? (mode === "add" ? "web" : "sport_web")),
    startDate: String(promotion?.startDate ?? ""),
    endDate: String(promotion?.endDate ?? ""),
    targetUrl: String(promotion?.targetUrl ?? ""),
    clientId: String(
      promotion?.clientId ?? process.env.NEXT_PUBLIC_CLIENT_ID ?? ""
    ),
  };
}

export function promotionId(promotion: PromotionRecord) {
  return String(promotion.id ?? "");
}

export function promotionTitle(promotion: PromotionRecord) {
  return String(promotion.title ?? "Untitled promotion");
}

export function promotionContent(promotion: PromotionRecord) {
  return String(promotion.content ?? "");
}

export function promotionImage(promotion: PromotionRecord) {
  return String(promotion.imageUrl ?? promotion.file ?? "");
}

export function promotionType(promotion: PromotionRecord) {
  return String(promotion.type ?? "");
}

export function promotionStartDate(promotion: PromotionRecord) {
  return String(promotion.startDate ?? "");
}

export function promotionEndDate(promotion: PromotionRecord) {
  return String(promotion.endDate ?? "");
}

export function promotionTargetUrl(promotion: PromotionRecord) {
  return String(promotion.targetUrl ?? "");
}

export function promotionStatus(
  promotion: PromotionRecord,
  today = localDateString()
): PromotionStatus {
  const startDate = promotionStartDate(promotion);
  const endDate = promotionEndDate(promotion);

  if (startDate && startDate > today) return "scheduled";
  if (endDate && endDate < today) return "expired";
  return "active";
}

export async function fetchPromotions() {
  const response = await GETREQUEST<unknown>(
    `/admin/games/promotions?clientId=${endpointClientId()}`
  );

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load promotions");
  }

  return promotionListFrom(response.data);
}

export async function fetchPromotion(id: string) {
  const response = await GETREQUEST<unknown>(
    `/admin/games/promotion?id=${encodeURIComponent(id)}`
  );

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load promotion");
  }

  return promotionRecordFrom(response.data);
}

export async function createPromotion(value: PromotionFormValue) {
  const response = await POSTREQUEST<unknown>(
    "/admin/games/add-promotion",
    buildPromotionPayload(value, "add")
  );

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to create promotion");
  }

  return response.data;
}

export async function updatePromotion(value: PromotionFormValue) {
  const response = await POSTREQUEST<unknown>(
    "/admin/games/update-promotion",
    buildPromotionPayload(value, "edit")
  );

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to update promotion");
  }

  return response.data;
}

export async function deletePromotion(id: string) {
  const response = await DELETEREQUEST<unknown>(
    `/admin/games/promotion?id=${encodeURIComponent(id)}`
  );

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to delete promotion");
  }

  return response.data;
}
