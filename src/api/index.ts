export const BASE_URL = "https://my-json-server.typicode.com/ospoon/mock";

interface RequestOption {
  background: boolean;
  success: (result: any) => void;
  fail: (error: any) => void;
}

function apiRouter(
  url: string,
  method: "get" | "post",
  body: object | null,
  options: RequestOption
) {
  const { background, success, fail } = options || {
    background: false,
  };
  if (background && import.meta.env.MODE === "production") {
    backgroundRoute(url, method, body, success, fail);
  } else {
    immediateRoute(url, method, body, success, fail);
  }
}

export function immediateRoute(
  url: string,
  method: "get" | "post",
  body: object | null,
  success: (result: any) => void,
  fail: (error: any) => void
) {
  if (!body) body = {};

  const headers = {
    "Content-Type": "application/json;charset=UTF-8",
  };

  const request = {
    method,
    headers,
    body: JSON.stringify(body),
  };

  if (method === "get") {
    Reflect.deleteProperty(request, "body");
  }
  try {
    fetch(`${BASE_URL}/${url}`, request)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        // 解析JSON数据
        return res.json();
      })
      .then((json) => {
        success && success(json);
      })
      .catch((error) => {
        fail && fail(error);
      });
  } catch (error) {
    fail && fail(error);
  }
}

export function backgroundRoute(
  url: string,
  method: "get" | "post",
  body: object | null,
  success: (result: any) => void,
  fail: (error: any) => void
) {
  if (chrome && chrome.runtime) {
    chrome.runtime.sendMessage(
      {
        contentRequest: "api-request",
        options: {
          url,
          method,
          body,
          success,
          fail,
        },
      },
      (result) => {
        if (result.result === "success") {
          success && success(result);
        } else if (result.result === "fail") {
          fail && fail(result.msg);
        }
      }
    );
  } else {
    console.log("chrome api undefined");
  }
}

export const getProfile = async (
  success: (result: any) => void,
  fail: (error: any) => void
) => {
  apiRouter("profile", "get", null, {
    background: false,
    success,
    fail,
  });
};

export const getProfileByBackground = (
  success: (result: any) => void,
  fail: (error: any) => void
) => {
  apiRouter("profile", "get", null, { background: true, success, fail });
};
