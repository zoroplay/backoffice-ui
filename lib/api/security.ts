import { apiEnv } from "./env";

const encoder = new TextEncoder();
const AES_BLOCK_SIZE = 16;

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer =>
  bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");

const fromHex = (value: string): Uint8Array => {
  if (value.length % 2 !== 0) return new Uint8Array();

  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }

  return bytes;
};

const pkcs7Pad = (bytes: Uint8Array, blockSize = AES_BLOCK_SIZE): Uint8Array => {
  const remainder = bytes.length % blockSize;
  const padLength = remainder === 0 ? blockSize : blockSize - remainder;
  const padded = new Uint8Array(bytes.length + padLength);

  padded.set(bytes);
  padded.fill(padLength, bytes.length);

  return padded;
};

const getTokenFromStorage = (): string | null => {
  if (typeof window === "undefined") return null;

  const token = window.localStorage.getItem("token");
  if (!token) return null;

  try {
    const parsed = JSON.parse(token);
    return typeof parsed === "string" ? parsed : token;
  } catch {
    return token;
  }
};

const sha256Hex = async (value: string): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toHex(new Uint8Array(hashBuffer));
};

const encryptTimestamp = async (apiKeyHex: string): Promise<string> => {
  const keyBytes = fromHex(apiKeyHex);
  if (!keyBytes.length) return "";

  const iv = crypto.getRandomValues(new Uint8Array(16));
  const rawKey = toArrayBuffer(keyBytes);
  const ivBuffer = toArrayBuffer(iv);
  const aesKey = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-CBC" },
    false,
    ["encrypt"]
  );

  const timestamp = Math.floor(Date.now() / 1000).toString();
  // WebCrypto AES-CBC does not apply PKCS#7 automatically.
  const timestampBytes = pkcs7Pad(encoder.encode(timestamp));
  const timestampBuffer = toArrayBuffer(timestampBytes);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv: ivBuffer },
    aesKey,
    timestampBuffer
  );

  return `${toHex(iv)}${toHex(new Uint8Array(encrypted))}`;
};

export const buildSecurityHeaders = async () => {
  const headers: Record<string, string> = {
    "client-code": apiEnv.clientCode,
    "SBE-Client-ID": apiEnv.clientId,
  };

  if (!apiEnv.clientId || !apiEnv.siteKey) return headers;
  if (!globalThis.crypto?.subtle) return headers;

  const apiKey = await sha256Hex(`${apiEnv.clientId}:${apiEnv.siteKey}`);
  const signature = await encryptTimestamp(apiKey);

  headers["SBE-API-KEY"] = apiKey;
  headers["SBE-API-SIGNATURE"] = signature;

  return headers;
};

export const getAuthToken = () => getTokenFromStorage();
