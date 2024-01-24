export const BASE_URL = "https://my-json-server.typicode.com/ospoon/mock";

interface CallbackOption {
  success?: (result: any) => void;
  fail?: (error: any) => void;
  done?: () => void;
}

interface RequestOption extends CallbackOption {
  background?: boolean;
}

export function apiRouter(
  url: string,
  method: "get" | "post",
  body: object | null,
  options: RequestOption
) {
  const { background, success, fail, done } = options || {
    background: false,
  };
  if (background && import.meta.env.MODE === "production") {
    backgroundRoute(url, method, body, {
      success,
      fail,
      done,
    });
  } else {
    immediateRoute(url, method, body, {
      success,
      fail,
      done,
    });
  }
}

export function immediateRoute(
  url: string,
  method: "get" | "post",
  body: object | null,
  options: CallbackOption
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
        return res.json();
      })
      .then((json) => {
        options.done && options.done();
        options.success && options.success(json);
      })
      .catch((error) => {
        options.done && options.done();
        options.fail && options.fail(error);
      });
  } catch (error) {
    options.done && options.done();
    options.fail && options.fail(error);
  }
}

export function backgroundRoute(
  url: string,
  method: "get" | "post",
  body: object | null,
  options: CallbackOption
) {
  if (chrome && chrome.runtime) {
    chrome.runtime.sendMessage(
      {
        contentRequest: "api-request",
        data: {
          url,
          method,
          body,
          success: options.success,
          fail: options.fail,
        },
      },
      (result) => {
        if (result) {
          options.done && options.done();
          if (result._code === "success") {
            Reflect.deleteProperty(result, "_code");
            options.success && options.success(result);
          } else if (result._code === "fail") {
            options.fail && options.fail(result.message);
          }
        }
      }
    );
  } else {
    console.log("chrome api undefined");
  }
}
