import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";
import {
  asRecord,
  clientId,
  emptyPagination,
  paginationFrom,
  toNumber,
} from "@/app/(admin)/tickets/components/ticketApiHelpers";

export type PlayerReportVariant = "online" | "frozen" | "inactive" | "registration";
export type ClientTypeFilter = "" | "client" | "web" | "mobile" | "retail";
export type RegistrationPeriod =
  | "today"
  | "yesterday"
  | "current_week"
  | "last_week"
  | "current_month"
  | "last_month"
  | "last_30_days"
  | "all_time"
  | "date_range";

export type CountryOption = {
  id: string;
  name: string;
};

export type StateOption = {
  id: string;
  name: string;
};

export type PlayerReportFilters = {
  country: string;
  state: string;
  username: string;
  source: ClientTypeFilter;
};

export type RegistrationFilters = {
  period: RegistrationPeriod;
  from: string;
  to: string;
};

export type PlayerReportRow = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  registered: string;
  lastLogin: string;
  balance: number;
  bonus: number;
  lifeTimeDeposit: number;
  lifeTimeWithdrawal: number;
  openBets: number;
  verified: boolean;
  statusCode: number;
  statusLabel: string;
  clientType: string;
  updatedAt: string;
};

function responseFailed(value: unknown) {
  const body = asRecord(value);
  return body.success === false || body.status === false;
}

function responseMessage(value: unknown, fallback: string) {
  const body = asRecord(value);
  return (
    body.message ||
    body.error ||
    asRecord(body.data).message ||
    asRecord(body.data).error ||
    fallback
  );
}

function responseList(value: unknown, key?: string) {
  const body = asRecord(value);
  const nested = asRecord(body.data);

  if (Array.isArray(body.data)) return body.data;
  if (key && Array.isArray(body[key])) return body[key];
  if (key && Array.isArray(nested[key])) return nested[key];
  if (Array.isArray(nested.data)) return nested.data;
  if (Array.isArray(value)) return value;

  return [];
}

function compactPayload<T extends Record<string, unknown>>(value: T) {
  const payload: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined || entry === null || entry === "") continue;
    payload[key] = entry;
  }

  return payload;
}

function playerStatusLabel(status: unknown) {
  const code = toNumber(status, -1);
  if (code === 0) return "Pending";
  if (code === 1) return "Active";
  if (code === 2) return "Inactive";
  if (code === 3) return "Frozen";
  if (code === 4) return "Terminated";
  return typeof status === "string" && status.trim() ? status : "Unknown";
}

function mapPlayerRow(value: unknown): PlayerReportRow {
  const row = asRecord(value);
  const firstName = String(row.firstName ?? row.firstname ?? "");
  const lastName = String(row.lastName ?? row.lastname ?? "");
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: String(row.id ?? row.user_id ?? row.playerId ?? ""),
    username: String(row.username ?? "-"),
    fullName: fullName || String(row.fullName ?? "-"),
    email: String(row.email ?? "-"),
    phoneNumber: String(row.phoneNumber ?? row.phone ?? "-"),
    registered: String(row.registered ?? row.created_at ?? row.createdAt ?? ""),
    lastLogin: String(row.lastLogin ?? row.last_login ?? ""),
    balance: toNumber(row.balance),
    bonus: toNumber(row.bonus),
    lifeTimeDeposit: toNumber(row.lifeTimeDeposit ?? row.lifeTimeDeposits),
    lifeTimeWithdrawal: toNumber(row.lifeTimeWithdrawal ?? row.lifeTimeWithdrawals),
    openBets: toNumber(row.openBets),
    verified:
      row.verified === true ||
      toNumber(row.verified, 0) === 1 ||
      String(row.verified ?? "")
        .trim()
        .toLowerCase() === "yes",
    statusCode: toNumber(row.status, -1),
    statusLabel: playerStatusLabel(row.status),
    clientType: String(row.clientType ?? row.source ?? row.channel ?? ""),
    updatedAt: String(row.updateAt ?? row.updatedAt ?? row.updated_at ?? ""),
  };
}

function queryString(payload: Record<string, unknown>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  return params.toString();
}

export function defaultPlayerReportFilters(): PlayerReportFilters {
  return {
    country: "",
    state: "",
    username: "",
    source: "",
  };
}

export async function fetchCountries() {
  const response = await GETREQUEST<unknown>("/content-management/countries");
  if (!response.ok || responseFailed(response.data)) {
    throw new Error(response.error ?? responseMessage(response.data, "Unable to load countries"));
  }

  return responseList(response.data, "countries").map((item) => {
    const row = asRecord(item);
    return {
      id: String(row.id ?? row.countryId ?? row.value ?? ""),
      name: String(row.name ?? row.country ?? row.label ?? ""),
    };
  });
}

export async function fetchStates(countryIdValue: string) {
  if (!countryIdValue) return [];

  const response = await GETREQUEST<unknown>(
    `/content-management/states/${encodeURIComponent(countryIdValue)}`
  );
  if (!response.ok || responseFailed(response.data)) {
    throw new Error(response.error ?? responseMessage(response.data, "Unable to load states"));
  }

  return responseList(response.data, "states").map((item) => {
    const row = asRecord(item);
    return {
      id: String(row.id ?? row.stateId ?? row.value ?? ""),
      name: String(row.name ?? row.state ?? row.label ?? ""),
    };
  });
}

export async function fetchPlayerReportPage(
  variant: Extract<PlayerReportVariant, "online" | "frozen" | "inactive">,
  filters: PlayerReportFilters,
  page: number
) {
  const payload = compactPayload({
    ...filters,
    clientId: clientId(),
    type: variant === "frozen" ? "frozen" : variant === "inactive" ? "inactive" : undefined,
  });

  const response = await POSTREQUEST<unknown>(`/admin/players/list?page=${page}`, payload);
  if (!response.ok || responseFailed(response.data)) {
    throw new Error(response.error ?? responseMessage(response.data, "Unable to load players"));
  }

  const rows = responseList(response.data).map(mapPlayerRow);
  const body = asRecord(response.data);
  const paginationSource = body.pagination ?? body.meta ?? body;

  return {
    rows,
    pagination: rows.length
      ? paginationFrom(paginationSource, page, rows.length)
      : {
          ...emptyPagination,
          current_page: page,
        },
  };
}

export async function fetchRegistrationReportPage(filters: RegistrationFilters, page: number) {
  const params = queryString(
    compactPayload({
      clientId: clientId(),
      from: filters.from,
      to: filters.to,
      limit: 100,
      page,
    })
  );

  const response = await GETREQUEST<unknown>(`/admin/players/registration?${params}`);
  if (!response.ok || responseFailed(response.data)) {
    throw new Error(
      response.error ?? responseMessage(response.data, "Unable to load registration report")
    );
  }

  const rows = responseList(response.data).map(mapPlayerRow);
  const body = asRecord(response.data);

  return {
    rows,
    pagination: rows.length
      ? paginationFrom(body, page, rows.length)
      : {
          ...emptyPagination,
          current_page: page,
        },
  };
}

export async function updatePlayerReportStatus(playerId: string, status: number) {
  const response = await GETREQUEST<unknown>(
    `/admin/players/update-status/${encodeURIComponent(playerId)}?status=${status}`
  );

  if (!response.ok || responseFailed(response.data)) {
    throw new Error(response.error ?? responseMessage(response.data, "Unable to update player status"));
  }

  return response.data;
}

export async function verifyPlayerReportAccount(playerId: string) {
  const response = await GETREQUEST<unknown>(
    `/api/admin/player-management/verify-account/${encodeURIComponent(playerId)}`
  );

  if (!response.ok || responseFailed(response.data)) {
    throw new Error(response.error ?? responseMessage(response.data, "Unable to verify player account"));
  }

  return response.data;
}
