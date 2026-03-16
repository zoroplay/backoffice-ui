const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const baseFromLegacyEnv = process.env.NEXT_PUBLIC_BASE_URL ?? "";

// Keep backward compatibility with existing env naming in this repo.
const defaultNewApiBase = trimTrailingSlash(baseFromLegacyEnv);
const defaultLegacyApiBase = trimTrailingSlash(
  process.env.NEXT_PUBLIC_API_BASE_URL ??
    (defaultNewApiBase.endsWith("/api/v2")
      ? defaultNewApiBase.slice(0, -"/api/v2".length)
      : defaultNewApiBase)
);

export const apiEnv = {
  clientCode: process.env.NEXT_PUBLIC_CLIENT_CODE ?? "SBE",
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID ?? "4",
  siteKey: process.env.NEXT_PUBLIC_SITE_KEY ?? process.env.SBE_SITE_KEY ?? "",
  legacyApiBase: defaultLegacyApiBase,
  newApiBase: trimTrailingSlash(
    process.env.NEXT_PUBLIC_NEW_API_BASE_URL ?? defaultNewApiBase
  ),
} as const;

