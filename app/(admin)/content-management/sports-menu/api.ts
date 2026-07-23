import { GETREQUEST, POSTREQUEST, PUTREQUEST } from "@/utils/base_request";

type AnyRecord = Record<string, any>;

export type SportsMenuStatus = "1" | "0";

export type TournamentNode = {
  id: string;
  providerId: string;
  name: string;
  order: string;
  status: SportsMenuStatus;
  imagePath: string;
  sportCategoryId: string;
};

export type CategoryNode = {
  id: string;
  providerId: string;
  name: string;
  order: string;
  status: SportsMenuStatus;
  sportId: string;
  tournaments: TournamentNode[];
};

export type SportNode = {
  id: string;
  providerId: string;
  name: string;
  order: string;
  status: SportsMenuStatus;
  categories: CategoryNode[];
};

export type SportFormPayload = {
  id?: string;
  name: string;
  order: string;
  status: SportsMenuStatus;
};

export type CategoryFormPayload = {
  id?: string;
  name: string;
  sport_id: string;
  sport: string;
  order: string;
  status: SportsMenuStatus;
};

export type TournamentFormPayload = {
  id?: string;
  name: string;
  sport: string;
  sport_category_id: string;
  order: string;
  status: SportsMenuStatus;
  image_path: string;
};

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? (value as AnyRecord) : {};
}

function stringValue(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function statusValue(value: unknown): SportsMenuStatus {
  return value === 0 || value === "0" || value === false || value === "Inactive" ? "0" : "1";
}

function requestSucceeded(value: unknown) {
  const record = asRecord(value);
  return record.success === true || record.status === true || record.status_code === 200 || record.status_code === 201;
}

function tournamentFrom(value: unknown): TournamentNode {
  const record = asRecord(value);

  return {
    id: stringValue(record.id ?? record.provider_id),
    providerId: stringValue(record.provider_id ?? record.id),
    name: stringValue(record.tournament_name ?? record.name),
    order: stringValue(record.order ?? "1000"),
    status: statusValue(record.status),
    imagePath: stringValue(record.image_path),
    sportCategoryId: stringValue(record.sport_category_id ?? record.category_id),
  };
}

function categoryFrom(value: unknown): CategoryNode {
  const record = asRecord(value);
  const tournaments = Array.isArray(record.tournaments) ? record.tournaments : [];

  return {
    id: stringValue(record.id ?? record.provider_id),
    providerId: stringValue(record.provider_id ?? record.id),
    name: stringValue(record.category_name ?? record.name),
    order: stringValue(record.order ?? "1000"),
    status: statusValue(record.status),
    sportId: stringValue(record.sport_id),
    tournaments: tournaments.map(tournamentFrom),
  };
}

function sportFrom(value: unknown): SportNode {
  const record = asRecord(value);
  const categories = Array.isArray(record.categories) ? record.categories : [];

  return {
    id: stringValue(record.id ?? record.provider_id),
    providerId: stringValue(record.provider_id ?? record.id),
    name: stringValue(record.sport_name ?? record.name),
    order: stringValue(record.order ?? "1000"),
    status: statusValue(record.status),
    categories: categories.map(categoryFrom),
  };
}

export function serializeSportsMenu(menu: SportNode[]) {
  return menu.map((sport) => ({
    id: sport.id,
    children: sport.categories.map((category) => ({
      cid: category.id,
      children: category.tournaments.map((tournament) => ({
        tid: tournament.id,
      })),
    })),
  }));
}

export async function fetchSportsMenu() {
  const response = await GETREQUEST<unknown>("/admin/sports/get-menu");

  if (!response.ok) {
    throw new Error(response.error ?? "Unable to load sports menu");
  }

  const body = asRecord(response.data);
  const parsedMenu = typeof body.menu === "string" ? JSON.parse(body.menu) : body.menu;

  return Array.isArray(parsedMenu) ? parsedMenu.map(sportFrom) : [];
}

export async function saveSport(payload: SportFormPayload) {
  const response = await POSTREQUEST<unknown>("/api/admin/content-management/sports-menu/save-sport", payload);

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to save sport");
  }
}

export async function saveCategory(payload: CategoryFormPayload) {
  const response = await POSTREQUEST<unknown>("/api/admin/content-management/sports-menu/save-category", payload);

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to save category");
  }
}

export async function saveTournament(payload: TournamentFormPayload) {
  const response = await POSTREQUEST<unknown>("/api/admin/content-management/sports-menu/save-tournament", payload);

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to save tournament");
  }
}

export async function updateSportsMenuOrder(menu: SportNode[]) {
  const response = await PUTREQUEST<unknown>("/admin/sports/update/sports-menu", {
    data: serializeSportsMenu(menu),
  });

  if (!response.ok || !requestSucceeded(response.data)) {
    throw new Error(response.error ?? "Unable to update sports menu order");
  }
}
