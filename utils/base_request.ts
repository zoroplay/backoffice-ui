import axios from "axios";
import { legacyApiClient, newApiClient, normalizeApiError } from "@/lib/api/client";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);
const isLegacyEndpoint = (url: string) => /^\/?api\//i.test(url);

const requestWithClient = (url: string) => {
  if (isAbsoluteUrl(url)) return axios;
  return isLegacyEndpoint(url) ? legacyApiClient : newApiClient;
};

const normalizePath = (url: string) => {
  if (isAbsoluteUrl(url)) return url;
  return url.startsWith("/") ? url : `/${url}`;
};

export const ApiRequest = async (url: string, method: Method, data: unknown = null) => {
  const requestClient = requestWithClient(url);
  const path = normalizePath(url);

  try {
    const response = await requestClient.request({
      method,
      url: path,
      data,
    });

    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    const normalized = normalizeApiError(error);
    return {
      data: normalized,
      status:
        typeof normalized.status === "number"
          ? normalized.status
          : 500,
    };
  }
};

export const GETREQUEST = async (url: string) => {
  return ApiRequest(url, "GET");
};

export const POSTREQUEST = async (url: string, data: unknown) => {
  return ApiRequest(url, "POST", data);
};

export const PUTREQUEST = async (url: string, data: unknown) => {
  return ApiRequest(url, "PUT", data);
};

export const PATCHREQUEST = async (url: string, data: unknown) => {
  return ApiRequest(url, "PATCH", data);
};

export const DELETEREQUEST = async (url: string, data: unknown = null) => {
  return ApiRequest(url, "DELETE", data);
};
