const fullEndpoint = (url: string) =>
  `${process.env.NEXT_PUBLIC_BASE_URL}${
    url.startsWith("/") ? url.replace("/", "") : url
  }`;

export const ApiRequest = async (url: string, method: string, data = null) => {
  try {
    const response = await fetch(fullEndpoint(url), {
      method,
      headers: {
        "Content-Type": "application/json",
        "client-code": process.env.NEXT_PUBLIC_CLIENT_CODE ?? "",
        "sbe-client-id": process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    const responseData = await response.json().catch(() => null);
    return {
      data: responseData,
      status: response.status,
    };
  } catch {
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
