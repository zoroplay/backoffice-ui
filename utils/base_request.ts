import axios from 'axios';

const fullEndpoint = (url) => `${process.env.NEXT_PUBLIC_BASE_URL}${url.startsWith("/") ? url.replace("/", "") : url}`;

export const ApiRequest = async (url, method, data = null) => {
  const options = {
    method: method,
    url: fullEndpoint(url),
    headers: {
      'Content-Type': 'application/json',
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
    return {
      data: error.response ? error.response.data : null,
      status: error.response ? error.response.status : 500,
    };
  }
};

export const GETREQUEST = async (url) => {
  return ApiRequest(url, 'GET');
};

export const POSTREQUEST = async (url, data) => {
  return ApiRequest(url, 'POST', data);
};

export const PUTREQUEST = async (url, data) => {
  return ApiRequest(url, 'PUT', data);
};