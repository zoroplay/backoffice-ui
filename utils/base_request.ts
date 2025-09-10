import axios from "axios";
import { s } from "vitest/dist/chunks/reporters.d.DL9pg5DB.js";

const fullEndpoint = (url: string) =>
  `${process.env.NEXT_PUBLIC_BASE_URL}${
    url.startsWith("/") ? url.replace("/", "") : url
  }`;

export const ApiRequest = async (url: string, method: string, data = null) => {
  const options = {
    method: method,
    url: fullEndpoint(url),
    headers: {
      "Content-Type": "application/json",
      "client-code": "SBE",
      "sbe-client-id": 4,
    },
    data: data,
  };

  try {
    const response = await axios(options);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        data: error.response.data,
        status: error.response.status,
      };
    }
    return {
      data: null,
      status: 500,
    };
  }
};

export const GETREQUEST = async (url: string) => {
  return ApiRequest(url, "GET");
};

export const POSTREQUEST = async (url: string, data: any) => {
  return ApiRequest(url, "POST", data);
};

export const PUTREQUEST = async (url: string, data: any) => {
  return ApiRequest(url, "PUT", data);
};
