import qs from "qs";

export interface Params {
  [key: string]: any;
}

export interface Payload {
  [key: string]: any;
}

export function request<T>(
  method: "get" | "GET" | "post" | "POST",
  fullpath: string,
  options?: {
    params?: Params;
    payload?: Payload;
  }
): Promise<T> {
  let requestUrl = fullpath;
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  const params = options?.params;
  const payload = options?.payload;
  if ((method === "get" || method === "GET") && params) {
    requestUrl += `?${qs.stringify(params)}`;
  }
  if ((method === "post" || method === "POST") && payload) {
    Reflect.set(config, "body", JSON.stringify(payload));
  }
  return fetch(requestUrl, config).then((response) => {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
  });
}

const BASE_URL = "https://my-json-server.typicode.com/ospoon/mock";

export function apiRouter(
  method: "get" | "post",
  path: string,
  options: {
    background: boolean;
    params?: Params | undefined;
    payload?: Payload | undefined;
  }
) {
  const { background, params, payload } = options;
  if (background && import.meta.env.MODE === "production") {
    return backgroundRoute(method, path, {
      params,
      payload,
    });
  } else {
    return immediateRoute(method, path, {
      params,
      payload,
    });
  }
}

export function immediateRoute(
  method: "get" | "post",
  path: string,
  options: {
    params?: Params | undefined;
    payload?: Payload | undefined;
  }
) {
  return request(method, `${BASE_URL}/${path}`, options);
}

export function backgroundRoute(
  method: "get" | "post",
  path: string,
  options: {
    params?: Params | undefined;
    payload?: Payload | undefined;
  }
) {
  return new Promise((resolve, reject) => {
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage(
        {
          contentRequest: "api-request",
          data: {
            method,
            path,
            options,
          },
        },
        (result) => {
          const { _code, data, error } = result;
          if (_code === "success") {
            resolve(data);
          } else if (_code === "fail") {
            reject(error);
          }
        }
      );
    } else {
      reject("chrome api not defined");
    }
  });
}
