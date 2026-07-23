import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";
import { getStoredToken } from "@/utils/session";

import { fetchSportsMenu, type CategoryNode, type SportNode, type TournamentNode } from "../sports-menu/api";

type AnyRecord = Record<string, any>;

export type FixtureSport = {
  id: string;
  sportId: string;
  label: string;
  raw: AnyRecord;
};

export type MarketGroup = {
  id: string;
  marketGroupId: string;
  name: string;
  raw: AnyRecord;
};

export type MarketType = {
  id: string;
  providerId: string;
  marketId: string;
  name: string;
  raw: AnyRecord;
};

export type MarketOutcome = {
  outcomeName: string;
  outcomeID: string;
  specifier: string;
  codeWA: string;
  codeEA: string;
  status: number;
};

export type MarketRecord = {
  id: string;
  marketId: string;
  sportId: string;
  groupId: string;
  marketTypeId: string;
  name: string;
  displayName: string;
  description: string;
  specifier: string;
  status: number;
  enableCashout: number;
  isDefault: number;
  priority: string;
  outcomes: MarketOutcome[];
  raw: AnyRecord;
};

export type SettingsMarket = {
  id: string;
  name: string;
  raw: AnyRecord;
};

export type SettingsSport = {
  id: string;
  providerId: string;
  name: string;
  markets: SettingsMarket[];
  raw: AnyRecord;
};

export type TournamentMarket = {
  id: string;
  name: string;
  status: number;
  cashOutStatus: number;
  raw: AnyRecord;
};

export type MarketSavePayload = {
  sportID: string;
  marketID: string;
  groupID: string;
  name: string;
  displayName: string;
  description: string;
  isDefault: number;
  enableCashout: number;
  status: number;
  specifier: string;
  priority: number;
  id: string;
  sport_id: string;
  market_group_id: string;
  market_type_id: string;
};

export type SaveOutcomesPayload = {
  outcomes: MarketOutcome[];
  marketID: string;
  marketName: string;
  internalMarketID: string;
};

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? (value as AnyRecord) : {};
}

function stringValue(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function numberValue(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function listFrom(value: unknown): AnyRecord[] {
  if (Array.isArray(value)) return value as AnyRecord[];

  const record = asRecord(value);
  if (Array.isArray(record.data)) return record.data as AnyRecord[];
  if (Array.isArray(record.data?.data)) return record.data.data as AnyRecord[];
  if (Array.isArray(record.sports)) return record.sports as AnyRecord[];
  if (Array.isArray(record.groups)) return record.groups as AnyRecord[];
  if (Array.isArray(record.markets)) return record.markets as AnyRecord[];

  return [];
}

function requestSucceeded(value: unknown) {
  const record = asRecord(value);
  return record.success === true || record.status === true || record.status_code === 200 || record.status_code === 201;
}

function envBase(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key as keyof NodeJS.ProcessEnv];
    if (typeof value === "string" && value.trim()) {
      return value.replace(/\/+$/, "");
    }
  }
  return "";
}

function externalUrl(base: string, path: string) {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function authHeaders(json = true) {
  const headers: Record<string, string> = {
    "client-code": process.env.NEXT_PUBLIC_CLIENT_CODE ?? "",
    "SBE-Client-ID": process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
    "sbe-client-id": process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
  };
  const token = getStoredToken();

  if (json) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = token;

  return headers;
}

async function requestExternalJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders(init?.body instanceof FormData ? false : true),
      ...(init?.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.message || body?.error || body?.status_description || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}

function fixtureSportFrom(value: unknown): FixtureSport {
  const record = asRecord(value);
  const id = stringValue(record.id ?? record.sportID ?? record.sportId);

  return {
    id,
    sportId: stringValue(record.sportID ?? record.sportId ?? record.id),
    label: stringValue(record.sportName ?? record.sport_name ?? record.name ?? id),
    raw: record,
  };
}

function marketGroupFrom(value: unknown): MarketGroup {
  const record = asRecord(value);

  return {
    id: stringValue(record.id ?? record.marketGroupID),
    marketGroupId: stringValue(record.marketGroupID ?? record.id),
    name: stringValue(record.groupName ?? record.name),
    raw: record,
  };
}

function marketTypeFrom(value: unknown): MarketType {
  const record = asRecord(value);

  return {
    id: stringValue(record.provider_id ?? record.marketID ?? record.id),
    providerId: stringValue(record.provider_id ?? record.id),
    marketId: stringValue(record.marketID ?? record.provider_id ?? record.id),
    name: stringValue(record.marketName ?? record.name),
    raw: record,
  };
}

function outcomeFrom(value: unknown): MarketOutcome {
  const record = asRecord(value);

  return {
    outcomeName: stringValue(record.outcomeName),
    outcomeID: stringValue(record.outcomeID),
    specifier: stringValue(record.specifier),
    codeWA: stringValue(record.codeWA),
    codeEA: stringValue(record.codeEA),
    status: numberValue(record.status, 1) ? 1 : 0,
  };
}

function marketRecordFrom(value: unknown): MarketRecord {
  const record = asRecord(value);

  return {
    id: stringValue(record.id),
    marketId: stringValue(record.marketID ?? record.marketId ?? record.market_type_id ?? record.id),
    sportId: stringValue(record.sportID ?? record.sport_id ?? record.sportId),
    groupId: stringValue(record.groupID ?? record.market_group_id ?? record.marketGroupID),
    marketTypeId: stringValue(record.market_type_id ?? record.marketID ?? record.marketId),
    name: stringValue(record.marketName ?? record.name),
    displayName: stringValue(record.displayName),
    description: stringValue(record.description),
    specifier: stringValue(record.specifier),
    status: numberValue(record.status, 0),
    enableCashout: numberValue(record.hasCashout ?? record.enableCashout, 0),
    isDefault: numberValue(record.isPopular ?? record.isDefault, 0),
    priority: stringValue(record.priority, "0"),
    outcomes: Array.isArray(record.outcomes) ? record.outcomes.map(outcomeFrom) : [],
    raw: record,
  };
}

function settingsMarketFrom(value: unknown): SettingsMarket {
  const record = asRecord(value);

  return {
    id: stringValue(record.id ?? record.marketID ?? record.marketId),
    name: stringValue(record.name ?? record.marketName),
    raw: record,
  };
}

function settingsSportFrom(value: unknown): SettingsSport {
  const record = asRecord(value);

  return {
    id: stringValue(record.id ?? record.sportID ?? record.sportId),
    providerId: stringValue(record.provider_id ?? record.sportID ?? record.id),
    name: stringValue(record.name ?? record.sportName ?? record.sport_name),
    markets: listFrom(record.markets).map(settingsMarketFrom),
    raw: record,
  };
}

function tournamentMarketFrom(value: unknown): TournamentMarket {
  const record = asRecord(value);
  const pivot = asRecord(record.pivot);

  return {
    id: stringValue(record.id ?? record.marketID),
    name: stringValue(record.name ?? record.marketName),
    status: numberValue(pivot.status ?? record.status, 0),
    cashOutStatus: numberValue(pivot.cash_out_status ?? record.cash_out_status ?? record.enableCashout, 0),
    raw: record,
  };
}

function clientId() {
  return process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
}

function fixtureBase() {
  return envBase(
    "NEXT_PUBLIC_FIXTURE_API",
    "NEXT_PUBLIC_FIXTURE_API_URL",
    "NEXT_PUBLIC_BETTING_API",
    "NEXT_PUBLIC_BETTING_API_URL",
    "NEXT_PUBLIC_BASE_URL"
  );
}

export function emptyOutcome(): MarketOutcome {
  return {
    outcomeName: "",
    outcomeID: "",
    specifier: "",
    codeWA: "",
    codeEA: "",
    status: 1,
  };
}

export async function fetchFixtureSports() {
  const base = fixtureBase();
  if (!base) {
    throw new Error("Fixture API is not configured");
  }

  const body = await requestExternalJson<unknown>(externalUrl(base, "sports"));
  return listFrom(body).map(fixtureSportFrom);
}

export async function fetchMarketGroups(sportId: string) {
  const response = await GETREQUEST<unknown>(`/admin/sports/${clientId()}/market/${encodeURIComponent(sportId)}/groups`);

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load market groups");
  }

  return listFrom(response.data).map(marketGroupFrom);
}

export async function fetchMarkets(sportId: string, groupId: string | null) {
  const query = new URLSearchParams({
    sport_id: sportId,
    group_id: groupId ?? "",
  });
  const response = await GETREQUEST<unknown>(`/admin/sports/${clientId()}/markets/list?${query.toString()}`);

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load markets");
  }

  return listFrom(response.data).map(marketRecordFrom);
}

export async function fetchBetradarMarkets() {
  const response = await GETREQUEST<unknown>("/admin/sports/markets/betradar");

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load BetRadar markets");
  }

  return listFrom(response.data).map(marketTypeFrom);
}

export async function saveMarket(payload: MarketSavePayload) {
  const response = await POSTREQUEST<unknown>(`/admin/sports/${clientId()}/markets/save`, payload);

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to save market");
  }

  return response.data;
}

export async function saveMarketOutcomes(payload: SaveOutcomesPayload) {
  const response = await POSTREQUEST<unknown>(`/admin/sports/${clientId()}/markets/save-outcomes`, payload);

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to save market outcomes");
  }

  return response.data;
}

export async function fetchMarketSettingsSports() {
  const response = await GETREQUEST<unknown>("/admin/content-management/markets");

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load market settings");
  }

  return listFrom(response.data).map(settingsSportFrom);
}

export async function fetchMarketSettingsMenu() {
  return fetchSportsMenu();
}

export async function fetchTournamentMarkets(tournamentId: string) {
  const response = await GETREQUEST<unknown>(`/markets/markets-list/${encodeURIComponent(tournamentId)}`);

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load tournament markets");
  }

  return listFrom(response.data).map(tournamentMarketFrom);
}

export async function addTournamentMarkets(tournamentId: string, marketIds: string[]) {
  const response = await POSTREQUEST<unknown>(`/markets/add/${encodeURIComponent(tournamentId)}/tournament`, {
    market_ids: marketIds,
  });

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to add markets");
  }

  return response.data;
}

export async function removeTournamentMarkets(tournamentId: string, marketIds: string[]) {
  const response = await POSTREQUEST<unknown>(`/markets/remove/${encodeURIComponent(tournamentId)}/tournament`, {
    market_ids: marketIds,
  });

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to remove market");
  }

  return response.data;
}

export async function toggleTournamentMarketCashout(tournamentId: string, marketId: string) {
  const response = await POSTREQUEST<unknown>("/markets/toggle/cash-out", {
    sports_tournament_id: tournamentId,
    market_id: marketId,
  });

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to toggle cashout");
  }

  return response.data;
}

export async function toggleTournamentMarketStatus(tournamentId: string, marketId: string) {
  const response = await POSTREQUEST<unknown>("/markets/toggle/status", {
    sports_tournament_id: tournamentId,
    market_id: marketId,
  });

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to toggle market status");
  }

  return response.data;
}

export function marketGroupLabel(group: MarketGroup | null) {
  return group?.name || "None";
}

export function matchesMenuSport(node: SportNode, sport: SettingsSport | null) {
  if (!sport) return false;

  const candidates = new Set([
    stringValue(sport.raw.id),
    stringValue(sport.raw.provider_id),
    stringValue(sport.raw.sportID),
    stringValue(sport.raw.sportId),
    sport.id,
    sport.providerId,
  ]);
  const nodeName = stringValue(node.name).trim().toLowerCase();
  const sportName = stringValue(sport.name || sport.raw.name || sport.raw.sportName || sport.raw.sport_name)
    .trim()
    .toLowerCase();

  return candidates.has(node.id) || candidates.has(node.providerId) || (nodeName && nodeName === sportName);
}

export function findMenuSport(menu: SportNode[], sport: SettingsSport | null) {
  return menu.find((node) => matchesMenuSport(node, sport)) ?? null;
}

export function findMenuCategory(sport: SportNode | null, categoryId: string) {
  return sport?.categories.find((category) => category.id === categoryId || category.providerId === categoryId) ?? null;
}

export function findMenuTournament(category: CategoryNode | null, tournamentId: string) {
  return (
    category?.tournaments.find(
      (tournament) => tournament.id === tournamentId || tournament.providerId === tournamentId
    ) ?? null
  );
}

export type { CategoryNode, SportNode, TournamentNode };
