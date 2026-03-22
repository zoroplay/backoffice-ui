import axios, { AxiosHeaders, AxiosInstance } from "axios";
import { apiEnv } from "./env";
import { buildSecurityHeaders, getAuthToken } from "./security";

export type ApiErrorPayload = {
  status?: number;
  statusCode?: number;
  message?: string;
  error?: string;
  [key: string]: unknown;
};

export const normalizeApiError = (error: unknown): ApiErrorPayload => {
  const unauthorizedMessage = "Session expired. Please log in again.";
  const notFoundMessage = "Resource not found.";

  if (error && typeof error === "object") {
    const maybePayload = error as ApiErrorPayload;
    const hasKnownShape =
      typeof maybePayload.message === "string" ||
      typeof maybePayload.status === "number" ||
      typeof maybePayload.statusCode === "number";

    if (hasKnownShape) {
      const status = maybePayload.status ?? maybePayload.statusCode;
      if (status === 401) {
        return {
          ...maybePayload,
          status: 401,
          statusCode: 401,
          message: unauthorizedMessage,
        };
      }
      if (status === 404) {
        return {
          ...maybePayload,
          status: 404,
          statusCode: 404,
          message:
            (typeof maybePayload.error === "string" && maybePayload.error.trim()) ||
            notFoundMessage,
        };
      }
      return {
        ...maybePayload,
        status: status ?? 500,
      };
    }
  }

  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorPayload | undefined;
    const status = error.response?.status ?? payload?.statusCode ?? 500;
    const message =
      (status === 401
        ? unauthorizedMessage
        : status === 404
        ? (typeof payload?.error === "string" && payload.error.trim()) ||
          notFoundMessage
        : undefined) ??
      payload?.message ??
      error.message;

    return {
      ...(payload ?? {}),
      status,
      statusCode: payload?.statusCode ?? status,
      message,
    };
  }

  return {
    status: 500,
    message: "Unexpected error",
  };
};

const createInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(async (config) => {
    const headers = new AxiosHeaders(config.headers);
    const securityHeaders = await buildSecurityHeaders();

    Object.entries(securityHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    const token = getAuthToken();
    if (token) {
      headers.set(
        "Authorization",
        token.startsWith("Bearer ") ? token : `Bearer ${token}`
      );
      
    }

    config.headers = headers;
    return config;
  });

  return instance;
};

export const legacyApiClient = createInstance(apiEnv.legacyApiBase);
export const newApiClient = createInstance(apiEnv.newApiBase);

export const unwrapData = async <T>(
  request: Promise<{ data: T }>
): Promise<T> => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};
