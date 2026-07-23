import { getStoredToken } from "@/utils/session";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiResponse<T = unknown> = {
  data: T | null;
  status: number;
  ok: boolean;
  error?: string;
};

const textEncoder = new TextEncoder();

function trimSlashes(value: string, side: "left" | "right" | "both" = "both") {
  if (side === "left") return value.replace(/^\/+/, "");
  if (side === "right") return value.replace(/\/+$/, "");
  return value.replace(/^\/+|\/+$/g, "");
}

function fullEndpoint(url: string) {
  if (/^https?:\/\//i.test(url)) return url;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  return `${trimSlashes(baseUrl, "right")}/${trimSlashes(url, "left")}`;
}

function bytesToHex(bytes: ArrayBuffer | Uint8Array) {
  return Array.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(value: string) {
  if (!globalThis.crypto?.subtle) return "";

  const hash = await globalThis.crypto.subtle.digest(
    "SHA-256",
    textEncoder.encode(value)
  );
  return bytesToHex(hash);
}

async function createApiSignature(apiKeyHex: string) {
  if (!globalThis.crypto?.subtle || !apiKeyHex) return "";

  const iv = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const keyBytes = new Uint8Array(
    apiKeyHex.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []
  );
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,
    ["encrypt"]
  );
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const encrypted = await globalThis.crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    textEncoder.encode(timestamp)
  );

  return `${bytesToHex(iv)}${bytesToHex(encrypted)}`;
}

async function buildHeaders(includeJsonContentType = true) {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
  const siteKey = process.env.NEXT_PUBLIC_SITE_KEY ?? "";
  const token = getStoredToken();
  const apiKey = clientId && siteKey ? await sha256Hex(`${clientId}:${siteKey}`) : "";
  const signature = apiKey ? await createApiSignature(apiKey) : "";

  const headers: Record<string, string> = {
    "client-code": process.env.NEXT_PUBLIC_CLIENT_CODE ?? "",
    "SBE-Client-ID": clientId,
    "sbe-client-id": clientId,
  };

  if (includeJsonContentType) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers.Authorization = token;
  if (apiKey) headers["SBE-API-KEY"] = apiKey;
  if (signature) headers["SBE-API-SIGNATURE"] = signature;

  return headers;
}

function extractError(data: any, fallback: string) {
  return (
    data?.error ||
    data?.message ||
    data?.data?.error ||
    data?.data?.message ||
    fallback
  );
}

export const ApiRequest = async <T = unknown>(
  url: string,
  method: HttpMethod,
  data: unknown = null
): Promise<ApiResponse<T>> => {
  try {
    const isFormDataPayload =
      typeof FormData !== "undefined" && data instanceof FormData;

    const response = await fetch(fullEndpoint(url), {
      method,
      headers: await buildHeaders(!isFormDataPayload),
      ...(data !== null && data !== undefined
        ? { body: isFormDataPayload ? data : JSON.stringify(data) }
        : {}),
    });
    const responseData = (await response.json().catch(() => null)) as T | null;

    return {
      data: responseData,
      status: response.status,
      ok: response.ok,
      error: response.ok
        ? undefined
        : extractError(responseData, `Request failed with status ${response.status}`),
    };
  } catch (error) {
    return {
      data: null,
      status: 500,
      ok: false,
      error: error instanceof Error ? error.message : "Network request failed",
    };
  }
};

export const GETREQUEST = async <T = unknown>(url: string) => {
  return ApiRequest<T>(url, "GET");
};

export const POSTREQUEST = async <T = unknown>(url: string, data: unknown) => {
  return ApiRequest<T>(url, "POST", data);
};

export const PUTREQUEST = async <T = unknown>(url: string, data: unknown) => {
  return ApiRequest<T>(url, "PUT", data);
};

export const PATCHREQUEST = async <T = unknown>(url: string, data: unknown) => {
  return ApiRequest<T>(url, "PATCH", data);
};

export const DELETEREQUEST = async <T = unknown>(url: string, data?: unknown) => {
  return ApiRequest<T>(url, "DELETE", data ?? null);
};
