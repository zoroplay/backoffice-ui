import axios, { AxiosHeaders, AxiosInstance } from "axios";
import { apiEnv } from "./env";
import { buildSecurityHeaders, getAuthToken } from "./security";

export type ApiErrorPayload = {
  status?: number;
  message?: string;
  error?: string;
  [key: string]: unknown;
};

export const normalizeApiError = (error: unknown): ApiErrorPayload => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorPayload | undefined;
    return (
      payload ?? {
        status: error.response?.status ?? 500,
        message: error.message,
      }
    );
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
