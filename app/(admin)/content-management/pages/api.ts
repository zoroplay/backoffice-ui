import { DELETEREQUEST, GETREQUEST, POSTREQUEST, PUTREQUEST } from "@/utils/base_request";
import { getStoredSession } from "@/utils/session";

export type ContentPageTarget = "web" | "mobile";

export type ContentPageRecord = {
  id?: string | number;
  title?: string;
  slug?: string;
  content?: string;
  target?: ContentPageTarget | string;
  createdBy?: string;
  clientId?: string;
  [key: string]: unknown;
};

export type ContentPageFormValue = {
  id?: string;
  title: string;
  slug: string;
  content: string;
  target: ContentPageTarget;
  createdBy: string;
  clientId: string;
};

type AnyRecord = Record<string, any>;

export const defaultContentPageForm: ContentPageFormValue = {
  title: "",
  slug: "",
  content: "",
  target: "web",
  createdBy: "",
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
};

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? (value as AnyRecord) : {};
}

function endpointClientId() {
  return encodeURIComponent(process.env.NEXT_PUBLIC_CLIENT_ID ?? "");
}

export function slugifyPageTitle(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

export function pageId(page: ContentPageRecord) {
  return String(page.id ?? "");
}

export function pageTarget(page: ContentPageRecord): ContentPageTarget {
  return String(page.target ?? "web").toLowerCase() === "mobile" ? "mobile" : "web";
}

export function pageTitle(page: ContentPageRecord) {
  return String(page.title ?? "Untitled page");
}

export function pageCreatedBy(page: ContentPageRecord) {
  return String(page.createdBy ?? "");
}

export function pageListFrom(value: unknown): ContentPageRecord[] {
  if (Array.isArray(value)) return value as ContentPageRecord[];

  const record = asRecord(value);
  if (Array.isArray(record.data)) return record.data as ContentPageRecord[];
  if (record.data && typeof record.data === "object") return Object.values(record.data) as ContentPageRecord[];
  if (Array.isArray(record.pages)) return record.pages as ContentPageRecord[];

  return [];
}

export function pageRecordFrom(value: unknown): ContentPageRecord | null {
  const record = asRecord(value);
  const data = record.data;

  if (data && !Array.isArray(data) && typeof data === "object") return data as ContentPageRecord;
  if (record.id || record.title) return record as ContentPageRecord;

  return null;
}

export function requestSucceeded(value: unknown) {
  const record = asRecord(value);
  return record.success === true || record.status === true || record.status_code === 200 || record.status_code === 201;
}

export function currentUserName() {
  const user = getStoredSession()?.user;
  const firstName = typeof user?.firstName === "string" ? user.firstName : "";
  const lastName = typeof user?.lastName === "string" ? user.lastName : "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || user?.name || user?.username || user?.email || "Admin";
}

export function normalizePageForm(page?: Partial<ContentPageRecord> | null): ContentPageFormValue {
  const title = String(page?.title ?? "");

  return {
    id: page?.id === undefined || page?.id === null ? undefined : String(page.id),
    title,
    slug: String(page?.slug ?? (title ? slugifyPageTitle(title) : "")),
    content: String(page?.content ?? ""),
    target: pageTarget(page ?? {}),
    createdBy: String(page?.createdBy || currentUserName()),
    clientId: String(page?.clientId || process.env.NEXT_PUBLIC_CLIENT_ID || ""),
  };
}

export async function fetchContentPages() {
  const response = await GETREQUEST<unknown>(`/admin/content-management/pages?clientId=${endpointClientId()}`);

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load pages");
  }

  return pageListFrom(response.data);
}

export async function fetchContentPage(id: string) {
  const response = await GETREQUEST<unknown>(`/admin/content-management/page/${encodeURIComponent(id)}?clientId=${endpointClientId()}`);

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load page");
  }

  return pageRecordFrom(response.data);
}

export async function createContentPage(value: ContentPageFormValue) {
  const response = await POSTREQUEST<unknown>("/admin/content-management/create-page", {
    ...value,
    slug: slugifyPageTitle(value.title),
    createdBy: value.createdBy || currentUserName(),
    clientId: value.clientId || process.env.NEXT_PUBLIC_CLIENT_ID || "",
  });

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to create page.");
  }

  return response.data;
}

export async function updateContentPage(value: ContentPageFormValue) {
  const response = await PUTREQUEST<unknown>("/admin/content-management/page", {
    ...value,
    slug: slugifyPageTitle(value.title),
    clientId: value.clientId || process.env.NEXT_PUBLIC_CLIENT_ID || "",
  });

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to update page.");
  }

  return response.data;
}

export async function deleteContentPage(id: string) {
  const response = await DELETEREQUEST<unknown>(`/admin/content-management/page/${encodeURIComponent(id)}?clientId=${endpointClientId()}`);

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to delete page.");
  }

  return response.data;
}
